const Dataset = require('../models/Dataset');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(Dataset, 'Dataset');

/**
 * @desc    Get all datasets with search
 * @route   GET /api/v1/datasets
 * @access  Public
 */
const getAllDatasets = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    status = 'published',
    featured,
    search,
    tags,
    sortBy = 'publishDate',
    order = 'desc',
  } = req.query;

  const query = { status };

  if (category) query.category = category;
  if (featured !== undefined) query.featured = featured === 'true';
  if (tags) query.tags = { $in: tags.split(',') };

  // Search in title, description, and tags
  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'description.en': { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [datasets, totalItems] = await Promise.all([
    Dataset.find(query)
      .populate('mda', 'name acronym')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Dataset.countDocuments(query),
  ]);

  paginatedResponse(res, datasets, page, limit, totalItems, 'Datasets retrieved successfully');
});

/**
 * @desc    Get dataset by ID
 * @route   GET /api/v1/datasets/:id
 * @access  Public
 */
const getDatasetById = catchAsync(async (req, res, next) => {
  const dataset = await Dataset.findById(req.params.id)
    .populate('mda', 'name acronym contactInfo')
    .populate('relatedDatasets', 'title slug category formats')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!dataset) {
    return next(new AppError('Dataset not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await dataset.incrementViews();

  successResponse(res, HTTP_STATUS.OK, { dataset }, 'Dataset retrieved successfully');
});

/**
 * @desc    Get dataset by slug
 * @route   GET /api/v1/datasets/slug/:slug
 * @access  Public
 */
const getDatasetBySlug = catchAsync(async (req, res, next) => {
  const dataset = await Dataset.findOne({ slug: req.params.slug })
    .populate('mda', 'name acronym contactInfo')
    .populate('relatedDatasets', 'title slug category formats')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!dataset) {
    return next(new AppError('Dataset not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await dataset.incrementViews();

  successResponse(res, HTTP_STATUS.OK, { dataset }, 'Dataset retrieved successfully');
});

/**
 * @desc    Get datasets by category
 * @route   GET /api/v1/datasets/category/:category
 * @access  Public
 */
const getDatasetsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sortBy = 'publishDate', order = 'desc' } = req.query;

  const query = { category, status: 'published' };

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [datasets, totalItems] = await Promise.all([
    Dataset.find(query)
      .populate('mda', 'name acronym')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Dataset.countDocuments(query),
  ]);

  paginatedResponse(res, datasets, page, limit, totalItems, 'Datasets retrieved successfully');
});

/**
 * @desc    Search datasets
 * @route   GET /api/v1/datasets/search
 * @access  Public
 */
const searchDatasets = catchAsync(async (req, res, next) => {
  const { q, page = 1, limit = 10, category } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', HTTP_STATUS.BAD_REQUEST));
  }

  const query = {
    status: 'published',
    $or: [
      { 'title.en': { $regex: q, $options: 'i' } },
      { 'description.en': { $regex: q, $options: 'i' } },
      { tags: { $regex: q, $options: 'i' } },
    ],
  };

  if (category) query.category = category;

  const skip = (page - 1) * limit;

  const [datasets, totalItems] = await Promise.all([
    Dataset.find(query)
      .populate('mda', 'name acronym')
      .sort({ views: -1, publishDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Dataset.countDocuments(query),
  ]);

  paginatedResponse(res, datasets, page, limit, totalItems, 'Datasets search results');
});

/**
 * @desc    Get featured datasets
 * @route   GET /api/v1/datasets/featured
 * @access  Public
 */
const getFeaturedDatasets = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;

  const datasets = await Dataset.find({ featured: true, status: 'published' })
    .populate('mda', 'name acronym')
    .sort({ views: -1, publishDate: -1 })
    .limit(parseInt(limit))
    .lean();

  successResponse(res, HTTP_STATUS.OK, { datasets }, 'Featured datasets retrieved successfully');
});

/**
 * @desc    Get popular datasets
 * @route   GET /api/v1/datasets/popular
 * @access  Public
 */
const getPopularDatasets = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;

  const datasets = await Dataset.find({ status: 'published' })
    .populate('mda', 'name acronym')
    .sort({ downloads: -1, views: -1 })
    .limit(parseInt(limit))
    .select('title slug description category downloads views formats')
    .lean();

  successResponse(res, HTTP_STATUS.OK, { datasets }, 'Popular datasets retrieved successfully');
});

/**
 * @desc    Get recently updated datasets
 * @route   GET /api/v1/datasets/recent
 * @access  Public
 */
const getRecentDatasets = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 10;

  const datasets = await Dataset.find({ status: 'published' })
    .populate('mda', 'name acronym')
    .sort({ lastUpdated: -1 })
    .limit(parseInt(limit))
    .lean();

  successResponse(res, HTTP_STATUS.OK, { datasets }, 'Recently updated datasets retrieved successfully');
});

/**
 * @desc    Increment download count
 * @route   POST /api/v1/datasets/:id/download
 * @access  Public
 */
const incrementDownload = catchAsync(async (req, res, next) => {
  const dataset = await Dataset.findById(req.params.id);

  if (!dataset) {
    return next(new AppError('Dataset not found', HTTP_STATUS.NOT_FOUND));
  }

  await dataset.incrementDownloads();

  logger.info(`Dataset downloaded: ${dataset.title.en} (ID: ${dataset._id})`);

  successResponse(res, HTTP_STATUS.OK, { downloads: dataset.downloads }, 'Download count updated');
});

/**
 * @desc    Get dataset statistics
 * @route   GET /api/v1/datasets/statistics
 * @access  Public
 */
const getDatasetStatistics = catchAsync(async (req, res, next) => {
  const [
    totalDatasets,
    publishedDatasets,
    totalDownloads,
    totalViews,
    categoryCounts,
  ] = await Promise.all([
    Dataset.countDocuments(),
    Dataset.countDocuments({ status: 'published' }),
    Dataset.aggregate([{ $group: { _id: null, total: { $sum: '$downloads' } } }]),
    Dataset.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Dataset.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const statistics = {
    totalDatasets,
    publishedDatasets,
    totalDownloads: totalDownloads.length > 0 ? totalDownloads[0].total : 0,
    totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
    categoryCounts,
  };

  successResponse(res, HTTP_STATUS.OK, { statistics }, 'Dataset statistics retrieved successfully');
});

/**
 * @desc    Get all unique tags
 * @route   GET /api/v1/datasets/tags
 * @access  Public
 */
const getAllTags = catchAsync(async (req, res, next) => {
  const tags = await Dataset.distinct('tags', { status: 'published' });

  successResponse(res, HTTP_STATUS.OK, { tags: tags.sort() }, 'Tags retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllDatasets,
  getDatasetById,
  getDatasetBySlug,
  getDatasetsByCategory,
  searchDatasets,
  getFeaturedDatasets,
  getPopularDatasets,
  getRecentDatasets,
  incrementDownload,
  getDatasetStatistics,
  getAllTags,
  createDataset: baseController.create,
  updateDataset: baseController.update,
  deleteDataset: baseController.remove,
};