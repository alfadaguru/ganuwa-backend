const LGA = require('../models/LGA');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(LGA, 'LGA');

// Custom: Get LGA by slug
const getLGABySlug = catchAsync(async (req, res, next) => {
  const lga = await LGA.findOne({ slug: req.params.slug });

  if (!lga) {
    return next(new AppError('LGA not found', 404));
  }

  successResponse(res, 200, { lga }, 'LGA retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllLGAs: baseController.getAll,
  getLGAById: baseController.getById,
  getLGABySlug,
  createLGA: baseController.create,
  updateLGA: baseController.update,
  deleteLGA: baseController.remove,
};