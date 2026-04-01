const { uploadToS3, deleteFromS3, getPublicUrl } = require('../utils/s3Upload');
const logger = require('../utils/logger');

/**
 * Upload single file
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const folder = req.body.folder || 'uploads';

    const result = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    logger.info(`File uploaded successfully: ${result.key}`);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        key: result.key,
        publicId: result.publicId,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message,
    });
  }
};

/**
 * Upload multiple files
 */
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const folder = req.body.folder || 'uploads';
    const uploadPromises = req.files.map((file) =>
      uploadToS3(file.buffer, file.originalname, file.mimetype, folder)
    );

    const results = await Promise.all(uploadPromises);

    const uploadedFiles = results.map((result, index) => ({
      url: result.url,
      key: result.key,
      publicId: result.publicId,
      originalName: req.files[index].originalname,
      mimeType: req.files[index].mimetype,
      size: req.files[index].size,
    }));

    logger.info(`${uploadedFiles.length} files uploaded successfully`);

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    logger.error('Multiple files upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Files upload failed',
      error: error.message,
    });
  }
};

/**
 * Delete file
 */
exports.deleteFile = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required',
      });
    }

    await deleteFromS3(key);

    logger.info(`File deleted successfully: ${key}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message,
    });
  }
};

/**
 * Refresh presigned URL
 */
exports.refreshUrl = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required',
      });
    }

    const url = getPublicUrl(key);

    logger.info(`Public URL generated: ${key}`);

    res.status(200).json({
      success: true,
      message: 'URL refreshed successfully',
      data: {
        url,
        key,
      },
    });
  } catch (error) {
    logger.error('URL refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'URL refresh failed',
      error: error.message,
    });
  }
};