/**
 * Role middleware to restrict access based on user type
 * @param {string[]} roles - Array of allowed user types
 * @returns {function} Middleware function
 */
module.exports = (roles = []) => {
  // Convert string to array if only one role is passed
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Ensure user exists (auth middleware should have run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.'
      });
    }

    // Check if user's role is in the allowed roles list
    if (roles.length && !roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    // User has required role, proceed to next middleware
    next();
  };
}; 