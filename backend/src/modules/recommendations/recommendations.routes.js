const { Router } = require('express');
const recommendationsController = require('./recommendations.controller');

const recommendationsRouter = Router();

recommendationsRouter.get('/listings/:listingId', recommendationsController.getRecommendations);
recommendationsRouter.get('/:listingId', recommendationsController.getRecommendations);

module.exports = recommendationsRouter;
