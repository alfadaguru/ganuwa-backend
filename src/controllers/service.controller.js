const Service = require('../models/Service');
const createController = require('../utils/baseController');
const { catchAsync } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(Service, 'Service');

// Custom: Get services by category
const getServicesByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { category, status: 'active' };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [services, totalItems] = await Promise.all([
    Service.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Service.countDocuments(query),
  ]);

  paginatedResponse(res, services, page, limit, totalItems, 'Services retrieved successfully');
});

// Custom: Get service by slug
const getServiceBySlug = catchAsync(async (req, res, next) => {
  const service = await Service.findOne({ slug: req.params.slug });

  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  successResponse(res, 200, { service }, 'Service retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllServices: baseController.getAll,
  getServiceById: baseController.getById,
  getServicesByCategory,
  getServiceBySlug,
  createService: baseController.create,
  updateService: baseController.update,
  deleteService: baseController.remove,
};