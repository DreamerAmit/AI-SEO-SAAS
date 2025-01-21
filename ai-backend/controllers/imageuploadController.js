const { OpenAI } = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs'); // Regular fs for sync operations
const axios = require('axios');
const db = require('../config/database');
const path = require('path');
const { QueryTypes } = require('sequelize');

// Function to ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = process.env.UPLOAD_DIR || './uploads/';
  if (!fsSync.existsSync(uploadDir)) {
    try {
      fsSync.mkdirSync(uploadDir, { recursive: true });
      console.log(`Upload directory created successfully at: ${uploadDir}`);
    } catch (err) {
      console.error(`Error creating upload directory at ${uploadDir}:`, err);
      throw new Error('Failed to create upload directory');
    }
  }
};

const uploadAndGenerateAltText = async (req, res) => {
  try {
    // Debug logs to see what we're receiving
    console.log('Request body:', req.body);
    console.log('Files:', req.files);

    // Get userId from FormData
    const userId = req.body.userId;
    console.log('Received userId:', userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Convert userId to integer if it's coming as string from FormData
    const userIdInt = parseInt(userId, 10);
    
    // Get user's remaining credits
    const creditsResponse = await db.query(
      'SELECT image_credits FROM "Users" WHERE id = :userId',
      {
        replacements: { userId: userIdInt },
        type: QueryTypes.SELECT
      }
    );

    if (!creditsResponse || creditsResponse.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const remainingCredits = creditsResponse[0].image_credits;
    const files = req.files;
    console.log(`User has ${remainingCredits} credits, attempting to process ${files.length} images`);

    // Check if user has enough credits
    if (files.length > remainingCredits) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient credits. You have ${remainingCredits} credits but trying to process ${files.length} images.` 
      });
    }

    ensureUploadDir();
   const chatGptPrompt = req.body.chatGptPrompt || "Generate a 10-word alt text for this image.";
    const results = [];

    // Process images
    for (const file of files) {
      try {
        console.log(`Processing image: ${file.filename}`);
        const filePath = path.join(process.env.UPLOAD_DIR || './uploads/', file.filename);
        const imageBuffer = await fs.readFile(filePath);
        const base64Image = imageBuffer.toString('base64');

        console.log(`Generating alt text for: ${file.filename}`);
        const defaultAltTextPrompt = "Generate alt text in less than 10 words.";
        const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o-mini",  // Updated model name
          messages: [
            {
              role: "user",
              content: [
                { type: "text", 
                  text: chatGptPrompt || defaultAltTextPrompt  },
                { 
                  type: "image_url", 
                  image_url: { 
                    url: `data:image/${file.mimetype};base64,${base64Image}` 
                  } 
                }
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

        const altText = openAIResponse.data.choices[0].message.content.trim();
        console.log('Generated AltText:', altText);

        // Save to database
        const result = await db.query(
          'INSERT INTO "images" ("src", "alt_text", "user_id") VALUES (:src, :altText, :userId) RETURNING id, "src", "alt_text"',
          {
            replacements: { 
              src: file.filename, 
              altText: altText, 
              userId: userIdInt 
            },
            type: QueryTypes.INSERT
          }
        );

        results.push(result[0]);
        await fs.unlink(filePath);
        console.log(`Successfully processed: ${file.filename}`);

      } catch (error) {
        console.error(`Error processing image ${file.filename}:`, error);
      }
    }

    // Deduct credits using the integer userId
    const deductResult = await db.query(
      'UPDATE "Users" SET image_credits = image_credits - :amount WHERE id = :userId AND image_credits >= :amount RETURNING *',
      {
        replacements: {
          amount: files.length,
          userId: userIdInt
        },
        type: QueryTypes.UPDATE
      }
    );

    console.log('Credit deduction result:', deductResult);

    // Check if the update was successful
    if (!deductResult || !deductResult[0] || deductResult[0].length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to deduct credits"
      });
    }

    // Return success response with the first row of the update result
    res.json({
      success: true,
      results,
      message: `Successfully processed ${files.length} images`,
      remainingCredits: deductResult[0][0].image_credits // Access the first row of the result
    });

  } catch (error) {
    console.error('Error in upload-and-generate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process images',
      error: error.message 
    });
  }
};

module.exports = {
  uploadAndGenerateAltText
};