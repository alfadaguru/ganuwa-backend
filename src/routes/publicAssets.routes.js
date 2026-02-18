const express = require('express');
const router = express.Router();
const publicAssetsController = require('../controllers/publicAssetsController');

/**
 * @route   GET /api/v1/public-assets/logo
 * @desc    Get presigned URL for Kano State logo
 * @access  Public
 */
router.get('/logo', publicAssetsController.getLogoUrl);

/**
 * @route   GET /api/v1/public-assets/landmarks
 * @desc    Get presigned URLs for all landmark images
 * @access  Public
 */
router.get('/landmarks', publicAssetsController.getAllLandmarkImageUrls);

/**
 * @route   GET /api/v1/public-assets/landmarks/:imageName
 * @desc    Get presigned URL for a specific landmark image
 * @access  Public
 */
router.get('/landmarks/:imageName', publicAssetsController.getLandmarkImageUrl);

/**
 * @route   GET /api/v1/public-assets/hero-sliders
 * @desc    Get presigned URLs for hero slider images
 * @access  Public
 */
router.get('/hero-sliders', publicAssetsController.getHeroSliderImages);

module.exports = router;