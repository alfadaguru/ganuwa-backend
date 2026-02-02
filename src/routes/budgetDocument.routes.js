const express = require('express');
const router = express.Router();
const budgetDocumentController = require('../controllers/budgetDocument.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', budgetDocumentController.getAllBudgetDocuments);
router.get('/featured', budgetDocumentController.getFeaturedBudgetDocuments);
router.get('/category/:category', budgetDocumentController.getBudgetDocumentsByCategory);
router.get('/year/:year', budgetDocumentController.getBudgetDocumentsByYear);
router.get('/slug/:slug', budgetDocumentController.getBudgetDocumentBySlug);
router.get('/:id', budgetDocumentController.getBudgetDocumentById);
router.post('/:id/download', budgetDocumentController.incrementDownload);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), budgetDocumentController.createBudgetDocument);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), budgetDocumentController.updateBudgetDocument);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), budgetDocumentController.deleteBudgetDocument);

module.exports = router;
