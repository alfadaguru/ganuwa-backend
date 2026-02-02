const express = require('express');
const router = express.Router();
const lgaController = require('../controllers/lga.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', lgaController.getAllLGAs);
router.get('/slug/:slug', lgaController.getLGABySlug);
router.get('/:id', lgaController.getLGAById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), lgaController.createLGA);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), lgaController.updateLGA);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), lgaController.deleteLGA);

module.exports = router;