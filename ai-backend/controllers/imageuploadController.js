const { OpenAI } = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs'); // Regular fs for sync operations
const axios = require('axios');
const db = require('../config/database');
const path = require('path');
const { QueryTypes } = require('sequelize');
const multer = require('multer');
const Client = require('ssh2-sftp-client');
const isProduction = process.env.NODE_ENV === 'production';
const UPLOAD_PATH = '/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads/';

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

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = isProduction 
            ? UPLOAD_PATH  // Production: Direct server path
            : './uploads/'; // Development: Local path
            
        if (!fsSync.existsSync(uploadPath)) {
            fsSync.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// Create multer instance with 'images' field name to match frontend
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 100
    }
});

const handleFileUpload = async (file) => {
    try {
        if (isProduction) {
            // In production, file is already in the correct location
            return `https://pic2alt.com/uploads/${file.filename}`;
        } else {
            // In development, upload via SFTP
            const sftp = new Client();
            await sftp.connect({
                host: process.env.SFTP_HOST,
                port: 22,
                username: process.env.SFTP_USER,
                password: process.env.SFTP_PASSWORD
            });

            // Upload to server
            await sftp.put(file.path, `${UPLOAD_PATH}${file.filename}`);
            await sftp.end();

            // Delete local file after successful upload
            await fs.unlink(file.path);
            console.log('Deleted local file:', file.path);

            return `https://pic2alt.com/uploads/${file.filename}`;
        }
    } catch (error) {
        console.error('File upload error:', error);
        // Try to clean up local file even if upload failed
        try {
            await fs.unlink(file.path);
            console.log('Cleaned up local file after error:', file.path);
        } catch (unlinkError) {
            console.error('Failed to delete local file:', unlinkError);
        }
        throw error;
    }
};

const uploadAndGenerateAltText = async (req, res) => {
    try {
        console.log('Starting upload process with files:', req.files?.length);
        const userId = req.body.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const userIdInt = parseInt(userId, 10);
        const files = req.files;

        // Validate files
        if (!files || files.length === 0) {
            console.error('No files received');
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Log credit check
        console.log('Checking credits for user:', userIdInt);
        const creditsResponse = await db.query(
            'SELECT image_credits FROM "Users" WHERE id = :userId',
            {
                replacements: { userId: userIdInt },
                type: QueryTypes.SELECT
            }
        );

        if (!creditsResponse?.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const remainingCredits = creditsResponse[0].image_credits;
        console.log('Remaining credits:', remainingCredits);

        if (files.length > remainingCredits) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient credits. You have ${remainingCredits} credits but trying to process ${files.length} images.` 
            });
        }

        const chatGptPrompt = req.body.chatGptPrompt || "Generate a 10-word alt text for this image.";
        const results = [];
        let processedCount = 0;

        // Process images in parallel with temporary URLs
        const processImage = async (file) => {
            let filePath;
            try {
                console.log('Starting to process file:', file.filename);
                
                // First, copy the file from temporary upload location to public directory
                const sourceFilePath = path.join(process.cwd(), 'uploads', file.filename);
                const publicFilePath = path.join('/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads', file.filename);
                
                // Ensure the directory exists
                const publicDir = path.dirname(publicFilePath);
                if (!fsSync.existsSync(publicDir)) {
                    fsSync.mkdirSync(publicDir, { recursive: true });
                }

                // Copy file to public directory
                await fs.copyFile(sourceFilePath, publicFilePath);
                console.log('File copied to public directory:', publicFilePath);

                // Now use the public URL for OpenAI API
                const imageUrl = await handleFileUpload(file);
                console.log('Image URL:', imageUrl);

                const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: chatGptPrompt },
                                { 
                                    type: "image_url", 
                                    image_url: { url: imageUrl }
                                }
                            ],
                        },
                    ],
                    max_tokens: 100,
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });

                console.log('OpenAI API response received');
                const altText = openAIResponse.data.choices[0].message.content.trim();
                console.log('Generated alt text:', altText);

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

                console.log('Database insert successful:', result[0]);
                processedCount++;

                // After successful processing and database save
                if (isProduction) {
                    // In production, delete from server path
                    try {
                        await fs.unlink(path.join(UPLOAD_PATH, file.filename));
                        console.log('Deleted server file:', file.filename);
                    } catch (unlinkError) {
                        console.error('Failed to delete server file:', unlinkError);
                    }
                }

                return result[0];
            } catch (error) {
                console.error('Error processing file:', error);
                // Cleanup on error
                try {
                    if (isProduction) {
                        await fs.unlink(path.join(UPLOAD_PATH, file.filename));
                    }
                } catch (unlinkError) {
                    console.error('Failed to delete file during error cleanup:', unlinkError);
                }
                return null;
            }
        };

        // Process all files in parallel
        console.log('Starting parallel processing of files');
        const processedResults = await Promise.all(files.map(processImage));
        console.log('Processed results:', processedResults);
        results.push(...processedResults.filter(Boolean));

        // Update user credits in a single transaction
        if (processedCount > 0) {
            console.log('Updating user credits');
            const deductResult = await db.query(
                'UPDATE "Users" SET image_credits = image_credits - :amount WHERE id = :userId AND image_credits >= :amount RETURNING image_credits',
                {
                    replacements: {
                        amount: processedCount,
                        userId: userIdInt
                    },
                    type: QueryTypes.UPDATE
                }
            );

            if (!deductResult?.[0]?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to deduct credits"
                });
            }

            res.json({
                success: true,
                results,
                message: `Successfully processed ${processedCount} images`,
                remainingCredits: deductResult[0][0].image_credits,
                errors: processedResults.filter(r => !r).length > 0 ? 
                        processedResults.filter(r => !r).map(() => ({ error: 'Processing failed' })) : 
                        undefined
            });
        } else {
            console.error('No images were processed successfully');
            res.status(400).json({
                success: false,
                message: "No images were successfully processed"
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        // Cleanup any remaining files
        if (req.files) {
            for (const file of req.files) {
                try {
                    const filePath = isProduction ? 
                        path.join(UPLOAD_PATH, file.filename) : 
                        file.path;
                    await fs.unlink(filePath);
                    console.log('Cleaned up file after error:', file.filename);
                } catch (unlinkError) {
                    console.error('Failed to delete file during error cleanup:', unlinkError);
                }
            }
        }
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process images',
            error: error.message 
        });
    }
};

module.exports = {
    upload,  // Export the multer instance
    uploadAndGenerateAltText  // Export the controller function
};