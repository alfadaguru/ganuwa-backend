const FOIRequest = require('../models/FOIRequest');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(FOIRequest, 'FOIRequest');

/**
 * @desc    Create FOI request (public submission)
 * @route   POST /api/v1/foi-requests
 * @access  Public
 */
const createFOIRequest = catchAsync(async (req, res, next) => {
  const requestData = {
    requesterName: req.body.requesterName,
    requesterEmail: req.body.requesterEmail,
    requesterPhone: req.body.requesterPhone,
    requestType: req.body.requestType,
    subject: req.body.subject,
    description: req.body.description,
    mda: req.body.mda,
  };

  const foiRequest = await FOIRequest.create(requestData);

  logger.info(`FOI Request created: ${foiRequest.requestNumber} by ${foiRequest.requesterEmail}`);

  successResponse(
    res,
    HTTP_STATUS.CREATED,
    { foiRequest },
    'FOI request submitted successfully. You will receive updates via email.'
  );
});

/**
 * @desc    Get all FOI requests (Admin)
 * @route   GET /api/v1/foi-requests
 * @access  Private
 */
const getAllFOIRequests = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    requestType,
    mda,
    assignedTo,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (requestType) query.requestType = requestType;
  if (mda) query.mda = mda;
  if (assignedTo) query.assignedTo = assignedTo;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [requests, totalItems] = await Promise.all([
    FOIRequest.find(query)
      .populate('mda', 'name acronym')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    FOIRequest.countDocuments(query),
  ]);

  paginatedResponse(res, requests, page, limit, totalItems, 'FOI requests retrieved successfully');
});

/**
 * @desc    Get FOI request by ID
 * @route   GET /api/v1/foi-requests/:id
 * @access  Private
 */
const getFOIRequestById = catchAsync(async (req, res, next) => {
  const foiRequest = await FOIRequest.findById(req.params.id)
    .populate('mda', 'name acronym contactInfo')
    .populate('assignedTo', 'firstName lastName email profileImage')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('statusHistory.changedBy', 'firstName lastName email')
    .populate('internalNotes.addedBy', 'firstName lastName email');

  if (!foiRequest) {
    return next(new AppError('FOI request not found', HTTP_STATUS.NOT_FOUND));
  }

  successResponse(res, HTTP_STATUS.OK, { foiRequest }, 'FOI request retrieved successfully');
});

/**
 * @desc    Get FOI request by request number
 * @route   GET /api/v1/foi-requests/number/:requestNumber
 * @access  Public
 */
const getFOIRequestByNumber = catchAsync(async (req, res, next) => {
  const foiRequest = await FOIRequest.findOne({ requestNumber: req.params.requestNumber })
    .populate('mda', 'name acronym')
    .select('-internalNotes -statusHistory'); // Hide internal fields from public

  if (!foiRequest) {
    return next(new AppError('FOI request not found', HTTP_STATUS.NOT_FOUND));
  }

  successResponse(res, HTTP_STATUS.OK, { foiRequest }, 'FOI request retrieved successfully');
});

/**
 * @desc    Get my FOI requests (by email)
 * @route   GET /api/v1/foi-requests/my/:email
 * @access  Public
 */
const getMyFOIRequests = catchAsync(async (req, res, next) => {
  const { email } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  const query = { requesterEmail: email.toLowerCase() };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [requests, totalItems] = await Promise.all([
    FOIRequest.find(query)
      .populate('mda', 'name acronym')
      .select('-internalNotes -statusHistory') // Hide internal fields
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    FOIRequest.countDocuments(query),
  ]);

  paginatedResponse(res, requests, page, limit, totalItems, 'Your FOI requests retrieved successfully');
});

/**
 * @desc    Update FOI request status
 * @route   PUT /api/v1/foi-requests/:id/status
 * @access  Private
 */
const updateFOIRequestStatus = catchAsync(async (req, res, next) => {
  const { status, responseText, responseDocuments, note } = req.body;

  const foiRequest = await FOIRequest.findById(req.params.id);

  if (!foiRequest) {
    return next(new AppError('FOI request not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update status
  foiRequest.status = status;
  foiRequest.updatedBy = req.user._id;

  // Add status to history
  foiRequest.addStatusHistory(status, req.user._id, note || '');

  // If completing or rejecting, add response
  if (status === 'completed' || status === 'rejected') {
    foiRequest.responseText = responseText;
    foiRequest.responseDate = new Date();
    if (responseDocuments) {
      foiRequest.responseDocuments = responseDocuments;
    }
  }

  await foiRequest.save();

  logger.info(`FOI Request ${foiRequest.requestNumber} status updated to ${status} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { foiRequest }, 'FOI request status updated successfully');
});

/**
 * @desc    Assign FOI request to user
 * @route   PUT /api/v1/foi-requests/:id/assign
 * @access  Private
 */
const assignFOIRequest = catchAsync(async (req, res, next) => {
  const { assignedTo } = req.body;

  const foiRequest = await FOIRequest.findById(req.params.id);

  if (!foiRequest) {
    return next(new AppError('FOI request not found', HTTP_STATUS.NOT_FOUND));
  }

  foiRequest.assignedTo = assignedTo;
  foiRequest.assignedDate = new Date();
  foiRequest.status = 'processing';
  foiRequest.updatedBy = req.user._id;

  foiRequest.addStatusHistory('processing', req.user._id, `Assigned to user ${assignedTo}`);

  await foiRequest.save();

  logger.info(`FOI Request ${foiRequest.requestNumber} assigned to ${assignedTo} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { foiRequest }, 'FOI request assigned successfully');
});

/**
 * @desc    Add internal note to FOI request
 * @route   POST /api/v1/foi-requests/:id/notes
 * @access  Private
 */
const addInternalNote = catchAsync(async (req, res, next) => {
  const { note } = req.body;

  const foiRequest = await FOIRequest.findById(req.params.id);

  if (!foiRequest) {
    return next(new AppError('FOI request not found', HTTP_STATUS.NOT_FOUND));
  }

  foiRequest.addInternalNote(note, req.user._id);
  await foiRequest.save();

  logger.info(`Internal note added to FOI Request ${foiRequest.requestNumber} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { foiRequest }, 'Internal note added successfully');
});

/**
 * @desc    Get FOI request statistics
 * @route   GET /api/v1/foi-requests/statistics
 * @access  Private
 */
const getFOIRequestStatistics = catchAsync(async (req, res, next) => {
  const [total, pending, processing, completed, rejected, overdue] = await Promise.all([
    FOIRequest.countDocuments(),
    FOIRequest.countDocuments({ status: 'pending' }),
    FOIRequest.countDocuments({ status: 'processing' }),
    FOIRequest.countDocuments({ status: 'completed' }),
    FOIRequest.countDocuments({ status: 'rejected' }),
    FOIRequest.countDocuments({
      status: { $in: ['pending', 'processing'] },
      dueDate: { $lt: new Date() },
    }),
  ]);

  const statistics = {
    total,
    pending,
    processing,
    completed,
    rejected,
    overdue,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
  };

  successResponse(res, HTTP_STATUS.OK, { statistics }, 'FOI request statistics retrieved successfully');
});

// Export all controllers
module.exports = {
  createFOIRequest,
  getAllFOIRequests,
  getFOIRequestById,
  getFOIRequestByNumber,
  getMyFOIRequests,
  updateFOIRequestStatus,
  assignFOIRequest,
  addInternalNote,
  getFOIRequestStatistics,
  updateFOIRequest: baseController.update,
  deleteFOIRequest: baseController.remove,
};