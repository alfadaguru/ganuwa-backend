const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// All user routes require authentication
router.use(authenticate);

// Profile routes - available to all authenticated users
router.get('/me', userController.getMyProfile);
router.put('/me', userController.updateMyProfile);
router.put('/me/password', userController.changePassword);

// User management routes - Admin and Super Admin only
router.get('/', authorizeMinRole(ROLES.ADMIN), userController.getAllUsers);
router.get('/:id', authorizeMinRole(ROLES.ADMIN), userController.getUserById);
router.post('/', authorizeMinRole(ROLES.ADMIN), userController.createUser);
router.put('/:id', authorizeMinRole(ROLES.ADMIN), userController.updateUser);

// Delete requires Super Admin
router.delete('/:id', authorizeMinRole(ROLES.SUPER_ADMIN), userController.deleteUser);

module.exports = router;