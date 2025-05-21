const RSS = require('rss');

/**
 * Generates an RSS feed from the provided content items
 * @param {Array} items - Array of content items
 * @param {string} feedTitle - Title of the RSS feed
 * @param {string} feedDescription - Description of the RSS feed 
 * @param {string} feedUrl - URL of the RSS feed
 * @returns {string} RSS feed as XML string
 */
function generateRssFeed(items, feedTitle, feedDescription, feedUrl) {
  const siteUrl = 'https://www.1cinevood.org';
  
  // Create the feed object
  const feed = new RSS({
    title: feedTitle,
    description: feedDescription,
    feed_url: feedUrl,
    site_url: siteUrl,
    image_url: `${siteUrl}/favicon.ico`,
    language: 'en',
    pubDate: new Date(),
    ttl: 60 // time to live in minutes
  });
  
  // Add items to the feed
  items.forEach(item => {
    feed.item({
      title: item.title,
      description: item.description || '',
      url: item.link,
      guid: item.link,
      categories: [item.category || 'movie'],
      author: '1cinevood.org',
      date: item.publishedDate,
      enclosure: item.imageUrl ? {
        url: item.imageUrl,
        type: 'image/jpeg'
      } : undefined
    });
  });
  
  // Return the XML
  return feed.xml({ indent: true });
}

module.exports = {
  generateRssFeed
};
