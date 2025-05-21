const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.1cinevood.org';

/**
 * Scrapes the 1cinevood.org website for latest content
 * @returns {Promise<Array>} Array of movie/content objects
 */
async function scrapeLatestContent() {
  try {
    // Fetch the homepage
    const response = await axios.get(BASE_URL);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const contentItems = [];
    
    // This selector needs to be adjusted based on the actual website structure
    // Looking for movie/content cards or containers
    $('.movies-list .movie-item').each((index, element) => {
      const $element = $(element);
      
      // Extract data from each item
      const title = $element.find('.movie-title').text().trim();
      const link = $element.find('a').attr('href');
      const imageUrl = $element.find('img').attr('src');
      const description = $element.find('.movie-excerpt').text().trim();
      const publishedDate = $element.find('.movie-date').text().trim() || new Date().toISOString();
      
      // Add to our items array if we have at least a title and link
      if (title && link) {
        contentItems.push({
          title,
          link: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`,
          description,
          publishedDate
        });
      }
    });
    
    // Fallback to alternative structure if no items found
    if (contentItems.length === 0) {
      $('.content-area article').each((index, element) => {
        const $element = $(element);
        
        const title = $element.find('h2').text().trim();
        const link = $element.find('a').attr('href');
        const imageUrl = $element.find('img').attr('src');
        const description = $element.find('.entry-content p').first().text().trim();
        const publishedDate = $element.find('.published').text().trim() || new Date().toISOString();
        
        if (title && link) {
          contentItems.push({
            title,
            link: link.startsWith('http') ? link : `${BASE_URL}${link}`,
            imageUrl: imageUrl?.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`,
            description,
            publishedDate
          });
        }
      });
    }
    
    return contentItems;
  } catch (error) {
    console.error('Error scraping website:', error);
    return [];
  }
}

/**
 * Scrapes content from a specific category
 * @param {string} category - Category path (e.g., 'bollywood', 'hollywood')
 * @returns {Promise<Array>} Array of movie/content objects
 */
async function scrapeCategoryContent(category) {
  try {
    const url = `${BASE_URL}/${category}/`;
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const contentItems = [];
    
    // Similar selectors as above, but for category pages
    $('.movies-list .movie-item, .content-area article').each((index, element) => {
      const $element = $(element);
      
      const title = $element.find('.movie-title, h2').text().trim();
      const link = $element.find('a').attr('href');
      const imageUrl = $element.find('img').attr('src');
      const description = $element.find('.movie-excerpt, .entry-content p').first().text().trim();
      const publishedDate = $element.find('.movie-date, .published').text().trim() || new Date().toISOString();
      
      if (title && link) {
        contentItems.push({
          title,
          link: link.startsWith('http') ? link : `${BASE_URL}${link}`,
          imageUrl: imageUrl?.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`,
          description,
          publishedDate,
          category
        });
      }
    });
    
    return contentItems;
  } catch (error) {
    console.error(`Error scraping category ${category}:`, error);
    return [];
  }
}

module.exports = {
  scrapeLatestContent,
  scrapeCategoryContent
};
        
