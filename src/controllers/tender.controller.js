const Tender = require('../models/Tender');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(Tender, 'Tender');

/**
 * @desc    Get active tenders
 * @route   GET /api/v1/tenders/active
 * @access  Public
 */
const getActiveTenders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, category, sortBy = 'closingDate', order = 'asc' } = req.query;

  const now = new Date();
  const query = {
    status: 'open',
    openingDate: { $lte: now },
    closingDate: { $gte: now },
  };

  if (category) query.category = category;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [tenders, totalItems] = await Promise.all([
    Tender.find(query)
      .populate('mda', 'name acronym')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Tender.countDocuments(query),
  ]);

  paginatedResponse(res, tenders, page, limit, totalItems, 'Active tenders retrieved successfully');
});

/**
 * @desc    Get tender by tender number
 * @route   GET /api/v1/tenders/number/:tenderNumber
 * @access  Public
 */
const getTenderByNumber = catchAsync(async (req, res, next) => {
  const tender = await Tender.findOne({ tenderNumber: req.params.tenderNumber })
    .populate('mda', 'name acronym contactInfo')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!tender) {
    return next(new AppError('Tender not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await tender.incrementViews();

  successResponse(res, HTTP_STATUS.OK, { tender }, 'Tender retrieved successfully');
});

/**
 * @desc    Get tender by slug
 * @route   GET /api/v1/tenders/slug/:slug
 * @access  Public
 */
const getTenderBySlug = catchAsync(async (req, res, next) => {
  const tender = await Tender.findOne({ slug: req.params.slug })
    .populate('mda', 'name acronym contactInfo')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!tender) {
    return next(new AppError('Tender not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await tender.incrementViews();

  successResponse(res, HTTP_STATUS.OK, { tender }, 'Tender retrieved successfully');
});

/**
 * @desc    Get tenders by category
 * @route   GET /api/v1/tenders/category/:category
 * @access  Public
 */
const getTendersByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, status, sortBy = 'closingDate', order = 'asc' } = req.query;

  const query = { category };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [tenders, totalItems] = await Promise.all([
    Tender.find(query)
      .populate('mda', 'name acronym')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Tender.countDocuments(query),
  ]);

  paginatedResponse(res, tenders, page, limit, totalItems, 'Tenders retrieved successfully');
});

/**
 * @desc    Get upcoming tenders
 * @route   GET /api/v1/tenders/upcoming
 * @access  Public
 */
const getUpcomingTenders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const now = new Date();
  const query = {
    status: 'open',
    openingDate: { $gt: now },
  };

  const skip = (page - 1) * limit;

  const [tenders, totalItems] = await Promise.all([
    Tender.find(query)
      .populate('mda', 'name acronym')
      .sort({ openingDate: 1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Tender.countDocuments(query),
  ]);

  paginatedResponse(res, tenders, page, limit, totalItems, 'Upcoming tenders retrieved successfully');
});

/**
 * @desc    Get featured tenders
 * @route   GET /api/v1/tenders/featured
 * @access  Public
 */
const getFeaturedTenders = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;

  const now = new Date();
  const tenders = await Tender.find({
    featured: true,
    status: 'open',
    closingDate: { $gte: now },
  })
    .populate('mda', 'name acronym')
    .sort({ closingDate: 1 })
    .limit(parseInt(limit))
    .lean();

  successResponse(res, HTTP_STATUS.OK, { tenders }, 'Featured tenders retrieved successfully');
});

/**
 * @desc    Update tender with custom logic
 * @route   PUT /api/v1/tenders/:id
 * @access  Private
 */
const updateTender = catchAsync(async (req, res, next) => {
  const tender = await Tender.findById(req.params.id);

  if (!tender) {
    return next(new AppError('Tender not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update tender
  Object.assign(tender, req.body);
  tender.updatedBy = req.user._id;

  await tender.save();

  logger.info(`Tender updated: ${tender.tenderNumber} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { tender }, 'Tender updated successfully');
});

// Export all controllers
module.exports = {
  getAllTenders: baseController.getAll,
  getTenderById: baseController.getById,
  getActiveTenders,
  getUpcomingTenders,
  getFeaturedTenders,
  getTenderByNumber,
  getTenderBySlug,
  getTendersByCategory,
  createTender: baseController.create,
  updateTender,
  deleteTender: baseController.remove,
};