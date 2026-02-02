const express = require('express');
const router = express.Router();
const tenderController = require('../controllers/tender.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', tenderController.getAllTenders);
router.get('/active', tenderController.getActiveTenders);
router.get('/upcoming', tenderController.getUpcomingTenders);
router.get('/featured', tenderController.getFeaturedTenders);
router.get('/category/:category', tenderController.getTendersByCategory);
router.get('/number/:tenderNumber', tenderController.getTenderByNumber);
router.get('/slug/:slug', tenderController.getTenderBySlug);
router.get('/:id', tenderController.getTenderById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), tenderController.createTender);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), tenderController.updateTender);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), tenderController.deleteTender);

module.exports = router;