const express = require('express');
const router = express.Router();
const mdaController = require('../controllers/mda.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', mdaController.getAllMDAs);
router.get('/type/:type', mdaController.getMDAsByType);
router.get('/slug/:slug', mdaController.getMDABySlug);
router.get('/:id', mdaController.getMDAById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.EDITOR), mdaController.createMDA);
router.put('/:id', authorizeMinRole(ROLES.EDITOR), mdaController.updateMDA);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), mdaController.deleteMDA);

module.exports = router;