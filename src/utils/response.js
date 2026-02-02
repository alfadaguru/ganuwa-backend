const { HTTP_STATUS } = require('../config/constants');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {String} message - Success message
 * @param {Object} pagination - Pagination info
 */
const successResponse = (res, statusCode = HTTP_STATUS.OK, data = null, message = 'Success', pagination = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {*} errors - Error details
 */
const errorResponse = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = 'Error occurred', errors = null) => {
  const response = {
    success: false,
    error: {
      message,
      code: statusCode,
    },
  };

  if (errors) {
    response.error.details = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} totalItems - Total number of items
 * @param {String} message - Success message
 */
const paginatedResponse = (res, data, page, limit, totalItems, message = 'Success') => {
  const totalPages = Math.ceil(totalItems / limit);

  const pagination = {
    currentPage: Number(page),
    totalPages,
    totalItems,
    itemsPerPage: Number(limit),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return successResponse(res, HTTP_STATUS.OK, data, message, pagination);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};