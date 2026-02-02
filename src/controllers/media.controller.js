const MediaGallery = require('../models/MediaGallery');
const createController = require('../utils/baseController');
const { catchAsync } = require('../middlewares/error.middleware');
const { paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(MediaGallery, 'Media');

// Custom: Get media by type
const getMediaByType = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { type };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [media, totalItems] = await Promise.all([
    MediaGallery.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    MediaGallery.countDocuments(query),
  ]);

  paginatedResponse(res, media, page, limit, totalItems, 'Media retrieved successfully');
});

// Custom: Get media by album
const getMediaByAlbum = catchAsync(async (req, res, next) => {
  const { album } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { album };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [media, totalItems] = await Promise.all([
    MediaGallery.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    MediaGallery.countDocuments(query),
  ]);

  paginatedResponse(res, media, page, limit, totalItems, 'Media retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllMedia: baseController.getAll,
  getMediaById: baseController.getById,
  getMediaByType,
  getMediaByAlbum,
  createMedia: baseController.create,
  updateMedia: baseController.update,
  deleteMedia: baseController.remove,
};