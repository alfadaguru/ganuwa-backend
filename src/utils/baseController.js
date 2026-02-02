const { successResponse, paginatedResponse } = require('./response');
const { HTTP_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const logger = require('./logger');

/**
 * Factory function to create CRUD controllers for any model
 */
const createController = (Model, modelName) => {
  /**
   * Get all documents
   */
  const getAll = catchAsync(async (req, res, next) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      ...filters
    } = req.query;

    const query = {};

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        query[key] = filters[key];
      }
    });

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const [documents, totalItems] = await Promise.all([
      Model.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      Model.countDocuments(query),
    ]);

    paginatedResponse(res, documents, page, limit, totalItems, `${modelName}s retrieved successfully`);
  });

  /**
   * Get single document by ID
   */
  const getById = catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError(`${modelName} not found`, HTTP_STATUS.NOT_FOUND));
    }

    successResponse(res, HTTP_STATUS.OK, { [modelName.toLowerCase()]: document }, `${modelName} retrieved successfully`);
  });

  /**
   * Create new document
   */
  const create = catchAsync(async (req, res, next) => {
    const data = {
      ...req.body,
      createdBy: req.user._id,
    };

    const document = await Model.create(data);

    logger.info(`${modelName} created: ${document._id} by ${req.user.email}`);

    successResponse(res, HTTP_STATUS.CREATED, { [modelName.toLowerCase()]: document }, `${modelName} created successfully`);
  });

  /**
   * Update document
   */
  const update = catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError(`${modelName} not found`, HTTP_STATUS.NOT_FOUND));
    }

    Object.assign(document, req.body);
    document.updatedBy = req.user._id;

    await document.save();

    logger.info(`${modelName} updated: ${document._id} by ${req.user.email}`);

    successResponse(res, HTTP_STATUS.OK, { [modelName.toLowerCase()]: document }, `${modelName} updated successfully`);
  });

  /**
   * Delete document
   */
  const remove = catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
      return next(new AppError(`${modelName} not found`, HTTP_STATUS.NOT_FOUND));
    }

    await document.deleteOne();

    logger.info(`${modelName} deleted: ${document._id} by ${req.user.email}`);

    successResponse(res, HTTP_STATUS.OK, null, `${modelName} deleted successfully`);
  });

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
};

module.exports = createController;
