const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/open', jobController.getOpenJobs);
router.get('/featured', jobController.getFeaturedJobs);
router.get('/statistics', jobController.getJobStatistics);
router.get('/department/:department', jobController.getJobsByDepartment);
router.get('/type/:jobType', jobController.getJobsByType);
router.get('/slug/:slug', jobController.getJobBySlug);
router.get('/:id', jobController.getJobById);
router.post('/:id/apply', jobController.incrementApplications);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), jobController.createJob);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), jobController.updateJob);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), jobController.deleteJob);

module.exports = router;