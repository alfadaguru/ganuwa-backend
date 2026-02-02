const QuickLink = require('../models/QuickLink');
const createController = require('../utils/baseController');

// Create base CRUD operations
const baseController = createController(QuickLink, 'QuickLink');

// Export all controllers
module.exports = {
  getAllQuickLinks: baseController.getAll,
  getQuickLinkById: baseController.getById,
  createQuickLink: baseController.create,
  updateQuickLink: baseController.update,
  deleteQuickLink: baseController.remove,
};