const listingsService = require('./listings.service');

const getAllListings = async (req, res, next) => {
  try {
    const { cropType, status, search, farmerOnly } = req.query;
    const farmerId = farmerOnly === 'true' && req.user ? req.user.id : undefined;

    const listings = await listingsService.getAllListings({
      farmerId,
      cropType,
      status,
      search,
    });

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await listingsService.getListingById(req.params.id);
    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

const createListing = async (req, res, next) => {
  try {
    const farmerId = req.user ? req.user.id : (req.body.farmerId || 'f0000000-0000-0000-0000-000000000001');

    const listing = await listingsService.createListing({
      farmerId,
      cropType: req.body.cropType,
      quantity: req.body.quantity || req.body.quantityTons,
      moisturePct: req.body.moisturePct,
      condition: req.body.condition,
      storageType: req.body.storageType || req.body.storageForm,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      photoUrl: req.body.photoUrl,
      availabilityStart: req.body.availabilityStart || req.body.availability,
      availabilityEnd: req.body.availabilityEnd,
      askingPrice: req.body.askingPrice,
      address: req.body.address || req.body.location,
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

const updateListingStatus = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const updated = await listingsService.updateListingStatus(req.params.id, req.body.status, userId);
    res.json({
      success: true,
      message: 'Listing status updated',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const deleteListing = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const result = await listingsService.deleteListing(req.params.id, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListingStatus,
  deleteListing,
};
