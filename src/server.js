require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const User = require('./models/User');
const { ROLES } = require('./config/constants');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@kanostate.gov.ng';

    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const defaultAdmin = await User.create({
        firstName: process.env.DEFAULT_ADMIN_FIRSTNAME || 'Super',
        lastName: process.env.DEFAULT_ADMIN_LASTNAME || 'Admin',
        email: adminEmail,
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2025!ChangeMe',
        role: ROLES.SUPER_ADMIN,
        department: 'IT',
        isActive: true,
      });

      logger.info(`✅ Default admin user created: ${defaultAdmin.email}`);
      logger.warn(`⚠️  IMPORTANT: Change the default admin password immediately!`);
    } else {
      logger.info('Admin user already exists');
    }
  } catch (error) {
    logger.error(`Error creating default admin: ${error.message}`);
  }
};

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📍 API Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/v1`);

  // Create default admin after server starts
  createDefaultAdmin();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  logger.error(err.stack);

  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;