const { errorResponse } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../config/constants');

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const hasRole = allowedRoles.includes(req.user.role);

    if (!hasRole) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

/**
 * Check if user can perform action based on role hierarchy
 * @param {string} requiredRole - Minimum role required
 */
const authorizeMinRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const roleHierarchy = {
      [ROLES.VIEWER]: 1,
      [ROLES.AUTHOR]: 2,
      [ROLES.EDITOR]: 3,
      [ROLES.ADMIN]: 4,
      [ROLES.SUPER_ADMIN]: 5,
    };

    const userRoleLevel = roleHierarchy[req.user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    next();
  };
};

/**
 * Check if user owns the resource or is admin
 */
const authorizeOwnerOrAdmin = (resourceUserIdField = 'createdBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Super admin and admin can access all resources
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const resource = req.resource; // Resource should be attached in controller

    if (!resource) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
    }

    const resourceUserId = resource[resourceUserIdField]?.toString();
    const currentUserId = req.user._id.toString();

    if (resourceUserId !== currentUserId) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'You can only modify your own content');
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeMinRole,
  authorizeOwnerOrAdmin,
};