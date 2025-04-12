const winston = require('winston');
const { format, transports } = winston;
const path = require('path');
const fs = require('fs');
const config = require('../../config');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create console format with colors for development
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaString}`;
  })
);

// Create the logger instance
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: logFormat,
  defaultMeta: { service: 'expenditure-tracker' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  // Exit on error
  exitOnError: false
});

// If we're not in production, also log to the console with pretty formatting
if (config.isDevelopment) {
  logger.add(new transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object with a 'write' function for Morgan
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

// Handle uncaught exceptions and unhandled promise rejections
logger.exceptions.handle(
  new transports.File({ filename: path.join(logDir, 'exceptions.log') })
);

module.exports = logger; 