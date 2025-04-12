require('dotenv').config();
const path = require('path');
const fs = require('fs');

const config = {
  port: parseInt(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  jwtSecret: process.env.JWT_SECRET || 'hack5_secure_secret_key_for_development',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/government-projects',
  
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    provider: process.env.BLOCKCHAIN_PROVIDER || 'http://localhost:8545',
    contractAddress: process.env.CONTRACT_ADDRESS,
    accountAddress: process.env.ACCOUNT_ADDRESS,
    ownerPrivateKey: process.env.OWNER_PRIVATE_KEY,
    gasLimit: parseInt(process.env.GAS_LIMIT) || 3000000,
    gasPrice: process.env.GAS_PRICE || '20000000000'
  },
  
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
  
  corsOrigin: process.env.CORS_ORIGIN || '*',
  corsMethods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
  
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  logLevel: process.env.LOG_LEVEL || 'info',
  logFormat: process.env.LOG_FORMAT || 'combined'
};

const uploadsPath = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

module.exports = config; 