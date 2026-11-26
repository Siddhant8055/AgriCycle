const { Router } = require('express');
const listingsController = require('./listings.controller');
const jwt = require('jsonwebtoken');
const { config } = require('../../config/environment');

const listingsRouter = Router();

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

listingsRouter.get('/', optionalJwt, listingsController.getAllListings);
listingsRouter.get('/:id', optionalJwt, listingsController.getListingById);
listingsRouter.post('/', optionalJwt, listingsController.createListing);
listingsRouter.patch('/:id/status', optionalJwt, listingsController.updateListingStatus);
listingsRouter.delete('/:id', optionalJwt, listingsController.deleteListing);

module.exports = listingsRouter;
