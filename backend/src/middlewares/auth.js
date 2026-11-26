const jwt = require('jsonwebtoken');
const { config } = require('../config/environment');
const { AppError } = require('./errorHandler');

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: required role ${allowedRoles.join(' or ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = { authenticateJwt, requireRole };
