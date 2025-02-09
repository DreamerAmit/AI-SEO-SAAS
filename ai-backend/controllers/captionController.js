const sharp = require('sharp');
const OpenAI = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs'); // Add this for sync operations
const path = require('path');
const db = require('../config/database');
const { QueryTypes } = require('sequelize');
const multer = require('multer');
const { copyFile } = require('fs/promises');
const Client = require('ssh2-sftp-client'); // Add this import

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

// Configure multer storage like imageuploadController
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
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

const generateStyledCaption = async (req, res) => {
  try {
    const { userId } = req.body;
    const userPrompt = req.body.prompt; // This might be undefined
    
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

    const file = req.file;
    
    // Read the file from disk instead of using buffer
    const imageBuffer = fsSync.readFileSync(file.path);
    const base64Image = imageBuffer.toString('base64');

    // Generate caption using OpenAI based on whether user provided a prompt
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a caption designer. Return the caption in this exact JSON format:
          {
            "caption": "your caption here",
            "position": "bottom",
            "style": {
              "font": "Arial-Italic",
              "size": 10,
              "color": "#FFFFFF",
              "background": "rgba(0,0,0,0.7)"
            }
          }
          ${userPrompt ? 'Use exactly this caption: ' + userPrompt : 'Generate a concise caption in 10 words or less.'}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt || "Analyze this image and provide a concise caption in 10 words or less"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: userPrompt ? 0.3 : 0.7
    });

    // Clean up the response by removing markdown code block markers and parse
    let responseContent;
    try {
      const cleanResponse = analysisResponse.choices[0].message.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // If response starts with asterisks or other markdown, extract just the caption
      if (cleanResponse.startsWith('**')) {
        const caption = cleanResponse.replace(/\*\*/g, '').replace(/^Caption:\s*/, '').trim();
        responseContent = {
          caption,
          position: "bottom",
          style: {
            font: "Arial-Italic",
            size: 10,
            color: "#FFFFFF",
            background: "rgba(0,0,0,0.7)"
          }
        };
      } else {
        responseContent = JSON.parse(cleanResponse);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      // Fallback: create valid JSON with just the caption
      responseContent = {
        caption: analysisResponse.choices[0].message.content
          .replace(/\*\*/g, '')
          .replace(/^Caption:\s*/, '')
          .trim(),
        position: "bottom",
        style: {
          font: "Arial-Italic",
          size: 10,
          color: "#FFFFFF",
          background: "rgba(0,0,0,0.7)"
        }
      };
    }

    console.log('Parsed AI Response:', responseContent);

    const {
      caption,
      position,
      style
    } = responseContent;

    // 2. Process image with caption
    const processedImage = await addCaptionToImage(imageBuffer, caption, position, style);
    
    // Create a temporary file for the processed image
    const tempFilePath = file.path + '-captioned';
    fsSync.writeFileSync(tempFilePath, processedImage);

    const fileName = `captioned-${file.filename}`;
    const filePath = UPLOAD_PATH + fileName;

    if (isProduction) {
      console.log('Using production file handling');
      try {
        await copyFile(tempFilePath, filePath);
        console.log('Captioned file copied successfully to:', filePath);
        
        // Clean up temp file
        fsSync.unlinkSync(tempFilePath);
      } catch (copyError) {
        console.error('Copy operation failed:', copyError);
        throw copyError;
      }
    } else {
      console.log('Using development SFTP handling');
      const sftp = new Client();
      try {
        await sftp.connect({
          host: process.env.SFTP_HOST,
          port: 22,
          username: process.env.SFTP_USER,
          password: process.env.SFTP_PASSWORD
        });

        console.log('SFTP Connected successfully');
        console.log('Uploading captioned file from:', tempFilePath);
        console.log('To:', filePath);

        await sftp.put(tempFilePath, filePath);
        console.log('Captioned file uploaded via SFTP:', fileName);

        await sftp.end();
        
        // Clean up temp file
        fsSync.unlinkSync(tempFilePath);
      } catch (sftpError) {
        console.error('SFTP Error:', sftpError);
        throw sftpError;
      }
    }

    // Clean up original file
    fsSync.unlinkSync(file.path);

    // Store in database
    const result = await db.query(
      'INSERT INTO "CaptionedImages" (user_id, original_image, captioned_image, caption, style_data) VALUES (:userId, :originalImage, :captionedImage, :caption, :styleData) RETURNING *',
      {
        replacements: {
          userId,
          originalImage: file.originalname,
          captionedImage: fileName,
          caption,
          styleData: JSON.stringify({ position, style })
        },
        type: QueryTypes.INSERT
      }
    );

    // Use the same URL construction as imageuploadController
    res.json({
      success: true,
      captionedImage: {
        url: `https://pic2alt.com/uploads/${fileName}`,
        caption: caption
      }
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate caption',
      error: error.message
    });
  }
};

// Helper function to add caption to image
const addCaptionToImage = async (imageBuffer, caption, position, style) => {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  // Calculate text metrics
  const fontSize = Math.max(style.size, width * 0.03); // 3% of image width or style size
  const padding = fontSize * 0.8;
  const maxCharsPerLine = Math.floor(width / (fontSize * 0.6)); // Approximate chars that fit per line
  
  // Split caption into lines if it's too long
  const words = caption.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine = currentLine ? `${currentLine} ${word}` : word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate total height needed for caption
  const lineHeight = fontSize * 1.2; // 120% of font size
  const totalTextHeight = lines.length * lineHeight;
  const backgroundHeight = totalTextHeight + (padding * 2);

  const sanitizedLines = lines.map(line => 
    line.replace(/[<>&'"]/g, char => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return char;
      }
    })
  );

  const svgText = `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.8"/>
        </filter>
      </defs>
      <style>
        .caption-bg { 
          fill: rgba(0, 0, 0, 0.7);
        }
        .caption { 
          font-family: Arial;
          font-style: italic;
          font-size: ${fontSize}px;
          font-weight: 500;
          fill: #FFFFFF;
          filter: url(#shadow);
        }
      </style>
      
      <!-- Background rectangle -->
      <rect
        x="0"
        y="${height - backgroundHeight}"
        width="${width}"
        height="${backgroundHeight}"
        class="caption-bg"
      />
      
      <!-- Caption text lines -->
      ${sanitizedLines.map((line, index) => `
        <text 
          x="${width/2}" 
          y="${height - backgroundHeight + padding + (lineHeight * index) + (fontSize/2)}"
          text-anchor="middle" 
          dominant-baseline="middle"
          class="caption"
        >${line}</text>
      `).join('')}
    </svg>`;

  console.log('Generated SVG:', svgText);
  console.log('Caption lines:', lines.length);
  console.log('Background height:', backgroundHeight);

  return sharp(imageBuffer)
    .composite([{
      input: Buffer.from(svgText),
      top: 0,
      left: 0,
    }])
    .jpeg({ quality: 90 })
    .toBuffer();
};

module.exports = {
  upload,
  generateStyledCaption
};