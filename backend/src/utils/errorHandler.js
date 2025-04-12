const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle different types of errors
 */
const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  
  // Log the error
  logger.error('Error:', { 
    message: error.message, 
    url: req.originalUrl, 
    method: req.method,
    body: req.body,
    stack: error.stack 
  });
  
  // MongoDB Bad ObjectID error
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }
  
  // MongoDB Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${field} with value: ${value}. Please use another value.`;
    error = new AppError(message, 400);
  }
  
  // MongoDB Validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    error = new AppError(message, 400);
  }
  
  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  
  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }
  
  // For operational errors, send detailed error messages
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message || 'Something went wrong'
    });
  }
  
  // For programming or unknown errors, don't leak error details in production
  // Send generic message instead
  console.error('ERROR 💥', error);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

module.exports = {
  AppError,
  handleError
}; 