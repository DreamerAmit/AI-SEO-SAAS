const { OpenAI } = require('openai');
const fs = require('fs').promises;
const fsSync = require('fs'); // Regular fs for sync operations
const axios = require('axios');
const db = require('../config/database');
const path = require('path');
const { QueryTypes } = require('sequelize');
const multer = require('multer');
const Client = require('ssh2-sftp-client');
const isProduction = process.env.NODE_ENV === 'Production';
console.log('Current environment:', process.env.NODE_ENV);
console.log('Is Production?', isProduction);
const UPLOAD_PATH = '/var/www/pic2alt/AI-SEO-SAAS/ai-backend/uploads/';
const sharp = require('sharp');

// Increase memory limit for Sharp
sharp.cache(false);
sharp.concurrency(1);
//sharp.limitInputPixels(false); // Remove dimension restrictions

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
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

// Update multer instance with new storage config
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 100
    }
});

const copyFile = async (source, destination) => {
    try {
        // Get source file size
        const sourceStats = fsSync.statSync(source);
        const fileSizeMB = (sourceStats.size / (1024 * 1024)).toFixed(2);
        console.log(`Starting copy of file: ${source}`);
        console.log(`File size: ${fileSizeMB}MB`);

        // Create write stream with higher buffer size for large files
        const readStream = fsSync.createReadStream(source, {
            highWaterMark: 1024 * 1024 // 1MB chunks
        });
        
        const writeStream = fsSync.createWriteStream(destination, {
            flags: 'w',
            mode: 0o666
        });

        let bytesWritten = 0;
        
        return new Promise((resolve, reject) => {
            readStream.on('data', (chunk) => {
                bytesWritten += chunk.length;
                console.log(`Progress: ${((bytesWritten / sourceStats.size) * 100).toFixed(2)}%`);
            });

            readStream.on('error', (error) => {
                console.error('Read error:', error);
                reject(error);
            });

            writeStream.on('error', (error) => {
                console.error('Write error:', error);
                reject(error);
            });

            writeStream.on('finish', () => {
                // Verify the copy
                const destStats = fsSync.statSync(destination);
                console.log(`Copy finished. Original size: ${sourceStats.size}, Copied size: ${destStats.size}`);
                
                if (sourceStats.size === destStats.size) {
                    console.log('File copy successful - sizes match');
                    resolve();
                } else {
                    console.error('File size mismatch!');
                    reject(new Error(`File size mismatch: source=${sourceStats.size}, dest=${destStats.size}`));
                }
            });

            // Pipe with error handling
            readStream.pipe(writeStream).on('error', (error) => {
                console.error('Pipe error:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Copy operation failed:', error);
        throw error;
    }
};

const handleFileUpload = async (file) => {
    try {
        console.log('handleFileUpload running in:', process.env.NODE_ENV, 'mode');
        
        if (isProduction) {
            console.log('Using production file handling');
            const sourceFilePath = file.path;
            const destinationFilePath = (UPLOAD_PATH + file.filename);
            
            console.log('Starting file upload process');
            console.log('Source:', sourceFilePath);
            console.log('Destination:', destinationFilePath);
            
         //   await copyFile(sourceFilePath, destinationFilePath);
            
            // Verify file exists and is readable
            await fs.access(destinationFilePath, fs.constants.R_OK);
            
            const imageUrl = `https://pic2alt.com/uploads/${file.filename}`;
            console.log('File upload complete, URL:', imageUrl);
            
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
                console.log('Uploading file from:', file.path);
                console.log('To:', `${UPLOAD_PATH}${file.filename}`);

                await sftp.put(file.path, `${UPLOAD_PATH}${file.filename}`);
                console.log('File uploaded via SFTP:', file.filename);

                await sftp.end();
                console.log('SFTP connection closed');

                return `https://pic2alt.com/uploads/${file.filename}`;
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
        console.error('File upload error:', error);
        throw error;
    }
};

const processImage = async (file) => {
    try {
        console.log('Starting to process file:', file.filename);
        
        // Get public URL
        const imageUrl = `https://pic2alt.com/uploads/${file.filename}`;
        console.log('Using image URL:', imageUrl);

        // Verify image accessibility
        try {
            const testResponse = await axios.head(imageUrl);
            console.log('Image URL is accessible:', imageUrl);
        } catch (error) {
            console.error('Image URL is not accessible:', error.message);
            throw new Error(`Image URL not accessible: ${imageUrl}`);
        }

        // OpenAI API call with detailed logging
        try {
            console.log('Calling OpenAI API with URL:', imageUrl);
            const openAIResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: chatGptPrompt || "Generate a descriptive alt text for this image." },
                            { 
                                type: "image_url", 
                                image_url: { 
                                    url: imageUrl,
                                    detail: "low"  // Reduce bandwidth usage
                                }
                            }
                        ],
                    },
                ],
                max_tokens: 100
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });

            console.log('OpenAI API response received');
            const altText = openAIResponse.data.choices[0].message.content.trim();
            console.log('Generated alt text:', altText);

            // Save to database
            const result = await db.query(
                'INSERT INTO "Images" ("src", "alt_text", "user_id") VALUES (:src, :altText, :userId) RETURNING id, "src", "alt_text"',
                {
                    replacements: { 
                        src: file.filename, 
                        altText: altText, 
                        userId: userIdInt 
                    },
                    type: QueryTypes.INSERT
                }
            );

            return result[0];

        } catch (error) {
            console.error('OpenAI API Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            throw error;
        }

    } catch (error) {
        console.error('Error processing file:', {
            filename: file.filename,
            error: error.message,
            stack: error.stack
        });
        return null;
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

        const chatGptPrompt = req.body.chatGptPrompt || "Generate a 20-word alt text for this image.";

        // Step 1: Upload all files in parallel
        console.log('Starting parallel file uploads');
        const uploadStartTime = Date.now();
        const uploadPromises = files.map(file => handleFileUpload(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        console.log(`All files uploaded in: ${Date.now() - uploadStartTime}ms`);

        // Step 2: Generate alt text for all images
        const processResults = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const imageUrl = uploadedUrls[i];
                console.log('Processing:', file.filename);

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
                    max_tokens: 50,
                    temperature: 0.3,
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                });

                processResults.push({
                    src: file.filename,
                    altText: openAIResponse.data.choices[0].message.content.trim(),
                    userId: userIdInt,
                    path: file.path
                });

            } catch (error) {
                console.error('Error processing file:', error);
            }
        }

        // Batch insert all results
        if (processResults.length > 0) {
            const query = `
                INSERT INTO "images" ("src", "alt_text", "user_id")
                VALUES ${processResults.map((_, index) => 
                    `(:src${index}, :altText${index}, :userId${index})`
                ).join(', ')}
                RETURNING id, "src", "alt_text";
            `;

            // Create replacements object
            const replacements = {};
            processResults.forEach((result, index) => {
                replacements[`src${index}`] = result.src;
                replacements[`altText${index}`] = result.altText;
                replacements[`userId${index}`] = result.userId;
            });

            const insertResult = await db.query(query, {
                replacements: replacements,
                type: QueryTypes.INSERT
            });
            
            // Send response immediately after database insert
            res.json({
                success: true,
                results: insertResult[0],
                message: `Successfully processed ${files.length} images`
            });

            // After sending response, update credits and cleanup files
            try {
                // Update credits (keeping existing logic)
                const deductResult = await db.query(
                    'UPDATE "Users" SET image_credits = image_credits - :amount WHERE id = :userId AND image_credits >= :amount RETURNING image_credits',
                    {
                        replacements: {
                            amount: files.length,
                            userId: userIdInt
                        },
                        type: QueryTypes.UPDATE
                    }
                );
                console.log('Credits updated, remaining:', deductResult[0][0].image_credits);

                // Delete files last
                for (const result of processResults) {
                    try {
                        await fs.unlink(UPLOAD_PATH + result.src);
                        console.log('Deleted file after processing:', result.src);
                    } catch (unlinkError) {
                        console.error('Failed to delete file:', unlinkError);
                    }
                }
            } catch (cleanupError) {
                console.error('Error in post-response operations:', cleanupError);
            }
        }

    } catch (error) {
        console.error('Upload error:', error);
        // Cleanup any remaining files
        if (req.files) {
            for (const file of req.files) {
                try {
                    const filePath = isProduction ? 
                        (UPLOAD_PATH + file.filename) : 
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