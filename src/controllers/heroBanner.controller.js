const HeroBanner = require('../models/HeroBanner');
const createController = require('../utils/baseController');
const { catchAsync } = require('../middlewares/error.middleware');
const { paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(HeroBanner, 'HeroBanner');

// Custom: Get active hero banners
const getActiveHeroBanners = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'displayOrder', order = 'asc' } = req.query;

  const query = {
    isActive: true,
    $or: [
      { displayPeriod: { start: { $lte: new Date() }, end: { $gte: new Date() } } },
      { 'displayPeriod.start': { $exists: false } }
    ]
  };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [heroBanners, totalItems] = await Promise.all([
    HeroBanner.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    HeroBanner.countDocuments(query),
  ]);

  paginatedResponse(res, heroBanners, page, limit, totalItems, 'Active hero banners retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllHeroBanners: baseController.getAll,
  getHeroBannerById: baseController.getById,
  getActiveHeroBanners,
  createHeroBanner: baseController.create,
  updateHeroBanner: baseController.update,
  deleteHeroBanner: baseController.remove,
};