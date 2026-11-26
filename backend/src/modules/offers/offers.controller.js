const offersService = require('./offers.service');

const getOffers = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const role = req.user ? req.user.role : undefined;
    const { listingId } = req.query;

    const offers = await offersService.getOffers({
      userId,
      role,
      listingId,
    });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const offer = await offersService.createOffer({
      listingId: req.body.listingId,
      buyerId: req.user && req.user.role === 'BUYER' ? req.user.id : req.body.buyerId,
      farmerId: req.user && req.user.role === 'FARMER' ? req.user.id : req.body.farmerId,
      pathway: req.body.pathway,
      proposedQuantityTons: req.body.proposedQuantityTons || req.body.quantity,
      agreedPricePerTon: req.body.agreedPricePerTon || req.body.price,
      message: req.body.message,
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully',
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

const updateOfferStatus = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const updated = await offersService.updateOfferStatus(req.params.id, req.body.status, userId);
    res.json({
      success: true,
      message: `Offer status updated to ${req.body.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOffers,
  createOffer,
  updateOfferStatus,
};
