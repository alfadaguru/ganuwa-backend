const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/status/:status', projectController.getProjectsByStatus);
router.get('/category/:category', projectController.getProjectsByCategory);
router.get('/slug/:slug', projectController.getProjectBySlug);
router.get('/:id', projectController.getProjectById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), projectController.createProject);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), projectController.updateProject);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), projectController.deleteProject);

module.exports = router;