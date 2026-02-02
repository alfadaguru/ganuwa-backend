const Page = require('../models/Page');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(Page, 'Page');

// Custom: Get page by slug
const getPageBySlug = catchAsync(async (req, res, next) => {
  const page = await Page.findOne({ slug: req.params.slug });

  if (!page) {
    return next(new AppError('Page not found', 404));
  }

  // Increment views
  page.views += 1;
  await page.save();

  successResponse(res, 200, { page }, 'Page retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllPages: baseController.getAll,
  getPageById: baseController.getById,
  getPageBySlug,
  createPage: baseController.create,
  updatePage: baseController.update,
  deletePage: baseController.remove,
};