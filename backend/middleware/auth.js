const jwt = require('jsonwebtoken');
const User = require('../models/User');
const checkSuspension = require('../utils/checkSuspension');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      // FIX: DRY suspension check using shared utility
      const suspension = checkSuspension(req.user);
      if (!req.user || suspension.isSuspended) {
        return res.status(suspension.response?.statusCode || 403).json(
          suspension.response?.body || {
            success: false,
            message: 'Not authorized',
            isSuspended: true,
          }
        );
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // FIX: Added return to prevent sending headers twice
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
