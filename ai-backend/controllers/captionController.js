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
    const { imageId } = req.params;
    const { caption } = req.body;

    // If caption is a string containing JSON, try to parse it
    let captionText = caption;
    try {
      if (typeof caption === 'string' && caption.trim().startsWith('{')) {
        const parsedCaption = JSON.parse(caption);
        captionText = parsedCaption.caption || caption;
      }
    } catch (parseError) {
      console.log('Caption parsing error:', parseError);
      // If parsing fails, use the original caption text
      captionText = caption;
    }

    // Clean up the caption text
    captionText = cleanCaption(captionText);

    const imagePath = path.join(__dirname, '..', 'uploads', imageId);
    const outputPath = path.join(__dirname, '..', 'uploads', `captioned-${imageId}`);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Process the image with clean caption text
    await addCaptionToImage(imagePath, captionText, outputPath);

    res.json({
      success: true,
      captionedImage: `captioned-${imageId}`
    });
  } catch (error) {
    console.error('Error generating styled caption:', error);
    res.status(500).json({
      error: 'Failed to generate styled caption',
      details: error.message
    });
  }
};

// Helper function to clean caption text
const cleanCaption = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/\{[^}]+\}/g, '') // Remove JSON-like structures
    .replace(/\[[^\]]+\]/g, '') // Remove array-like structures
    .replace(/font:|size:|color:|background:|position:/g, '') // Remove style keys
    .replace(/Arial-Italic|#FFFFFF|rgba\([^)]+\)/g, '') // Remove style values
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Helper function to validate caption format
const isValidCaption = (text) => {
  if (typeof text !== 'string') {
    return false;
  }
  
  // Check for unwanted formatting
  const hasJSON = /[{}\[\]]/.test(text);
  const hasStyleInfo = /(font|size|color|background|position):/.test(text);
  const hasHTMLTags = /<[^>]*>/.test(text);
  
  return !hasJSON && !hasStyleInfo && !hasHTMLTags;
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