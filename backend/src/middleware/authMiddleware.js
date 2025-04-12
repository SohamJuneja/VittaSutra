const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token and add user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please login.'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.server.jwtSecret);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
        error: error.message
      });
    }
    
    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is disabled. Please contact support.'
      });
    }
    
    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

/**
 * Middleware to restrict access to only officials
 */
exports.restrictToOfficials = (req, res, next) => {
  if (req.user.userType !== 'official') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Only government officials can access this resource.'
    });
  }
  
  next();
};

/**
 * Middleware to restrict access based on roles
 * @param {...String} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
};

/**
 * Check if user has email verified
 */
exports.requireEmailVerification = (req, res, next) => {
  // For user routes that need verified email
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user.isEmailVerified) {
        return res.status(403).json({
          status: 'error',
          message: 'Email not verified. Please verify your email before accessing this resource.'
        });
      }
      
      next();
    } catch (error) {
      logger.error('Email verification check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to check email verification status',
        error: error.message
      });
    }
  };
}; 