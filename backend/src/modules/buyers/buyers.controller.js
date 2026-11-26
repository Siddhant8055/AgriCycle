const buyersService = require('./buyers.service');

const getRequirements = async (req, res, next) => {
  try {
    const { cropType, pathway, myOnly } = req.query;
    const buyerId = myOnly === 'true' && req.user ? req.user.id : undefined;

    const requirements = await buyersService.getRequirements({
      cropType,
      buyerId,
      pathway,
    });

    res.json({
      success: true,
      count: requirements.length,
      data: requirements,
    });
  } catch (error) {
    next(error);
  }
};

const createRequirement = async (req, res, next) => {
  try {
    const buyerId = req.user ? req.user.id : (req.body.buyerId || 'b0000000-0000-0000-0000-000000000001');

    const created = await buyersService.createRequirement({
      buyerId,
      cropType: req.body.cropType,
      pathway: req.body.pathway,
      minQuantityTons: req.body.minQuantityTons || req.body.minQty,
      maxQuantityTons: req.body.maxQuantityTons || req.body.maxQty,
      maxMoisturePct: req.body.maxMoisturePct,
      offeredPricePerTon: req.body.offeredPricePerTon || req.body.price,
      serviceRadiusKm: req.body.serviceRadiusKm || req.body.radius,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      terms: req.body.terms,
    });

    res.status(201).json({
      success: true,
      message: 'Buyer requirement published successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequirements,
  createRequirement,
};
