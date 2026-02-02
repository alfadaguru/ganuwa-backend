const Event = require('../models/Event');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(Event, 'Event');

// Custom: Get upcoming events
const getUpcomingEvents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'startDate', order = 'asc' } = req.query;

  const query = { startDate: { $gte: new Date() }, status: 'published' };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [events, totalItems] = await Promise.all([
    Event.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Event.countDocuments(query),
  ]);

  paginatedResponse(res, events, page, limit, totalItems, 'Upcoming events retrieved successfully');
});

// Custom: Get past events
const getPastEvents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sortBy = 'startDate', order = 'desc' } = req.query;

  const query = { endDate: { $lt: new Date() }, status: 'published' };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [events, totalItems] = await Promise.all([
    Event.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Event.countDocuments(query),
  ]);

  paginatedResponse(res, events, page, limit, totalItems, 'Past events retrieved successfully');
});

// Custom: Get events by category
const getEventsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { category };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [events, totalItems] = await Promise.all([
    Event.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Event.countDocuments(query),
  ]);

  paginatedResponse(res, events, page, limit, totalItems, 'Events retrieved successfully');
});

// Custom: Get event by slug
const getEventBySlug = catchAsync(async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug });

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  successResponse(res, 200, { event }, 'Event retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllEvents: baseController.getAll,
  getEventById: baseController.getById,
  getUpcomingEvents,
  getPastEvents,
  getEventsByCategory,
  getEventBySlug,
  createEvent: baseController.create,
  updateEvent: baseController.update,
  deleteEvent: baseController.remove,
};