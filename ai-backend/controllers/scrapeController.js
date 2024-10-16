const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

exports.scrapeAndGenerate = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.map(img => ({
        src: img.src,
        alt: img.alt || '',
        width: img.width,
        height: img.height
      }));
    });

    await browser.close();

    // Remove duplicates based on src
    const uniqueImages = Array.from(new Set(images.map(img => JSON.stringify(img))))
      .map(str => JSON.parse(str));

    console.log(`Scraped ${uniqueImages.length} unique images from ${url}`);
    res.json(uniqueImages);
  } catch (error) {
    console.error('Error scraping page:', error);
    res.status(500).json({ error: 'Error scraping page' });
  }
};
