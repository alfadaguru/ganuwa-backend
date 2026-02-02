const express = require('express');
const router = express.Router();
const datasetController = require('../controllers/dataset.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', datasetController.getAllDatasets);
router.get('/search', datasetController.searchDatasets);
router.get('/featured', datasetController.getFeaturedDatasets);
router.get('/popular', datasetController.getPopularDatasets);
router.get('/recent', datasetController.getRecentDatasets);
router.get('/statistics', datasetController.getDatasetStatistics);
router.get('/tags', datasetController.getAllTags);
router.get('/category/:category', datasetController.getDatasetsByCategory);
router.get('/slug/:slug', datasetController.getDatasetBySlug);
router.get('/:id', datasetController.getDatasetById);
router.post('/:id/download', datasetController.incrementDownload);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), datasetController.createDataset);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), datasetController.updateDataset);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), datasetController.deleteDataset);

module.exports = router;