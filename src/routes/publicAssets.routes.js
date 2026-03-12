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

/**
 * @route   GET /api/v1/public-assets/about-section
 * @desc    Get presigned URLs for about section images
 * @access  Public
 */
router.get('/about-section', publicAssetsController.getAboutSectionImages);

/**
 * @route   GET /api/v1/public-assets/defaults
 * @desc    Get presigned URLs for default fallback images
 * @access  Public
 */
router.get('/defaults', publicAssetsController.getDefaultImages);

/**
 * @route   GET /api/v1/public-assets/government-arms
 * @desc    Get presigned URLs for three arms of government images
 * @access  Public
 */
router.get('/government-arms', publicAssetsController.getGovernmentArmsImages);

/**
 * @route   GET /api/v1/public-assets/assembly-leadership
 * @desc    Get presigned URLs for Speaker and Deputy Speaker photos
 * @access  Public
 */
router.get('/assembly-leadership', publicAssetsController.getAssemblyLeadershipImages);

module.exports = router;