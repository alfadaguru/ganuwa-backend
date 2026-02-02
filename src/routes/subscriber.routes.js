const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriber.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/', subscriberController.createSubscriber);

// Protected routes
router.use(authenticate);
router.get('/', authorizeMinRole(ROLES.EDITOR), subscriberController.getAllSubscribers);
router.get('/:id', authorizeMinRole(ROLES.EDITOR), subscriberController.getSubscriberById);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), subscriberController.updateSubscriber);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), subscriberController.deleteSubscriber);

module.exports = router;