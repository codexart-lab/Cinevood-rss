// Add a simple logger in src/logger.js

const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }
};

module.exports = logger;
