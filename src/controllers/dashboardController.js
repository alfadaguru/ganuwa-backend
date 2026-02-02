const News = require('../models/News');
const Event = require('../models/Event');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Contact = require('../models/Contact');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

/**
 * Get dashboard statistics
 * @route GET /api/v1/dashboard/stats
 * @access Private (Admin only)
 */
exports.getStats = async (req, res) => {
  try {
    // Get counts for all content types
    const [
      newsCount,
      eventsCount,
      servicesCount,
      projectsCount,
      contactsCount,
      subscribersCount,
      usersCount
    ] = await Promise.all([
      News.countDocuments(),
      Event.countDocuments(),
      Service.countDocuments(),
      Project.countDocuments(),
      Contact.countDocuments(),
      Subscriber.countDocuments(),
      User.countDocuments()
    ]);

    // Calculate total content
    const totalContent = newsCount + eventsCount + servicesCount + projectsCount;

    const stats = {
      news: newsCount,
      events: eventsCount,
      services: servicesCount,
      projects: projectsCount,
      contacts: contactsCount,
      subscribers: subscribersCount,
      users: usersCount,
      totalContent
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error retrieving dashboard statistics',
        code: 500
      }
    });
  }
};