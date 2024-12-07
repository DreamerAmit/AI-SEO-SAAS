const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

// Simple browser pool
const browserPool = {
    browsers: [],
    maxBrowsers: 1, // Start with 1 browsers

    async getBrowser() {
        // Find available browser
        const availableBrowser = this.browsers.find(b => !b.inUse);
        if (availableBrowser) {
            availableBrowser.inUse = true;
            return availableBrowser;
        }

        // Create new browser if under limit
        if (this.browsers.length < this.maxBrowsers) {
            const browser = await chromium.launch({
                args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
            });
            const newBrowser = { browser, inUse: true };
            this.browsers.push(newBrowser);
            return newBrowser;
        }

        // Wait and retry if all browsers are busy
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.getBrowser();
    },

    async releaseBrowser(browserInstance) {
        const browser = this.browsers.find(b => b.browser === browserInstance);
        if (browser) {
            browser.inUse = false;
        }
    },

    async cleanup() {
        await Promise.all(this.browsers.map(b => b.browser.close()));
        this.browsers = [];
    }
};

exports.scrapeAndGenerate = async (req, res) => {
    const { url } = req.body;
    let browserInstance = null;
    let context;
    let page;

    try {
        // Get available browser from pool
        const browser = await browserPool.getBrowser();
        browserInstance = browser.browser;
        
        context = await browserInstance.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
        // Proper cleanup
        if (context) await context.close().catch(console.error);
        if (browserInstance) await browserPool.releaseBrowser(browserInstance);
    }
};

// Cleanup on process exit
process.on('SIGINT', async () => {
    await browserPool.cleanup();
    process.exit();
});
