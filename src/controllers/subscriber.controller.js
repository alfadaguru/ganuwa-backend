const Subscriber = require('../models/Subscriber');
const createController = require('../utils/baseController');
const emailService = require('../services/email.service');
const { catchAsync } = require('../middlewares/error.middleware');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(Subscriber, 'Subscriber');

// Custom create subscriber with email confirmation
const createSubscriber = catchAsync(async (req, res, next) => {
  // Create subscriber
  const subscriber = await Subscriber.create(req.body);

  // Send confirmation email (non-blocking)
  emailService.sendSubscriptionConfirmation(subscriber).catch(err => {
    logger.error(`Failed to send subscription confirmation: ${err.message}`);
  });

  successResponse(
    res,
    HTTP_STATUS.CREATED,
    { subscriber },
    'Successfully subscribed to newsletter. Check your email for confirmation.'
  );
});

// Export all controllers
module.exports = {
  getAllSubscribers: baseController.getAll,
  getSubscriberById: baseController.getById,
  createSubscriber,
  updateSubscriber: baseController.update,
  deleteSubscriber: baseController.remove,
};