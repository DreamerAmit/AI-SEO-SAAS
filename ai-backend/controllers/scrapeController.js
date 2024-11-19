const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

// Create a singleton browser instance
let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await chromium.launch({
            args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });
    }
    return browserInstance;
}

exports.scrapeAndGenerate = async (req, res) => {
    const { url } = req.body;
    let context;
    let page;

    try {
        // Get existing browser instance or create new one
        const browser = await getBrowser();
        
        // Create new context with optimized settings
        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            // Disable unnecessary features
            permissions: ['geolocation'],
            bypassCSP: true,
            ignoreHTTPSErrors: true
        });

        page = await context.newPage();

        // Block unnecessary resources
        await page.route('**/*', route => {
            const resourceType = route.request().resourceType();
            if (['stylesheet', 'font', 'image', 'media'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });

        // Set shorter timeout
        await page.goto(url, { 
            waitUntil: 'domcontentloaded', // Changed from 'networkidle'
            timeout: 15000 
        });

        // Optimized image scraping
        const images = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('img');
            const results = [];
            const seen = new Set();

            for (const img of imgElements) {
                const src = img.src;
                if (src && !seen.has(src)) {
                    seen.add(src);
                    results.push({
                        src,
                        alt: img.alt || '',
                        width: img.width,
                        height: img.height
                    });
                }
            }
            return results;
        });

        console.log(`Scraped ${images.length} images from ${url}`);
        res.json(images);

    } catch (error) {
        console.error('Error scraping page:', {
            message: error.message,
            url,
            stack: error.stack
        });
        
        res.status(500).json({ 
            error: 'Error scraping page',
            details: error.message 
        });
    } finally {
        // Only close context, keep browser alive
        if (context) await context.close().catch(console.error);
    }
};

// Add cleanup on process exit
process.on('SIGINT', async () => {
    if (browserInstance) {
        await browserInstance.close();
    }
    process.exit();
});
