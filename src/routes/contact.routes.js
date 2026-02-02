const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/', contactController.createContact);

// Protected routes
router.use(authenticate);
router.get('/', authorizeMinRole(ROLES.EDITOR), contactController.getAllContacts);
router.get('/:id', authorizeMinRole(ROLES.EDITOR), contactController.getContactById);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), contactController.updateContact);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), contactController.deleteContact);

module.exports = router;