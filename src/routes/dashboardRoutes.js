const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const dashboardController = require('../controllers/dashboardController');

/**
 * @route   GET /api/v1/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin, Super Admin)
 */
router.get('/stats', authenticate, authorizeMinRole('admin'), dashboardController.getStats);

module.exports = router;