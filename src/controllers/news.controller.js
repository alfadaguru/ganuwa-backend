const News = require('../models/News');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { getPresignedUrl } = require('../utils/s3Upload');

/**
 * Resolve featuredImage URL - if it's an S3 key (not http), generate presigned URL
 */
async function resolveNewsImage(newsItem) {
  if (!newsItem) return newsItem;
  const obj = newsItem.toObject ? newsItem.toObject() : { ...newsItem };
  if (obj.featuredImage?.url && !obj.featuredImage.url.startsWith('http')) {
    try {
      obj.featuredImage.url = await getPresignedUrl(obj.featuredImage.url, 604800);
    } catch (e) {
      // keep original value on failure
    }
  }
  return obj;
}

async function resolveNewsImages(newsArray) {
  return Promise.all(newsArray.map(resolveNewsImage));
}

/**
 * @desc    Get all news
 * @route   GET /api/v1/news
 * @access  Public
 */
const getAllNews = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    featured,
    search,
    sortBy = 'publishDate',
    order = 'desc',
    language = 'en',
  } = req.query;

  // Build query
  const query = {};

  if (category) query.category = category;
  if (status) query.status = status;
  if (featured !== undefined) query.featured = featured === 'true';

  // Search in title and excerpt
  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'excerpt.en': { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Get news with pagination
  const [news, totalItems] = await Promise.all([
    News.find(query)
      .populate('author', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    News.countDocuments(query),
  ]);

  const resolvedNews = await resolveNewsImages(news);
  paginatedResponse(res, resolvedNews, page, limit, totalItems, 'News retrieved successfully');
});

/**
 * @desc    Get single news by ID
 * @route   GET /api/v1/news/:id
 * @access  Public
 */
const getNewsById = catchAsync(async (req, res, next) => {
  const news = await News.findById(req.params.id)
    .populate('author', 'firstName lastName email profileImage')
    .populate('relatedNews', 'title slug featuredImage category publishDate');

  if (!news) {
    return next(new AppError('News not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await news.incrementViews();

  const resolved = await resolveNewsImage(news);
  successResponse(res, HTTP_STATUS.OK, { news: resolved }, 'News retrieved successfully');
});

/**
 * @desc    Get news by slug
 * @route   GET /api/v1/news/slug/:slug
 * @access  Public
 */
const getNewsBySlug = catchAsync(async (req, res, next) => {
  const news = await News.findOne({ slug: req.params.slug })
    .populate('author', 'firstName lastName email profileImage')
    .populate('relatedNews', 'title slug featuredImage category publishDate');

  if (!news) {
    return next(new AppError('News not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await news.incrementViews();

  const resolved = await resolveNewsImage(news);
  successResponse(res, HTTP_STATUS.OK, { news: resolved }, 'News retrieved successfully');
});

/**
 * @desc    Create new news
 * @route   POST /api/v1/news
 * @access  Private (Author, Editor, Admin)
 */
const createNews = catchAsync(async (req, res, next) => {
  const newsData = {
    ...req.body,
    author: req.user._id,
    authorName: req.user.fullName,
    createdBy: req.user._id,
  };

  const news = await News.create(newsData);

  logger.info(`News created: ${news.title.en} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.CREATED, { news }, 'News created successfully');
});

/**
 * @desc    Update news
 * @route   PUT /api/v1/news/:id
 * @access  Private (Owner, Editor, Admin)
 */
const updateNews = catchAsync(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError('News not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update news
  Object.assign(news, req.body);
  news.updatedBy = req.user._id;

  await news.save();

  logger.info(`News updated: ${news.title.en} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { news }, 'News updated successfully');
});

/**
 * @desc    Delete news
 * @route   DELETE /api/v1/news/:id
 * @access  Private (Admin)
 */
const deleteNews = catchAsync(async (req, res, next) => {
  const news = await News.findById(req.params.id);

  if (!news) {
    return next(new AppError('News not found', HTTP_STATUS.NOT_FOUND));
  }

  await news.deleteOne();

  logger.info(`News deleted: ${news.title.en} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, 'News deleted successfully');
});

/**
 * @desc    Get featured news
 * @route   GET /api/v1/news/featured
 * @access  Public
 */
const getFeaturedNews = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;

  const news = await News.find({ featured: true, status: 'published' })
    .populate('author', 'firstName lastName')
    .sort({ publishDate: -1 })
    .limit(parseInt(limit))
    .lean();

  const resolvedNews = await resolveNewsImages(news);
  successResponse(res, HTTP_STATUS.OK, { news: resolvedNews }, 'Featured news retrieved successfully');
});

/**
 * @desc    Get related news
 * @route   GET /api/v1/news/:id/related
 * @access  Public
 */
const getRelatedNews = catchAsync(async (req, res, next) => {
  const currentNews = await News.findById(req.params.id);

  if (!currentNews) {
    return next(new AppError('News not found', HTTP_STATUS.NOT_FOUND));
  }

  const limit = req.query.limit || 5;

  const relatedNews = await News.find({
    _id: { $ne: currentNews._id },
    category: currentNews.category,
    status: 'published',
  })
    .select('title slug excerpt featuredImage category publishDate')
    .sort({ publishDate: -1 })
    .limit(parseInt(limit))
    .lean();

  const resolvedRelated = await resolveNewsImages(relatedNews);
  successResponse(res, HTTP_STATUS.OK, { news: resolvedRelated }, 'Related news retrieved successfully');
});

module.exports = {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  getFeaturedNews,
  getRelatedNews,
};