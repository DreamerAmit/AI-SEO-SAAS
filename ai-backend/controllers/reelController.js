const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const createReel = async (req, res) => {
    try {
        const audioFile = req.files.audioFile[0];
        const images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        
        console.log('Processing images:', images);
        console.log('Audio file:', audioFile);

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
            ffmpeg()
                .input(concatFilePath)
                .inputOptions([
                    '-f concat',
                    '-safe 0'
                ])
                .input(audioFile.path)
                .inputOptions([
                    '-stream_loop -1'
                ])
                .outputOptions([
                    '-c:v libx264',
                    '-pix_fmt yuv420p',
                    '-r 30',
                    '-s 1080x1920',
                    '-b:v 2M',
                    '-shortest',
                    '-movflags +faststart'
                ])
                .videoFilters([
                    {
                        filter: 'scale',
                        options: '1080:1920:force_original_aspect_ratio=decrease'
                    },
                    {
                        filter: 'pad',
                        options: '1080:1920:(ow-iw)/2:(oh-ih)/2:white'
                    }
                ])
                .audioFilters('volume=1')
                .on('start', command => {
                    console.log('FFmpeg command:', command);
                })
                .on('progress', progress => {
                    console.log('Processing:', progress.percent, '% done');
                })
                .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(err);
                })
                .on('end', () => {
                    console.log('FFmpeg processing finished');
                    resolve();
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
