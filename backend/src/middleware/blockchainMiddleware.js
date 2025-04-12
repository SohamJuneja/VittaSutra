const config = require('../config');
const logger = require('../utils/logger');
const blockchainClient = require('../blockchain/client');

/**
 * Middleware to check if blockchain is enabled and initialize it if needed
 */
const blockchainMiddleware = async (req, res, next) => {
  try {
    // Skip if blockchain is disabled
    if (!config.blockchain.enabled) {
      // Attach a function to the request to track what would have been logged to blockchain
      req.blockchainLog = (action, data) => {
        logger.info(`[BLOCKCHAIN DISABLED] Would log ${action}:`, data);
      };
      
      return next();
    }
    
    // Initialize blockchain if not already initialized
    await blockchainClient.initialize();
    
    // Make the blockchain client available in the request
    req.blockchain = blockchainClient;
    
    next();
  } catch (error) {
    logger.error('Blockchain middleware error:', error);
    
    // Continue execution even if blockchain fails, but log the error
    // This allows the application to function without blockchain if there's an issue
    req.blockchainError = error;
    req.blockchainLog = (action, data) => {
      logger.error(`[BLOCKCHAIN ERROR] Failed to log ${action}:`, { data, error: error.message });
    };
    
    next();
  }
};

/**
 * Middleware to ensure blockchain is enabled and working
 * This is for routes that should fail if blockchain is not available
 */
const requireBlockchain = async (req, res, next) => {
  try {
    // Skip checks if blockchain is disabled in config
    if (!config.blockchain.enabled) {
      return res.status(503).json({
        status: 'error',
        message: 'Blockchain features are currently disabled'
      });
    }
    
    // Check if there was an error initializing blockchain
    if (req.blockchainError) {
      return res.status(503).json({
        status: 'error',
        message: 'Blockchain service is currently unavailable',
        error: req.blockchainError.message
      });
    }
    
    // If blockchain client is not available, initialize it
    if (!req.blockchain) {
      await blockchainClient.initialize();
      req.blockchain = blockchainClient;
    }
    
    next();
  } catch (error) {
    logger.error('Blockchain requirement error:', error);
    
    return res.status(503).json({
      status: 'error',
      message: 'Blockchain service is currently unavailable',
      error: error.message
    });
  }
};

module.exports = {
  blockchainMiddleware,
  requireBlockchain
}; 