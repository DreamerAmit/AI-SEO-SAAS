const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
require('dotenv').config(); // This will load your .env file

async function generateSitemap() {
  // Get hostname based on environment
  const hostname = process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'  // Replace with your actual production domain
    : 'http://localhost:3002';  // Your local development port

  console.log('Generating sitemap for:', hostname);
  
  const sitemap = new SitemapStream({ hostname });

  // Define your routes
  const pages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/login', priority: 0.8, changefreq: 'monthly' },
    { url: '/register', priority: 0.8, changefreq: 'monthly' },
    { url: '/blogs', priority: 0.8, changefreq: 'weekly' },
    { url: '/blog/post1', priority: 0.7, changefreq: 'monthly' },
    { url: '/blog/post2', priority: 0.7, changefreq: 'monthly' },
    { url: '/blog/post3', priority: 0.7, changefreq: 'monthly' },
    { url: '/support', priority: 0.7, changefreq: 'monthly' },
    { url: '/help', priority: 0.7, changefreq: 'monthly' },
    { url: '/plans', priority: 0.8, changefreq: 'weekly' },
    { url: '/images', priority: 0.7, changefreq: 'weekly' }
  ];

  // Write all pages to sitemap
  pages.forEach(page => sitemap.write(page));
  sitemap.end();

  // Generate sitemap.xml
  const sitemapXML = await streamToPromise(sitemap);
  fs.writeFileSync('./public/sitemap.xml', sitemapXML);

  // Generate robots.txt
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${hostname}/sitemap.xml
`.trim();

  fs.writeFileSync('./public/robots.txt', robotsTxt);
  console.log('Sitemap and robots.txt generated successfully');
}

generateSitemap()
  .catch(console.error);
