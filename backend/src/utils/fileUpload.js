const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config');
const logger = require('./logger');

// Ensure upload directory exists
const uploadDir = config.storage.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory: ${uploadDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent collisions
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname).toLowerCase();
    const sanitizedName = path.basename(file.originalname, fileExt)
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${fileExt}`);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = config.storage.allowedMimeTypes;
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.storage.maxFileSize
  }
});

/**
 * Generate a hash for a file to be used as a reference in the blockchain
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - Hash of the file
 */
const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const fileStream = fs.createReadStream(filePath);
      const hash = crypto.createHash('sha256');
      
      fileStream.on('data', (data) => {
        hash.update(data);
      });
      
      fileStream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      fileStream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Delete a file from the uploads directory
 * @param {string} filename - The filename to delete
 * @returns {Promise<boolean>} - Whether the file was deleted successfully
 */
const deleteFile = async (filename) => {
  try {
    const filePath = path.join(uploadDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`File not found for deletion: ${filePath}`);
      return false;
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    logger.info(`Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    logger.error(`Error deleting file: ${error}`);
    return false;
  }
};

/**
 * Get the full URL for a file
 * @param {string} filename - The filename
 * @param {object} req - Express request object
 * @returns {string} - Full URL to the file
 */
const getFileUrl = (filename, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = {
  upload,
  generateFileHash,
  deleteFile,
  getFileUrl
}; 