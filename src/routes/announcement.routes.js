const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', announcementController.getAllAnnouncements);
router.get('/priority/:priority', announcementController.getAnnouncementsByPriority);
router.get('/:id', announcementController.getAnnouncementById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), announcementController.createAnnouncement);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), announcementController.updateAnnouncement);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), announcementController.deleteAnnouncement);

module.exports = router;