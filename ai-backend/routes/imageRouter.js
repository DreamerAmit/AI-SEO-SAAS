const express = require('express');
const axios = require('axios');
//const { Pool, QueryTypes } = require('pg');
const db = require('../config/database');
const {QueryTypes} = require('sequelize');
const multer = require('multer');
const { upload, uploadAndGenerateAltText } = require('../controllers/imageuploadController');
const fs = require('fs');
const path = require('path');
const { generateStyledCaption } = require('../controllers/captionController');
const reelController = require('../controllers/reelController');
const auth = require('../middlewares/isAuthenticated');
const { createReel } = require('../controllers/reelController');

const imageRouter = express.Router();

const BATCH_SIZE = 15;
const DELAY_BETWEEN_IMAGES = 600; // 0.6 seconds
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds
const MAX_RETRIES = 3;

// const dbPool = new Pool({
//   user: 'env.DB_USER',
//   host: 'env.DB_HOST',
//   database: 'env.DB_DATABASE',
//   password: 'env.DB_PASSWORD',
//   port: 3000,
// });

imageRouter.use((req, res, next) => {
  console.log('imageRouter middleware hit:', req.method, req.url);
  next();
});

// Get upload directory from environment variable
const uploadDir = process.env.UPLOAD_DIR || './uploads/'; // fallback for safety

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Upload directory created successfully at: ${uploadDir}`);
  } catch (err) {
    console.error(`Error creating upload directory at ${uploadDir}:`, err);
  }
}

// Use as separate middleware and controller function
imageRouter.post('/upload-and-generate', upload.array('images', 100), uploadAndGenerateAltText);

imageRouter.post('/generate-alt-text', async (req, res) => {
  const { selectedImages, userId, chatGptPrompt} = req.body;
  
  try {
    if (!selectedImages?.length) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const totalBatches = Math.ceil(selectedImages.length / BATCH_SIZE);
    const estimatedSeconds = Math.ceil(
      (selectedImages.length * DELAY_BETWEEN_IMAGES + 
       (totalBatches - 1) * DELAY_BETWEEN_BATCHES) / 1000
    );

    // Process images in batches
    const results = [];
    const errors = [];
    let processedCount = 0;

    for (let i = 0; i < selectedImages.length; i += BATCH_SIZE) {
      const batch = selectedImages.slice(i, i + BATCH_SIZE);
      
      // Process batch
      const batchPromises = batch.map(async (image, index) => {
        try {
          // Stagger requests within batch
          await new Promise(resolve => setTimeout(resolve, index * DELAY_BETWEEN_IMAGES));
          
          // Default prompt for alt text generation
          const defaultAltTextPrompt = "Generate alt text for this image in less than 20 words.";
          
          const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: [
                  { 
                    type: "text", 
                    text:  chatGptPrompt || defaultAltTextPrompt 
                  },
                  { 
                    type: "image_url", 
                    image_url: { url: image.src } 
                  }
                ],
              },
            ],
            max_tokens: 500,
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          });

          const generatedText = openAIResponse.data.choices[0].message.content.trim();
          console.log("Generated text",generatedText);
          
          try {
            const result = await db.query(
                'INSERT INTO "images" ("src", "alt_text", "user_id") VALUES (:src, :altText, :userId) RETURNING id, "src", "alt_text"',
                {
                    replacements: { src: image.src, altText: generatedText, userId: userId },
                    type: QueryTypes.INSERT
                }
            );
            processedCount++;
            results.push(result[0]);
            console.log("Row inserted",result[0]);
            return result[0];
        } catch (error) {
            console.error(`Failed to process image: ${image.src}`, error);
            errors.push({ src: image.src, error: error.message });
            return null;
        }

      } catch (error) {
          console.error(`Failed to process image: ${image.src}`, error);
          errors.push({ src: image.src, error: error.message });
          return null;
        }
    });

      await Promise.all(batchPromises);

      // Delay between batches
      if (i + BATCH_SIZE < selectedImages.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    res.json({
      success: true,
      processed: processedCount,
      failed: errors.length,
      results: results.filter(Boolean),
      errors
    });

  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).json({ error: 'Failed to process images' });
  }
});


// New GET route to fetch all images
imageRouter.get("/altText", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM images WHERE user_id = :userId ORDER BY 1 DESC',
      {
        replacements: { userId: userId },
        type: QueryTypes.SELECT
      }
    );
    console.log('Database query result:', result);

    // Send the result array directly
    res.json(result);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images' });
  }
});

// Add this new route to the existing file
imageRouter.delete('/altText', async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty array of ids' });
  }

  try {
    console.log('Executing SQL query with ids:', ids); // Moved this line outside of db.query
    const result = await db.query(
      'DELETE FROM images WHERE id IN (:ids) RETURNING *',
      {
        replacements: { ids: ids },
        type: QueryTypes.DELETE
      }
    );

    if (result[1] === 0) { // Changed from result.rowCount to result[1]
      return res.status(404).json({ error: 'No images found with the provided ids' });
    }

    res.json({ message: `${result[1]} image(s) deleted successfully` }); // Changed from result.rowCount to result[1]
  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ error: 'An error occurred while deleting images' });
  }
});

// Caption generation route with multer middleware
imageRouter.post('/generate-styled-caption', 
  auth,
  upload.single('image'),
  generateStyledCaption
);

// Modified reel route to use controller
imageRouter.post('/createReels', 
    auth,
    upload.fields([
        { name: 'audioFile', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]),
    createReel  // Use the controller function
);

module.exports = imageRouter;
