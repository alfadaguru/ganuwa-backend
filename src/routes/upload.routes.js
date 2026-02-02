const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');

// All upload routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload single file to S3
 * @access  Private
 * @body    { file: File, folder: string (optional) }
 */
router.post('/single', upload.single('file'), uploadController.uploadFile);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple files to S3
 * @access  Private
 * @body    { files: File[], folder: string (optional) }
 */
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultipleFiles);

/**
 * @route   DELETE /api/v1/upload
 * @desc    Delete file from S3
 * @access  Private
 * @body    { key: string }
 */
router.delete('/', uploadController.deleteFile);

/**
 * @route   POST /api/v1/upload/refresh-url
 * @desc    Refresh presigned URL for private file
 * @access  Private
 * @body    { key: string }
 */
router.post('/refresh-url', uploadController.refreshUrl);

module.exports = router;