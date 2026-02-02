const PressRelease = require('../models/PressRelease');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(PressRelease, 'PressRelease');

// Custom: Get press release by slug
const getPressReleaseBySlug = catchAsync(async (req, res, next) => {
  const pressRelease = await PressRelease.findOne({ slug: req.params.slug });

  if (!pressRelease) {
    return next(new AppError('Press Release not found', 404));
  }

  // Increment views
  pressRelease.views += 1;
  await pressRelease.save();

  successResponse(res, 200, { pressRelease }, 'Press Release retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllPressReleases: baseController.getAll,
  getPressReleaseById: baseController.getById,
  getPressReleaseBySlug,
  createPressRelease: baseController.create,
  updatePressRelease: baseController.update,
  deletePressRelease: baseController.remove,
};