const BudgetDocument = require('../models/BudgetDocument');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(BudgetDocument, 'BudgetDocument');

/**
 * @desc    Get budget documents by category
 * @route   GET /api/v1/budget-documents/category/:category
 * @access  Public
 */
const getBudgetDocumentsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, year, sortBy = 'year', order = 'desc' } = req.query;

  const query = { category, status: 'published' };
  if (year) query.year = parseInt(year);

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [documents, totalItems] = await Promise.all([
    BudgetDocument.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    BudgetDocument.countDocuments(query),
  ]);

  paginatedResponse(res, documents, page, limit, totalItems, 'Budget documents retrieved successfully');
});

/**
 * @desc    Get budget documents by year
 * @route   GET /api/v1/budget-documents/year/:year
 * @access  Public
 */
const getBudgetDocumentsByYear = catchAsync(async (req, res, next) => {
  const { year } = req.params;
  const { page = 1, limit = 10, category, sortBy = 'category', order = 'asc' } = req.query;

  const query = { year: parseInt(year), status: 'published' };
  if (category) query.category = category;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [documents, totalItems] = await Promise.all([
    BudgetDocument.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    BudgetDocument.countDocuments(query),
  ]);

  paginatedResponse(res, documents, page, limit, totalItems, 'Budget documents retrieved successfully');
});

/**
 * @desc    Get budget document by slug
 * @route   GET /api/v1/budget-documents/slug/:slug
 * @access  Public
 */
const getBudgetDocumentBySlug = catchAsync(async (req, res, next) => {
  const document = await BudgetDocument.findOne({ slug: req.params.slug })
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!document) {
    return next(new AppError('Budget document not found', HTTP_STATUS.NOT_FOUND));
  }

  successResponse(res, HTTP_STATUS.OK, { budgetDocument: document }, 'Budget document retrieved successfully');
});

/**
 * @desc    Increment download count
 * @route   POST /api/v1/budget-documents/:id/download
 * @access  Public
 */
const incrementDownload = catchAsync(async (req, res, next) => {
  const document = await BudgetDocument.findById(req.params.id);

  if (!document) {
    return next(new AppError('Budget document not found', HTTP_STATUS.NOT_FOUND));
  }

  await document.incrementDownloads();

  logger.info(`Budget document downloaded: ${document.title.en} (ID: ${document._id})`);

  successResponse(res, HTTP_STATUS.OK, { downloads: document.downloads }, 'Download count updated');
});

/**
 * @desc    Get featured budget documents
 * @route   GET /api/v1/budget-documents/featured
 * @access  Public
 */
const getFeaturedBudgetDocuments = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;

  const documents = await BudgetDocument.find({ featured: true, status: 'published' })
    .sort({ year: -1, publishDate: -1 })
    .limit(parseInt(limit))
    .lean();

  successResponse(res, HTTP_STATUS.OK, { budgetDocuments: documents }, 'Featured budget documents retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllBudgetDocuments: baseController.getAll,
  getBudgetDocumentById: baseController.getById,
  getBudgetDocumentsByCategory,
  getBudgetDocumentsByYear,
  getBudgetDocumentBySlug,
  createBudgetDocument: baseController.create,
  updateBudgetDocument: baseController.update,
  deleteBudgetDocument: baseController.remove,
  incrementDownload,
  getFeaturedBudgetDocuments,
};