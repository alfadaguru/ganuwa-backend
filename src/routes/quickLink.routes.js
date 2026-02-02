const express = require('express');
const router = express.Router();
const quickLinkController = require('../controllers/quickLink.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', quickLinkController.getAllQuickLinks);
router.get('/:id', quickLinkController.getQuickLinkById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), quickLinkController.createQuickLink);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), quickLinkController.updateQuickLink);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), quickLinkController.deleteQuickLink);

module.exports = router;