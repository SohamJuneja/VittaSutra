require('dotenv').config();
const path = require('path');

const config = {
  // Server configuration
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // MongoDB configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/expenditure-tracker',
  
  // File storage configuration
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  
  // Blockchain configuration
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    provider: process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545',
    contractAddress: process.env.CONTRACT_ADDRESS,
    accountAddress: process.env.ACCOUNT_ADDRESS,
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY,
    gasLimit: parseInt(process.env.GAS_LIMIT) || 3000000,
    gasPrice: process.env.GAS_PRICE || '20000000000' // 20 Gwei
  },
  
  // Email configuration
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'noreply@expenditure-tracker.gov.in'
  },
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  corsMethods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  
  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per window
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined'
};

// Validate essential configuration
const validateConfig = () => {
  const requiredConfigs = [
    { key: 'jwtSecret', default: 'your-secret-key', message: 'JWT secret is required for security. Change from default in production.' },
    { key: 'mongoUri', default: 'mongodb://localhost:27017/expenditure-tracker', message: 'MongoDB URI is required to connect to the database.' }
  ];

  let hasWarnings = false;
  
  requiredConfigs.forEach(({ key, default: defaultValue, message }) => {
    if (config[key] === defaultValue) {
      console.warn(`Warning: ${message}`);
      hasWarnings = true;
    }
  });
  
  // Blockchain specific validation
  if (config.blockchain.enabled) {
    if (!config.blockchain.contractAddress) {
      console.warn('Warning: Blockchain is enabled but CONTRACT_ADDRESS is not set');
      hasWarnings = true;
    }
    
    if (!config.blockchain.ownerPrivateKey) {
      console.warn('Warning: Blockchain is enabled but OWNER_PRIVATE_KEY is not set');
      hasWarnings = true;
    }
  }
  
  return !hasWarnings;
};

// Make sure uploads directory exists
const ensureUploadsDirectory = () => {
  const fs = require('fs');
  const uploadsPath = path.join(__dirname, '..', config.uploadDir);
  
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`Created uploads directory at ${uploadsPath}`);
  }
};

// Run validations in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
  ensureUploadsDirectory();
}

module.exports = config; 