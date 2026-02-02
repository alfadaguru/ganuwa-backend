const Project = require('../models/Project');
const createController = require('../utils/baseController');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const { successResponse, paginatedResponse } = require('../utils/response');

// Create base CRUD operations
const baseController = createController(Project, 'Project');

// Custom: Get projects by status
const getProjectsByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { status };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [projects, totalItems] = await Promise.all([
    Project.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Project.countDocuments(query),
  ]);

  paginatedResponse(res, projects, page, limit, totalItems, 'Projects retrieved successfully');
});

// Custom: Get projects by category
const getProjectsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

  const query = { category };
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  const [projects, totalItems] = await Promise.all([
    Project.find(query).sort({ [sortBy]: sortOrder }).limit(parseInt(limit)).skip(skip).lean(),
    Project.countDocuments(query),
  ]);

  paginatedResponse(res, projects, page, limit, totalItems, 'Projects retrieved successfully');
});

// Custom: Get project by slug
const getProjectBySlug = catchAsync(async (req, res, next) => {
  const project = await Project.findOne({ slug: req.params.slug });

  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  successResponse(res, 200, { project }, 'Project retrieved successfully');
});

// Export all controllers
module.exports = {
  getAllProjects: baseController.getAll,
  getProjectById: baseController.getById,
  getProjectsByStatus,
  getProjectsByCategory,
  getProjectBySlug,
  createProject: baseController.create,
  updateProject: baseController.update,
  deleteProject: baseController.remove,
};