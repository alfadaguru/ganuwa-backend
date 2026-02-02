const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/past', eventController.getPastEvents);
router.get('/category/:category', eventController.getEventsByCategory);
router.get('/slug/:slug', eventController.getEventBySlug);
router.get('/:id', eventController.getEventById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), eventController.createEvent);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), eventController.updateEvent);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), eventController.deleteEvent);

module.exports = router;