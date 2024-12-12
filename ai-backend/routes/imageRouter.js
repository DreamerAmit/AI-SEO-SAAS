const express = require('express');
const axios = require('axios');
//const { Pool, QueryTypes } = require('pg');
const db = require('../config/database');
const {QueryTypes} = require('sequelize');
const multer = require('multer');
const { uploadAndGenerateAltText } = require('../controllers/imageuploadController');
const fs = require('fs');
const path = require('path');


const imageRouter = express.Router();
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

imageRouter.post('/upload-and-generate', upload.array('images'), uploadAndGenerateAltText);


imageRouter.post('/generate-alt-text', async (req, res) => {
  console.log('Received request to generate alt text');
  const { selectedImages, userId, chatGptPrompt } = req.body; // Add chatGptPrompt here

  try {
    const generatedImages = await Promise.all(selectedImages.map(async (image) => {
      // OpenAI API call
      console.log('Sending request to OpenAI API')
      const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Generate alt text for this image by following the prompt: ${chatGptPrompt}`
                
              },
              { type: "image_url", image_url: { url: image.src } }
            ],
          },
        ],
        max_tokens: 500,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(chatGptPrompt);
      const altText = openAIResponse.data.choices[0].message.content.trim();
      console.log('Image source:', image.src);
      console.log('Generated AltText:',altText);
      
      // Store in PostgreSQL
      try {
        console.log('Inserting into database:', image.src, altText);
        const result = await db.query(
          'INSERT INTO "images" ("src", "alt_text", "user_id") VALUES (:src, :altText, :userId) RETURNING id, "src", "alt_text"',
          {
            replacements: { src: image.src, altText: altText, userId: userId },
            type: QueryTypes.INSERT
          }
        );
        console.log('Query result:', result);
        return result[0]; // Sequelize returns an array for INSERT queries
      } catch (error) {
        console.error('Error executing database query:', error);
        throw error;
      }

      console.log('Image source:', image.src);
      console.log('Alt text:', altText);

     

      return result.rows[0];
    }));

    res.json(generatedImages);
  } catch (error) {
    console.error('Error generating alt text:', error);
    res.status(500).json({ error: 'An error occurred while generating alt text' });
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



module.exports = imageRouter;
