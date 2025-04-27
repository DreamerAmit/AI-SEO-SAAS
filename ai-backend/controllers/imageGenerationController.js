const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs'); // For sync operations
const { OpenAI } = require('openai');
const crypto = require('crypto');
const Client = require('ssh2-sftp-client');

// Environment detection
const isProduction = process.env.NODE_ENV === 'Production';
console.log('Current environment:', process.env.NODE_ENV);
console.log('Is Production?', isProduction);

// Production upload path
const UPLOAD_PATH = '/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads/';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// File handling function from imageuploadController.js
const handleFileStorage = async (tempFilePath, filename) => {
  try {
    console.log('handleFileStorage running in:', process.env.NODE_ENV, 'mode');
    
    if (isProduction) {
      console.log('Using production file handling');
      const destinationFilePath = (UPLOAD_PATH + filename);
      
      console.log('Starting file storage process');
      console.log('Source:', tempFilePath);
      console.log('Destination:', destinationFilePath);
      
      // Copy file to production location
      await fs.copyFile(tempFilePath, destinationFilePath);
      
      // Verify file exists and is readable
      await fs.access(destinationFilePath, fs.constants.R_OK);
      
      const imageUrl = `https://pic2alt.com/uploads/${filename}`;
      console.log('File storage complete, URL:', imageUrl);
      
      return imageUrl;
    } else {
      console.log('Using development SFTP handling');
      const sftp = new Client();
      try {
        // Log connection details for debugging
        console.log('SFTP Connection Details:', {
          host: process.env.SFTP_HOST,
          username: process.env.SFTP_USER,
          hasPassword: !!process.env.SFTP_PASSWORD
        });

        await sftp.connect({
          host: process.env.SFTP_HOST,
          port: 22,
          username: process.env.SFTP_USER,
          password: process.env.SFTP_PASSWORD
        });

        console.log('SFTP Connected successfully');
        console.log('Uploading file from:', tempFilePath);
        console.log('To:', `${UPLOAD_PATH}${filename}`);

        await sftp.put(tempFilePath, `${UPLOAD_PATH}${filename}`);
        console.log('File uploaded via SFTP:', filename);

        await sftp.end();
        console.log('SFTP connection closed');

        return `https://pic2alt.com/uploads/${filename}`;
      } catch (sftpError) {
        console.error('SFTP Error:', {
          message: sftpError.message,
          code: sftpError.code,
          stack: sftpError.stack
        });
        throw sftpError;
      }
    }
  } catch (error) {
    console.error('File storage error:', error);
    throw error;
  }
};

const generateImage = async (req, res) => {
  try {
    const { 
      prompt, 
      negativePrompt = "", 
      numberOfImages = 1,
      quality = "high",
      userId 
    } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prompt is required' 
      });
    }
    
    // Create temp directory for generated images
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fsSync.existsSync(tempDir)) {
      fsSync.mkdirSync(tempDir, { recursive: true });
    }

    console.log(`Generating ${numberOfImages} images with OpenAI gpt-image-1 model at ${quality} quality`);
    
    // Process requests in batches (OpenAI may have rate limits)
    const batchSize = 2;
    const batches = [];
    
    for (let i = 0; i < numberOfImages; i += batchSize) {
      const remaining = Math.min(batchSize, numberOfImages - i);
      
      const batchRequests = [];
      for (let j = 0; j < remaining; j++) {
        // Using OpenAI's image generation API with gpt-image-1 model
        batchRequests.push(
          openai.images.generate({
            model: "gpt-image-1",
            prompt: prompt,
            n: 1,
            quality: quality
          })
        );
      }
      
      batches.push(batchRequests);
    }
    
    // Process all batches
    const allGeneratedImages = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(batch);
      for (const result of batchResults) {
        allGeneratedImages.push(...result.data);
      }
    }

    console.log(`Successfully generated ${allGeneratedImages.length} images from OpenAI`);
    
    // Process and save the generated images
    const savedImages = await Promise.all(allGeneratedImages.map(async (image, index) => {
      try {
        // Get base64 image data
        const image_base64 = image.b64_json;
        const image_bytes = Buffer.from(image_base64, "base64");
        
        // Create a temporary file
        const filename = `generated-${Date.now()}-${index}-${crypto.randomBytes(4).toString('hex')}.png`;
        const tempFilePath = path.join(tempDir, filename);
        
        // Save to temp location
        await fs.writeFile(tempFilePath, image_bytes);
        
        // Use the same file handling logic as before
        const imageUrl = await handleFileStorage(tempFilePath, filename);
        
        // Clean up temp file
        try {
          await fs.unlink(tempFilePath);
        } catch (unlinkError) {
          console.error('Failed to delete temp file:', unlinkError);
        }
        
        return {
          filename,
          url: imageUrl,
          NSFWContent: false, // OpenAI filters NSFW content by default
          positivePrompt: prompt,
          negativePrompt: negativePrompt
        };
      } catch (error) {
        console.error(`Error processing image ${index}:`, error);
        return null;
      }
    }));

    // Clean up temp directory if empty
    try {
      const files = await fs.readdir(tempDir);
      if (files.length === 0) {
        await fs.rmdir(tempDir);
      }
    } catch (error) {
      console.error('Error cleaning up temp directory:', error);
    }

    // Filter out any failed image generations
    const validImages = savedImages.filter(img => img !== null);

    res.json({
      success: true,
      message: `Generated ${validImages.length} images successfully`,
      images: validImages
    });
  } catch (error) {
    console.error('Error generating images with OpenAI:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate images',
      error: error.message || 'Unknown error'
    });
  }
};

// Get available models for the frontend to use
const getAvailableModels = async (req, res) => {
  try {
    // For OpenAI, we currently have just one image model
    const models = [
      {
        id: "gpt-image-1",
        name: "GPT Image 1",
        description: "OpenAI's image generation model"
      }
    ];
    
    res.json({
      success: true,
      models: models
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch models',
      error: error.message
    });
  }
};

module.exports = {
  generateImage,
  getAvailableModels
};
