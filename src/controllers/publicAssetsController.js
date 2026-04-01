const { getPublicUrl } = require('../utils/s3Upload');
const logger = require('../utils/logger');

/**
 * Get public URL for Kano State logo
 * Public endpoint - no authentication required
 */
exports.getLogoUrl = async (req, res) => {
  try {
    const key = 'assets/kano-state-logo.png';
    const url = getPublicUrl(key);

    res.status(200).json({
      success: true,
      data: { url },
    });
  } catch (error) {
    logger.error('Logo URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get logo URL',
      error: error.message,
    });
  }
};

/**
 * Get public URL for landmark images
 * Public endpoint - no authentication required
 */
exports.getLandmarkImageUrl = async (req, res) => {
  try {
    const { imageName } = req.params;

    // Whitelist of allowed landmark images
    const allowedImages = [
      'kofar-kudu.jpg',
      'kurmi-market.jpg',
      'gidan-makama.jpg',
      'groundnut-pyramids.jpg',
      'kano-walls.jpg',
      'emirs-palace.jpg',
      'first-airport.jpg',
      'bagauda-lake.jpg',
    ];

    if (!allowedImages.includes(imageName)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    const key = `landmarks/${imageName}`;
    const url = getPublicUrl(key);

    res.status(200).json({
      success: true,
      data: { url, imageName },
    });
  } catch (error) {
    logger.error('Landmark image URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get image URL',
      error: error.message,
    });
  }
};

/**
 * Get public URLs for all landmark images
 * Public endpoint - no authentication required
 */
exports.getAllLandmarkImageUrls = async (req, res) => {
  try {
    const landmarkImages = [
      'kofar-kudu.jpg',
      'kurmi-market.jpg',
      'gidan-makama.jpg',
      'groundnut-pyramids.jpg',
      'kano-walls.jpg',
      'emirs-palace.jpg',
      'first-airport.jpg',
      'bagauda-lake.jpg',
    ];

    const imagesMap = landmarkImages.reduce((acc, imageName) => {
      acc[imageName] = getPublicUrl(`landmarks/${imageName}`);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: { images: imagesMap },
    });
  } catch (error) {
    logger.error('Get all landmark images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get landmark images',
      error: error.message,
    });
  }
};

/**
 * Get public URLs for hero slider images
 * Public endpoint - no authentication required
 */
exports.getHeroSliderImages = async (req, res) => {
  try {
    const sliderImages = [
      { key: 'hero-banners/government-house.jpg', name: 'Government House' },
      { key: 'hero-banners/emirs-palace-gate.jpg', name: "Emir's Palace Gate" },
      { key: 'hero-banners/kano-cityscape.jpg', name: 'Kano Cityscape' },
    ];

    const images = sliderImages.map((img) => ({
      key: img.key,
      name: img.name,
      url: getPublicUrl(img.key),
    }));

    res.status(200).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    logger.error('Get hero slider images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hero slider images',
      error: error.message,
    });
  }
};

/**
 * Get public URLs for about section images
 * Public endpoint - no authentication required
 */
exports.getAboutSectionImages = async (req, res) => {
  try {
    const aboutImages = [
      { key: 'about/9988ef75bea15495c59e831af64c0faf.jpg', name: 'history', section: 'History' },
      { key: 'about/f2a75466948a8372a8831ad655a16112.png', name: 'geography', section: 'Geography' },
      { key: 'about/90615d9651520670e6e32865ccc3dd80.jpg', name: 'mdas', section: 'MDAs' },
      { key: 'about/588193abdaa517dc3a408559dc96418f.jpg', name: 'lgas', section: 'Local Governments' },
    ];

    const images = aboutImages.map((img) => ({
      key: img.key,
      name: img.name,
      section: img.section,
      url: getPublicUrl(img.key),
    }));

    res.status(200).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    logger.error('Get about section images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get about section images',
      error: error.message,
    });
  }
};

/**
 * Get public URLs for default fallback images
 * Public endpoint - no authentication required
 */
exports.getDefaultImages = async (req, res) => {
  try {
    const organized = {
      news: { default: getPublicUrl('defaults/news-default.jpg') },
      leaders: {
        male: getPublicUrl('defaults/leader-male-default.jpg'),
        female: getPublicUrl('defaults/leader-female-default.jpg'),
        default: getPublicUrl('defaults/leader-male-default.jpg'),
      },
    };

    res.status(200).json({
      success: true,
      data: { images: organized },
    });
  } catch (error) {
    logger.error('Get default images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get default images',
      error: error.message,
    });
  }
};

/**
 * Get public URLs for government arms images
 * Public endpoint - no authentication required
 */
exports.getGovernmentArmsImages = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        executive: getPublicUrl('hero-banners/government-house.jpg'),
        legislative: getPublicUrl('hero-banners/kano-cityscape.jpg'),
        judiciary: getPublicUrl('landmarks/emirs-palace.jpg'),
      },
    });
  } catch (error) {
    logger.error('Get government arms images error:', error);
    res.status(500).json({ success: false, message: 'Failed to get government arms images', error: error.message });
  }
};

exports.getAssemblyLeadershipImages = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        speaker: getPublicUrl('leaders/speaker-falgore.jpg'),
        deputy: getPublicUrl('leaders/deputy-speaker-butu-butu.jpg'),
        attorneyGeneral: getPublicUrl('leaders/attorney-general-maude.jpg'),
        chiefJudge: getPublicUrl('leaders/chief-judge-dije-aboki.jpg'),
      },
    });
  } catch (error) {
    logger.error('Get assembly leadership images error:', error);
    res.status(500).json({ success: false, message: 'Failed to get assembly leadership images', error: error.message });
  }
};