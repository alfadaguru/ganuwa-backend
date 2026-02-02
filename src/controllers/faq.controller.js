const FAQ = require('../models/FAQ');
const createController = require('../utils/baseController');
const { catchAsync } = require('../middlewares/error.middleware');
const { paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(FAQ, 'FAQ');

// Custom: Get FAQs by category
const getFAQsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 20, sortBy = 'displayOrder', order = 'asc' } = req.query;

  const query = { category, isActive: true };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [faqs, totalItems] = await Promise.all([
    FAQ.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    FAQ.countDocuments(query),
  ]);

  paginatedResponse(res, faqs, page, limit, totalItems, 'FAQs retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllFAQs: baseController.getAll,
  getFAQById: baseController.getById,
  getFAQsByCategory,
  createFAQ: baseController.create,
  updateFAQ: baseController.update,
  deleteFAQ: baseController.remove,
};