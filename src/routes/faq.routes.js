const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', faqController.getAllFAQs);
router.get('/category/:category', faqController.getFAQsByCategory);
router.get('/:id', faqController.getFAQById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), faqController.createFAQ);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), faqController.updateFAQ);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), faqController.deleteFAQ);

module.exports = router;