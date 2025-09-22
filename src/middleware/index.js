const { auth } = require('../config/firebase');
const logger = require('../utils/logger');

// Validation Middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Validation error:', errorMessage);
      return res.status(400).json({
        status: 400,
        message: 'Validation error',
        errors: error.details
      });
    }
    next();
  };
};

// Firebase Auth Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        message: 'Authorization header missing'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'Token missing'
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 401,
      message: 'Invalid or expired token'
    });
  }
};

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not Found Middleware
const notFound = (req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found'
  });
};

module.exports = {
  validate,
  authenticateToken,
  errorHandler,
  notFound
};