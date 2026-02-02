const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeMinRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', mediaController.getAllMedia);
router.get('/type/:type', mediaController.getMediaByType);
router.get('/album/:album', mediaController.getMediaByAlbum);
router.get('/:id', mediaController.getMediaById);

// Protected routes
router.use(authenticate);
router.post('/', authorizeMinRole(ROLES.AUTHOR), mediaController.createMedia);
router.put('/:id', authorizeMinRole(ROLES.AUTHOR), mediaController.updateMedia);
router.delete('/:id', authorizeMinRole(ROLES.ADMIN), mediaController.deleteMedia);

module.exports = router;