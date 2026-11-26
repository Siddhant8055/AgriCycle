const { Router } = require('express');
const offersController = require('./offers.controller');
const jwt = require('jsonwebtoken');
const { config } = require('../../config/environment');

const offersRouter = Router();

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

offersRouter.get('/', optionalJwt, offersController.getOffers);
offersRouter.post('/', optionalJwt, offersController.createOffer);
offersRouter.patch('/:id/status', optionalJwt, offersController.updateOfferStatus);

module.exports = offersRouter;
