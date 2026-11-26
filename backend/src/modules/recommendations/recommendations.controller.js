const recommendationsService = require('./recommendations.service');

const getRecommendations = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const data = await recommendationsService.generateRecommendations(listingId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
