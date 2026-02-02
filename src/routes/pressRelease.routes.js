const express = require('express');
const router = express.Router();
const pressReleaseController = require('../controllers/pressRelease.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', pressReleaseController.getAllPressReleases);
router.get('/slug/:slug', pressReleaseController.getPressReleaseBySlug);
router.get('/:id', pressReleaseController.getPressReleaseById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), pressReleaseController.createPressRelease);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), pressReleaseController.updatePressRelease);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), pressReleaseController.deletePressRelease);

module.exports = router;