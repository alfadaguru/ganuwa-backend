const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/featured', newsController.getFeaturedNews);
router.get('/slug/:slug', newsController.getNewsBySlug);
router.get('/:id', newsController.getNewsById);
router.get('/:id/related', newsController.getRelatedNews);

// Protected routes - require authentication
router.use(authenticate);

// Author, Editor, Admin can create
router.post('/', authorizeMinRole(ROLES.AUTHOR), newsController.createNews);

// Owner, Editor, Admin can update
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), newsController.updateNews);

// Admin can delete
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), newsController.deleteNews);

module.exports = router;