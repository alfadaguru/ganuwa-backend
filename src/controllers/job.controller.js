const Job = require('../models/Job');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(Job, 'Job');

/**
 * @desc    Get open jobs
 * @route   GET /api/v1/jobs/open
 * @access  Public
 */
const getOpenJobs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, department, jobType, location, sortBy = 'postDate', order = 'desc' } = req.query;

  const now = new Date();
  const query = {
    status: 'open',
    applicationDeadline: { $gte: now },
  };

  if (department) query.department = department;
  if (jobType) query.jobType = jobType;
  if (location) query.location = { $regex: location, $options: 'i' };

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [jobs, totalItems] = await Promise.all([
    Job.find(query)
      .populate('mda', 'name acronym')
      .populate('createdBy', 'firstName lastName')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Job.countDocuments(query),
  ]);

  paginatedResponse(res, jobs, page, limit, totalItems, 'Open jobs retrieved successfully');
});

/**
 * @desc    Get jobs by department
 * @route   GET /api/v1/jobs/department/:department
 * @access  Public
 */
const getJobsByDepartment = catchAsync(async (req, res, next) => {
  const { department } = req.params;
  const { page = 1, limit = 10, status = 'open', sortBy = 'postDate', order = 'desc' } = req.query;

  const query = { department };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [jobs, totalItems] = await Promise.all([
    Job.find(query)
      .populate('mda', 'name acronym')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Job.countDocuments(query),
  ]);

  paginatedResponse(res, jobs, page, limit, totalItems, 'Jobs retrieved successfully');
});

/**
 * @desc    Get job by slug
 * @route   GET /api/v1/jobs/slug/:slug
 * @access  Public
 */
const getJobBySlug = catchAsync(async (req, res, next) => {
  const job = await Job.findOne({ slug: req.params.slug })
    .populate('mda', 'name acronym contactInfo')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!job) {
    return next(new AppError('Job not found', HTTP_STATUS.NOT_FOUND));
  }

  // Increment views
  await job.incrementViews();

  successResponse(res, HTTP_STATUS.OK, { job }, 'Job retrieved successfully');
});

/**
 * @desc    Get jobs by type
 * @route   GET /api/v1/jobs/type/:jobType
 * @access  Public
 */
const getJobsByType = catchAsync(async (req, res, next) => {
  const { jobType } = req.params;
  const { page = 1, limit = 10, status = 'open', sortBy = 'postDate', order = 'desc' } = req.query;

  const query = { jobType };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [jobs, totalItems] = await Promise.all([
    Job.find(query)
      .populate('mda', 'name acronym')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Job.countDocuments(query),
  ]);

  paginatedResponse(res, jobs, page, limit, totalItems, 'Jobs retrieved successfully');
});

/**
 * @desc    Get featured jobs
 * @route   GET /api/v1/jobs/featured
 * @access  Public
 */
const getFeaturedJobs = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 5;

  const now = new Date();
  const jobs = await Job.find({
    featured: true,
    status: 'open',
    applicationDeadline: { $gte: now },
  })
    .populate('mda', 'name acronym')
    .sort({ postDate: -1 })
    .limit(parseInt(limit))
    .lean();

  successResponse(res, HTTP_STATUS.OK, { jobs }, 'Featured jobs retrieved successfully');
});

/**
 * @desc    Increment application count
 * @route   POST /api/v1/jobs/:id/apply
 * @access  Public
 */
const incrementApplications = catchAsync(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new AppError('Job not found', HTTP_STATUS.NOT_FOUND));
  }

  if (job.status !== 'open') {
    return next(new AppError('This job is no longer accepting applications', HTTP_STATUS.BAD_REQUEST));
  }

  const now = new Date();
  if (job.applicationDeadline < now) {
    return next(new AppError('Application deadline has passed', HTTP_STATUS.BAD_REQUEST));
  }

  await job.incrementApplications();

  logger.info(`Job application submitted: ${job.title.en} (ID: ${job._id})`);

  successResponse(res, HTTP_STATUS.OK, { applications: job.applications }, 'Application recorded successfully');
});

/**
 * @desc    Get job statistics
 * @route   GET /api/v1/jobs/statistics
 * @access  Public
 */
const getJobStatistics = catchAsync(async (req, res, next) => {
  const now = new Date();

  const [openJobs, totalJobs, filledJobs, totalApplications] = await Promise.all([
    Job.countDocuments({ status: 'open', applicationDeadline: { $gte: now } }),
    Job.countDocuments(),
    Job.countDocuments({ status: 'filled' }),
    Job.aggregate([{ $group: { _id: null, total: { $sum: '$applications' } } }]),
  ]);

  const statistics = {
    openJobs,
    totalJobs,
    filledJobs,
    closedJobs: totalJobs - openJobs - filledJobs,
    totalApplications: totalApplications.length > 0 ? totalApplications[0].total : 0,
  };

  successResponse(res, HTTP_STATUS.OK, { statistics }, 'Job statistics retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllJobs: baseController.getAll,
  getJobById: baseController.getById,
  getOpenJobs,
  getFeaturedJobs,
  getJobsByDepartment,
  getJobsByType,
  getJobBySlug,
  createJob: baseController.create,
  updateJob: baseController.update,
  deleteJob: baseController.remove,
  incrementApplications,
  getJobStatistics,
};