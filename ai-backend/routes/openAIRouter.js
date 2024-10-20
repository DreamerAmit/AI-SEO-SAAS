const express = require("express");
const axios = require("axios");
const db = require("../Config/database"); // Assuming you have a db.js file for PostgreSQL connection
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkApiRequestLimit = require("../middlewares/checkApiRequestLimit");

const openAIRouter = express.Router();

openAIRouter.post(
  "/generate-alt-text",
  isAuthenticated,
  checkApiRequestLimit,
  async (req, res) => {
    try {
      const { images } = req.body;
      const updatedImages = await Promise.all(images.map(async (image) => {
        const openAIResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: "gpt-4-vision-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Generate a concise, informative alt text for this image, suitable for web accessibility. Describe the main elements and any text visible in the image."
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: image.src
                    }
                  }
                ]
              }
            ],
            max_tokens: 300
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const altText = openAIResponse.data.choices[0].message.content.trim();
        
        // Update or insert the image in the database
        const result = await db.query(
          `INSERT INTO images (src, alt_text) 
           VALUES ($1, $2) 
           ON CONFLICT (src) DO UPDATE 
           SET alt_text = EXCLUDED.alt_text 
           RETURNING *`,
          [image.src, altText]
        );

        return result.rows[0];
      }));

      res.json({ updatedImages });
    } catch (error) {
      console.error('Error generating alt text:', error);
      res.status(500).json({ error: 'An error occurred while generating alt text' });
    }
  }
);

openAIRouter.get("/", isAuthenticated, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM images ORDER BY updated_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'An error occurred while fetching images' });
  }
});

module.exports = openAIRouter;
