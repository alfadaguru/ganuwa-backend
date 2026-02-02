const express = require('express');
const router = express.Router();
const leaderController = require('../controllers/leader.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', leaderController.getAllLeaders);
router.get('/position/:position', leaderController.getLeadersByPosition);
router.get('/:id', leaderController.getLeaderById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), leaderController.createLeader);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), leaderController.updateLeader);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), leaderController.deleteLeader);

module.exports = router;