const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/category/:category', serviceController.getServicesByCategory);
router.get('/slug/:slug', serviceController.getServiceBySlug);
router.get('/:id', serviceController.getServiceById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), serviceController.createService);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), serviceController.updateService);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), serviceController.deleteService);

module.exports = router;