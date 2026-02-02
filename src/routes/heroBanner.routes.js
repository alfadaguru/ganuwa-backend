const express = require('express');
const router = express.Router();
const heroBannerController = require('../controllers/heroBanner.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', heroBannerController.getAllHeroBanners);
router.get('/active', heroBannerController.getActiveHeroBanners);
router.get('/:id', heroBannerController.getHeroBannerById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), heroBannerController.createHeroBanner);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), heroBannerController.updateHeroBanner);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), heroBannerController.deleteHeroBanner);

module.exports = router;