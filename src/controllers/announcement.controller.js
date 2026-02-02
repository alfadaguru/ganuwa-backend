const Announcement = require('../models/Announcement');
const createController = require('../utils/baseController');
const { catchAsync } = require('../middlewares/error.middleware');
const { paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(Announcement, 'Announcement');

// Custom: Get announcements by priority
const getAnnouncementsByPriority = catchAsync(async (req, res, next) => {
  const { priority } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { priority, isActive: true };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [announcements, totalItems] = await Promise.all([
    Announcement.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Announcement.countDocuments(query),
  ]);

  paginatedResponse(res, announcements, page, limit, totalItems, 'Announcements retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllAnnouncements: baseController.getAll,
  getAnnouncementById: baseController.getById,
  getAnnouncementsByPriority,
  createAnnouncement: baseController.create,
  updateAnnouncement: baseController.update,
  deleteAnnouncement: baseController.remove,
};