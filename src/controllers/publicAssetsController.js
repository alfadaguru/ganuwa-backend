const { getPresignedUrl } = require('../utils/s3Upload');
const logger = require('../utils/logger');

/**
 * Get presigned URL for Kano State logo
 * Public endpoint - no authentication required
 */
exports.getLogoUrl = async (req, res) => {
  try {
    const key = 'assets/kano-state-logo.png';

    // Generate presigned URL valid for 7 days
    const url = await getPresignedUrl(key, 604800);

    res.status(200).json({
      success: true,
      data: {
        url,
        expiresIn: 604800, // 7 days in seconds
      },
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
 * Get presigned URL for landmark images
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

    // Generate presigned URL valid for 7 days
    const url = await getPresignedUrl(key, 604800);

    res.status(200).json({
      success: true,
      data: {
        url,
        imageName,
        expiresIn: 604800, // 7 days in seconds
      },
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
 * Get presigned URLs for all landmark images
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

    const urlPromises = landmarkImages.map(async (imageName) => {
      const key = `landmarks/${imageName}`;
      const url = await getPresignedUrl(key, 604800);
      return {
        imageName,
        url,
      };
    });

    const images = await Promise.all(urlPromises);

    // Convert to object for easier access
    const imagesMap = images.reduce((acc, img) => {
      acc[img.imageName] = img.url;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        images: imagesMap,
        expiresIn: 604800, // 7 days in seconds
      },
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
 * Get presigned URLs for hero slider images
 * Public endpoint - no authentication required
 */
exports.getHeroSliderImages = async (req, res) => {
  try {
    const sliderImages = [
      { key: 'hero-banners/government-house.jpg', name: 'Government House' },
      { key: 'hero-banners/emirs-palace-gate.jpg', name: "Emir's Palace Gate" },
      { key: 'hero-banners/kano-cityscape.jpg', name: 'Kano Cityscape' },
    ];

    const urlPromises = sliderImages.map(async (img) => {
      const url = await getPresignedUrl(img.key, 604800);
      return {
        key: img.key,
        name: img.name,
        url,
      };
    });

    const images = await Promise.all(urlPromises);

    res.status(200).json({
      success: true,
      data: {
        images,
        expiresIn: 604800, // 7 days in seconds
      },
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
 * Get presigned URLs for about section images
 * Public endpoint - no authentication required
 */
exports.getAboutSectionImages = async (req, res) => {
  try {
    const aboutImages = [
      { key: 'about-section/heritage.jpg', name: 'Rich Cultural Heritage' },
      { key: 'about-section/economy.jpg', name: 'Economic Hub' },
      { key: 'about-section/education.jpg', name: 'Educational Excellence' },
    ];

    const urlPromises = aboutImages.map(async (img) => {
      const url = await getPresignedUrl(img.key, 604800);
      return {
        key: img.key,
        name: img.name,
        url,
      };
    });

    const images = await Promise.all(urlPromises);

    res.status(200).json({
      success: true,
      data: {
        images,
        expiresIn: 604800, // 7 days in seconds
      },
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
 * Get presigned URLs for default fallback images
 * Public endpoint - no authentication required
 */
exports.getDefaultImages = async (req, res) => {
  try {
    const defaultImages = [
      { key: 'defaults/news-default.jpg', name: 'news', type: 'default' },
      { key: 'defaults/leader-male-default.jpg', name: 'leaders', type: 'male' },
      { key: 'defaults/leader-female-default.jpg', name: 'leaders', type: 'female' },
    ];

    const urlPromises = defaultImages.map(async (img) => {
      const url = await getPresignedUrl(img.key, 604800);
      return {
        key: img.key,
        name: img.name,
        type: img.type,
        url,
      };
    });

    const images = await Promise.all(urlPromises);

    // Organize by category
    const organized = {
      news: { default: '' },
      leaders: { male: '', female: '', default: '' },
    };

    images.forEach((img) => {
      if (img.name === 'news') {
        organized.news.default = img.url;
      } else if (img.name === 'leaders') {
        organized.leaders[img.type] = img.url;
        if (img.type === 'male') {
          organized.leaders.default = img.url; // Use male as default
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        images: organized,
        expiresIn: 604800, // 7 days in seconds
      },
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
