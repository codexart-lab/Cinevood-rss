const express = require('express');
const cors = require('cors');
const { scrapeLatestContent, scrapeCategoryContent } = require('../src/scraper');
const { generateRssFeed } = require('../src/rss');

// Create Express app
const app = express();

// Enable CORS
app.use(cors());

// Main route for latest content
app.get('/', async (req, res) => {
  res.send(`
    <h1>1Cinevood RSS API</h1>
    <p>Available endpoints:</p>
    <ul>
      <li><a href="/api/feed">/api/feed</a> - Latest content</li>
      <li><a href="/api/feed?category=bollywood">/api/feed?category=bollywood</a> - Bollywood movies</li>
      <li><a href="/api/feed?category=hollywood">/api/feed?category=hollywood">/api/feed?category=hollywood</a> - Hollywood movies</li>
      <li><a href="/api/feed?category=web-series">/api/feed?category=web-series</a> - Web Series</li>
    </ul>
  `);
});

// RSS feed endpoint
app.get('/api/feed', async (req, res) => {
  try {
    const category = req.query.category;
    let items = [];
    
    if (category) {
      items = await scrapeCategoryContent(category);
      feedTitle = `1Cinevood - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
      feedDescription = `Latest ${category} content from 1Cinevood`;
    } else {
      items = await scrapeLatestContent();
      feedTitle = '1Cinevood - Latest Content';
      feedDescription = 'Latest content from 1Cinevood';
    }
    
    const feedUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const rssFeed = generateRssFeed(items, feedTitle, feedDescription, feedUrl);
    
    // Set the content type to XML
    res.header('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    console.error('Error generating feed:', error);
    res.status(500).send('Error generating feed');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
// Add this to api/index.js

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const cache = {
  latestContent: {
    data: null,
    timestamp: 0
  },
  categoryContent: {}
};

// Modify the feed endpoint
app.get('/api/feed', async (req, res) => {
  try {
    const category = req.query.category;
    let items = [];
    let feedTitle, feedDescription;
    
    if (category) {
      // Check cache first
      const cacheKey = category;
      const now = Date.now();
      
      if (
        cache.categoryContent[cacheKey] &&
        now - cache.categoryContent[cacheKey].timestamp < CACHE_DURATION
      ) {
        items = cache.categoryContent[cacheKey].data;
      } else {
        items = await scrapeCategoryContent(category);
        // Update cache
        cache.categoryContent[cacheKey] = {
          data: items,
          timestamp: now
        };
      }
      
      feedTitle = `1Cinevood - ${category.charAt(0).toUpperCase() + category.slice(1)}`;
      feedDescription = `Latest ${category} content from 1Cinevood`;
    } else {
      // Check cache for latest content
      const now = Date.now();
      
      if (now - cache.latestContent.timestamp < CACHE_DURATION) {
        items = cache.latestContent.data;
      } else {
        items = await scrapeLatestContent();
        // Update cache
        cache.latestContent = {
          data: items,
          timestamp: now
        };
      }
      
      feedTitle = '1Cinevood - Latest Content';
      feedDescription = 'Latest content from 1Cinevood';
    }
    
    const feedUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const rssFeed = generateRssFeed(items, feedTitle, feedDescription, feedUrl);
    
    // Set the content type to XML
    res.header('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    console.error('Error generating feed:', error);
    res.status(500).send('Error generating feed');
  }
});
              

// Export for Vercel
module.exports = app;
