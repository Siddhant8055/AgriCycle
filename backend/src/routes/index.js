const { Router } = require('express');
const { checkDatabaseHealth } = require('../config/database');
const authRoutes = require('../modules/auth/auth.routes');
const listingsRoutes = require('../modules/listings/listings.routes');
const recommendationsRoutes = require('../modules/recommendations/recommendations.routes');
const buyersRoutes = require('../modules/buyers/buyers.routes');
const offersRoutes = require('../modules/offers/offers.routes');

const apiRouter = Router();

apiRouter.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  res.json({
    success: true,
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'AgriCycle Backend API',
      database: dbHealthy ? 'CONNECTED' : 'DISCONNECTED',
      version: '1.0.0',
    },
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/listings', listingsRoutes);
apiRouter.use('/recommendations', recommendationsRoutes);
apiRouter.use('/buyers', buyersRoutes);
apiRouter.use('/offers', offersRoutes);
apiRouter.use('/marketplace', listingsRoutes);

module.exports = apiRouter;
