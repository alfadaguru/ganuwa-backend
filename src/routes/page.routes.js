const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', pageController.getAllPages);
router.get('/slug/:slug', pageController.getPageBySlug);
router.get('/:id', pageController.getPageById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), pageController.createPage);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), pageController.updatePage);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), pageController.deletePage);

module.exports = router;