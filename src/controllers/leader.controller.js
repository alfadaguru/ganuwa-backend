const Leader = require('../models/Leader');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { getPublicUrl } = require('../utils/s3Upload');

// If photo is an S3 key (no http), generate public URL
function resolvePhotoUrl(photo) {
  if (!photo) return photo;
  if (photo.startsWith('http')) return photo;
  return getPublicUrl(photo);
}

function resolveLeaderPhoto(leader) {
  if (!leader) return leader;
  const resolved = { ...leader };
  resolved.photo = resolvePhotoUrl(leader.photo);
  return resolved;
}

/**
 * @desc    Get all leaders
 * @route   GET /api/v1/leaders
 * @access  Public
 */
const getAllLeaders = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    position,
    ministry,
    isActive,
    sortBy = 'displayOrder',
    order = 'asc',
  } = req.query;

  const query = {};
  if (position) query.position = position;
  if (ministry) query.ministry = ministry;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [leadersRaw, totalItems] = await Promise.all([
    Leader.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Leader.countDocuments(query),
  ]);

  const leaders = await Promise.all(leadersRaw.map(resolveLeaderPhoto));

  paginatedResponse(res, leaders, page, limit, totalItems, 'Leaders retrieved successfully');
});

/**
 * @desc    Get single leader
 * @route   GET /api/v1/leaders/:id
 * @access  Public
 */
const getLeaderById = catchAsync(async (req, res, next) => {
  const leaderRaw = await Leader.findById(req.params.id).lean();

  if (!leaderRaw) {
    return next(new AppError('Leader not found', HTTP_STATUS.NOT_FOUND));
  }

  const leader = await resolveLeaderPhoto(leaderRaw);

  successResponse(res, HTTP_STATUS.OK, { leader }, 'Leader retrieved successfully');
});

/**
 * @desc    Create leader
 * @route   POST /api/v1/leaders
 * @access  Private (Admin)
 */
const createLeader = catchAsync(async (req, res, next) => {
  const leaderData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const leader = await Leader.create(leaderData);

  logger.info(`Leader created: ${leader.name} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.CREATED, { leader }, 'Leader created successfully');
});

/**
 * @desc    Update leader
 * @route   PUT /api/v1/leaders/:id
 * @access  Private (Admin)
 */
const updateLeader = catchAsync(async (req, res, next) => {
  const leader = await Leader.findById(req.params.id);

  if (!leader) {
    return next(new AppError('Leader not found', HTTP_STATUS.NOT_FOUND));
  }

  Object.assign(leader, req.body);
  leader.updatedBy = req.user._id;

  await leader.save();

  logger.info(`Leader updated: ${leader.name} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { leader }, 'Leader updated successfully');
});

/**
 * @desc    Delete leader
 * @route   DELETE /api/v1/leaders/:id
 * @access  Private (Super Admin)
 */
const deleteLeader = catchAsync(async (req, res, next) => {
  const leader = await Leader.findById(req.params.id);

  if (!leader) {
    return next(new AppError('Leader not found', HTTP_STATUS.NOT_FOUND));
  }

  await leader.deleteOne();

  logger.info(`Leader deleted: ${leader.name} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, 'Leader deleted successfully');
});

/**
 * @desc    Get leaders by position
 * @route   GET /api/v1/leaders/position/:position
 * @access  Public
 */
const getLeadersByPosition = catchAsync(async (req, res, next) => {
  const { position } = req.params;
  const { page = 1, limit = 20, sortBy = 'displayOrder', order = 'asc' } = req.query;

  const query = { position };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [leadersRaw, totalItems] = await Promise.all([
    Leader.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    Leader.countDocuments(query),
  ]);

  const leaders = await Promise.all(leadersRaw.map(resolveLeaderPhoto));

  paginatedResponse(res, leaders, page, limit, totalItems, `Leaders with position ${position} retrieved successfully`);
});

module.exports = {
  getAllLeaders,
  getLeaderById,
  getLeadersByPosition,
  createLeader,
  updateLeader,
  deleteLeader,
};
