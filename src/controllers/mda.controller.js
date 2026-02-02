const MDA = require('../models/MDA');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(MDA, 'MDA');

// Custom: Get MDAs by type
const getMDAsByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { page = 1, limit = 10, sortBy = 'name.en', order = 'asc' } = req.query;

  const query = { type };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [mdas, totalItems] = await Promise.all([
    MDA.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    MDA.countDocuments(query),
  ]);

  paginatedResponse(res, mdas, page, limit, totalItems, 'MDAs retrieved successfully');
});

// Custom: Get MDA by slug
const getMDABySlug = catchAsync(async (req, res, next) => {
  const mda = await MDA.findOne({ slug: req.params.slug });

  if (!mda) {
    return next(new AppError('MDA not found', 404));
  }

  successResponse(res, 200, { mda }, 'MDA retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllMDAs: baseController.getAll,
  getMDAById: baseController.getById,
  getMDAsByType,
  getMDABySlug,
  createMDA: baseController.create,
  updateMDA: baseController.update,
  deleteMDA: baseController.remove,
};