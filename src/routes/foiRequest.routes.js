const express = require('express');
const router = express.Router();
const foiRequestController = require('../controllers/foiRequest.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.post('/', foiRequestController.createFOIRequest);
router.get('/number/:requestNumber', foiRequestController.getFOIRequestByNumber);
router.get('/my/:email', foiRequestController.getMyFOIRequests);

// Protected routes
router.use(authenticate);
router.get('/', authorizeMinRole(ROLES.VIEWER), foiRequestController.getAllFOIRequests);
router.get('/statistics', authorizeMinRole(ROLES.VIEWER), foiRequestController.getFOIRequestStatistics);
router.get('/:id', authorizeMinRole(ROLES.VIEWER), foiRequestController.getFOIRequestById);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), foiRequestController.updateFOIRequest);
router.put('/:id/status', authorizeMinRole(ROLES.AUTHOR), foiRequestController.updateFOIRequestStatus);
router.put('/:id/assign', authorizeMinRole(ROLES.EDITOR), foiRequestController.assignFOIRequest);
router.post('/:id/notes', authorizeMinRole(ROLES.AUTHOR), foiRequestController.addInternalNote);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), foiRequestController.deleteFOIRequest);

module.exports = router;