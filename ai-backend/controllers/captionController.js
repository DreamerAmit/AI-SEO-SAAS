const sharp = require('sharp');
const OpenAI = require('openai');
const { toFile } = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs'); // For sync operations
const path = require('path');
const db = require('../config/database');
const { QueryTypes } = require('sequelize');
const multer = require('multer');
const { copyFile } = require('fs/promises');
const Client = require('ssh2-sftp-client');
const axios = require('axios');

// Use the same upload path and configuration as imageuploadController
const UPLOAD_PATH = '/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads/';
const isProduction = process.env.NODE_ENV === 'Production';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add the same directory check function as imageuploadController
const ensureUploadDir = () => {
  if (!fsSync.existsSync(UPLOAD_PATH)) {
    try {
      fsSync.mkdirSync(UPLOAD_PATH, { recursive: true });
      console.log(`Upload directory created successfully at: ${UPLOAD_PATH}`);
    } catch (err) {
      console.error(`Error creating upload directory at ${UPLOAD_PATH}:`, err);
      throw new Error('Failed to create upload directory');
    }
  }
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Direct server path for pic2alt.com
        const uploadPath = '/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads/';
        
        // Create directory if it doesn't exist
        if (!fsSync.existsSync(uploadPath)) {
            fsSync.mkdirSync(uploadPath, { recursive: true });
            console.log('Created uploads directory at:', uploadPath);
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, uniqueName);
    }
});

// Update multer instance with storage config
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

const editImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const userPrompt = req.body.prompt;
    const quality = req.body.quality || 'high';
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    // Ensure upload directory exists
    ensureUploadDir();
    
    console.log('Received file:', req.file);
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Is Production?', isProduction);

    const imageFile = req.file;
    
    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for image editing'
      });
    }

    console.log('Starting image edit process with OpenAI');
    
    try {
      // Prepare image file array for OpenAI (even though we only have one file)
      const imageFiles = [imageFile.path];
      
      // Convert image files to OpenAI format using toFile
      const images = await Promise.all(
        imageFiles.map(async (file) =>
          await toFile(fsSync.createReadStream(file), null, {
            type: imageFile.mimetype || 'image/png',
          })
        )
      );

      console.log('Images prepared for OpenAI API:', images);
      
      // Call the OpenAI API for image editing - exactly as in the reference
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: images,
        prompt: userPrompt,
        quality: quality
        // Request base64 data directly
      });
      
      console.log('Received response from OpenAI');

      // Get base64 image data from response
      const image_base64 = response.data[0].b64_json;
      const image_bytes = Buffer.from(image_base64, "base64");
      
      // Create output file
      const fileName = `edited-${Date.now()}-${path.basename(imageFile.filename)}`;
      const filePath = UPLOAD_PATH + fileName;
      
      // Handle file saving based on environment
      if (isProduction) {
        // Save file directly in production
        await fs.writeFile(filePath, image_bytes);
        console.log('Saved edited image to production path:', filePath);
      } else {
        // For development, create a temp file first
        const tempFilePath = path.join(process.cwd(), 'temp', fileName);
        
        // Ensure temp directory exists
        await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true }).catch(() => {});
        
        // Write to temporary file
        await fs.writeFile(tempFilePath, image_bytes);
        console.log('Created temporary file at:', tempFilePath);
        
        // Use SFTP to upload to production location
        const sftp = new Client();
        try {
          await sftp.connect({
            host: process.env.SFTP_HOST,
            port: 22,
            username: process.env.SFTP_USER,
            password: process.env.SFTP_PASSWORD
          });
          
          console.log('SFTP Connected successfully');
          console.log('Uploading file from:', tempFilePath);
          console.log('To:', filePath);
          
          await sftp.put(tempFilePath, filePath);
          console.log('File uploaded via SFTP successfully');
          
          await sftp.end();
          
          // Clean up temp file
          await fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err));
        } catch (sftpError) {
          console.error('SFTP Error:', sftpError);
          throw sftpError;
        }
      }
      
      // Clean up original file
      await fs.unlink(imageFile.path);

      // Store in database
      const result = await db.query(
        'INSERT INTO "CaptionedImages" (user_id, original_image, captioned_image, caption, style_data) VALUES (:userId, :originalImage, :editedImage, :prompt, :styleData) RETURNING *',
        {
          replacements: {
            userId,
            originalImage: imageFile.originalname,
            editedImage: fileName,
            prompt: userPrompt,
            styleData: JSON.stringify({ quality })
          },
          type: QueryTypes.INSERT
        }
      );

      // Return success response
      res.json({
        success: true,
        editedImage: {
          url: `https://pic2alt.com/uploads/${fileName}`,
          prompt: userPrompt
        }
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      // Fallback to direct image generation if edit fails
      console.log('Falling back to direct image generation');
      
      const fallbackResponse = await openai.images.generate({
        model: "gpt-image-1",
        prompt: userPrompt,
        n: 1,
        quality: quality,
        size: "1024x1024"
      });
      
      // Get the base64 image data
      const image_base64 = fallbackResponse.data[0].b64_json;
      const image_bytes = Buffer.from(image_base64, "base64");
      
      // Create output file
      const fileName = `edited-${Date.now()}-${path.basename(imageFile.filename)}`;
      const filePath = UPLOAD_PATH + fileName;
      
      // Handle file saving based on environment
      if (isProduction) {
        // Save file directly in production
        await fs.writeFile(filePath, image_bytes);
        console.log('Saved edited image to production path:', filePath);
      } else {
        // For development, create a temp file first
        const tempFilePath = path.join(process.cwd(), 'temp', fileName);
        
        // Ensure temp directory exists
        await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true }).catch(() => {});
        
        // Write to temporary file
        await fs.writeFile(tempFilePath, image_bytes);
        console.log('Created temporary file at:', tempFilePath);
        
        // Use SFTP to upload to production location
        const sftp = new Client();
        try {
          await sftp.connect({
            host: process.env.SFTP_HOST,
            port: 22,
            username: process.env.SFTP_USER,
            password: process.env.SFTP_PASSWORD
          });
          
          console.log('SFTP Connected successfully');
          console.log('Uploading file from:', tempFilePath);
          console.log('To:', filePath);
          
          await sftp.put(tempFilePath, filePath);
          console.log('File uploaded via SFTP successfully');
          
          await sftp.end();
          
          // Clean up temp file
          await fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err));
        } catch (sftpError) {
          console.error('SFTP Error:', sftpError);
          throw sftpError;
        }
      }
      
      // Clean up original file
      await fs.unlink(imageFile.path);

      // Store in database
      const result = await db.query(
        'INSERT INTO "CaptionedImages" (user_id, original_image, captioned_image, caption, style_data) VALUES (:userId, :originalImage, :editedImage, :prompt, :styleData) RETURNING *',
        {
          replacements: {
            userId,
            originalImage: imageFile.originalname,
            editedImage: fileName,
            prompt: userPrompt,
            styleData: JSON.stringify({ quality })
          },
          type: QueryTypes.INSERT
        }
      );

      // Return success response
      res.json({
        success: true,
        editedImage: {
          url: `https://pic2alt.com/uploads/${fileName}`,
          prompt: userPrompt
        }
      });
    }
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit image',
      error: error.message
    });
  }
};

// Keep the generateStyledCaption function to avoid breaking existing routes
const generateStyledCaption = async (req, res) => {
  res.status(501).json({ message: "This feature has been replaced with image editing" });
};

module.exports = {
  upload,
  editImage,
  generateStyledCaption
};