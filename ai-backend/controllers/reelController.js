const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const createReel = async (req, res) => {
    try {
        const audioFile = req.files.audioFile[0];
        const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        const skipCaptioning = req.body.skipCaptioning === 'true';
        
        console.log('Processing images:', images);
        console.log('Audio file:', audioFile);
        console.log('Skip captioning:', skipCaptioning);

        // Create temporary directory with absolute path
        const tempDir = path.join(process.cwd(), 'uploads', 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        // Download images
        const downloadedImages = await Promise.all(images.map(async (url, index) => {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imagePath = path.join(tempDir, `image-${index}.jpg`);
            await fs.writeFile(imagePath, response.data);
            return imagePath;
        }));

        // Create concat file with absolute paths and proper format
        const concatFilePath = path.join(tempDir, 'concat.txt');
        let fileContent = '';
        downloadedImages.forEach(imagePath => {
            fileContent += `file '${imagePath.replace(/'/g, "'\\''")}\'\n`;
            fileContent += 'duration 4\n';
        });
        // Add the last image one more time (required for concat demuxer)
        fileContent += `file '${downloadedImages[downloadedImages.length - 1].replace(/'/g, "'\\''")}'`;
        
        await fs.writeFile(concatFilePath, fileContent);
        console.log('Concat file content:', fileContent);

        // Create output path
        const outputPath = path.join(tempDir, `reel-${Date.now()}.mp4`);

        // Create video using FFmpeg
        await new Promise((resolve, reject) => {
            const command = ffmpeg();

            // Use concat demuxer for images
            command
                .input(concatFilePath)
                .inputOptions([
                    '-f concat',
                    '-safe 0'
                ]);

            // Add audio file with loop if needed
            command
                .input(audioFile.path)
                .inputOptions([
                    '-stream_loop -1' // Loop audio if it's shorter than video
                ]);

            command
                .outputOptions([
                    '-c:v libx264',         // Video codec
                    '-pix_fmt yuv420p',     // Pixel format
                    '-r 30',                // Frame rate
                    '-s 1080x1920',         // Output size (Instagram story format)
                    '-b:v 2M',              // Video bitrate
                    '-shortest',            // Match shortest input length
                    '-movflags +faststart'  // Web playback optimization
                ])
                .videoFilters([
                    'scale=1080:1920:force_original_aspect_ratio=decrease',  // Scale maintaining aspect ratio
                    'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:white',  // Center the image with white padding
                    // Single watermark filter with embedded box
                    {
                        filter: 'drawtext',
                        options: {
                            text: 'Created by Pic2Alt.com',
                            fontsize: 36,              // Increased for mobile visibility
                            fontcolor: 'white',
                            x: 'w-480',                // Moved significantly further left
                            y: '40',                   // Adjusted vertical position
                            box: 1,
                            boxcolor: 'black@0.7',
                            boxborderw: 15,            // Increased padding
                            shadowcolor: 'black',
                            shadowx: 1,
                            shadowy: 1
                        }
                    }
                ])
                .on('start', (command) => {
                    console.log('FFmpeg process started:', command);
                })
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('end', () => {
                    console.log('FFmpeg process completed');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error:', err);
                    reject(err);
                })
                .save(outputPath);
        });

        // Read the generated video
        const videoBuffer = await fs.readFile(outputPath);

        // Clean up
        await Promise.all([
            ...downloadedImages.map(imagePath => fs.unlink(imagePath).catch(console.error)),
            fs.unlink(concatFilePath).catch(console.error),
            fs.unlink(outputPath).catch(console.error),
            fs.rmdir(tempDir, { recursive: true }).catch(console.error)
        ]);

        // Send the video file
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', 'attachment; filename=reel.mp4');
        res.send(videoBuffer);

    } catch (error) {
        console.error('Error in createReel:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating reel',
            error: error.message
        });
    }
};

module.exports = {
    createReel
};
