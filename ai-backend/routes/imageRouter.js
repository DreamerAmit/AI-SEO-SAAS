const express = require('express');
const axios = require('axios');
//const { Pool, QueryTypes } = require('pg');
const db = require('../Config/database');
const {QueryTypes} = require('sequelize');

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

imageRouter.post('/generate-alt-text', async (req, res) => {
  console.log('Received request to generate alt text');
  const { selectedImages } = req.body;

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
              { type: "text", text: "Generate a 50-word alt text for this image:" },
              { type: "image_url", image_url: { url: image.src } }
            ],
          },
        ],
        max_tokens: 300,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const altText = openAIResponse.data.choices[0].message.content.trim();
      console.log('Image source:', image.src);
      console.log('Generated AltText:',altText);
      
      // Store in PostgreSQL
      try {
        console.log('Inserting into database:', image.src, altText);
        const result = await db.query(
          'INSERT INTO "images" ("src", "alt_text") VALUES (:src, :altText) RETURNING id, "src", "alt_text"',
          {
            replacements: { src: image.src, altText: altText },
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
  try {
    const result = await db.query('SELECT * FROM images');
    console.log('Database query result:', result);
    
    // Check if result is an array (as in your current output)
    if (Array.isArray(result) && result.length > 0 && Array.isArray(result[0])) {
      res.json(result[0]);  // Send the first element of the array
    } else if (result && result.rows) {
      // This is the typical structure we expect from pg
      res.json(result.rows);
    } else {
      console.error('Unexpected result structure:', result);
      res.status(500).json({ error: 'Unexpected result structure from database' });
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images' });
  }
});



module.exports = imageRouter;
