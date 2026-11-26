const { Router } = require('express');
const buyersController = require('./buyers.controller');
const jwt = require('jsonwebtoken');
const { config } = require('../../config/environment');

const buyersRouter = Router();

const optionalJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
    } catch {
      // Intentionally silent
    }
  }
  next();
};

buyersRouter.get('/requirements', optionalJwt, buyersController.getRequirements);
buyersRouter.post('/requirements', optionalJwt, buyersController.createRequirement);

module.exports = buyersRouter;
