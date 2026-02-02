const Contact = require('../models/Contact');
const createController = require('../utils/baseController');
const emailService = require('../services/email.service');
const { catchAsync } = require('../middlewares/error.middleware');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const logger = require('../utils/logger');

// Create base CRUD operations
const baseController = createController(Contact, 'Contact');

// Custom create contact with email notifications
const createContact = catchAsync(async (req, res, next) => {
  // Create contact entry
  const contact = await Contact.create(req.body);

  // Send notification emails (non-blocking)
  Promise.all([
    emailService.sendContactFormNotification(contact).catch(err => {
      logger.error(`Failed to send contact notification to admin: ${err.message}`);
    }),
    emailService.sendContactFormAcknowledgment(contact).catch(err => {
      logger.error(`Failed to send contact acknowledgment to user: ${err.message}`);
    }),
  ]);

  successResponse(
    res,
    HTTP_STATUS.CREATED,
    { contact },
    'Contact form submitted successfully. We will get back to you soon.'
  );
});

// Export all controllers
module.exports = {
  getAllContacts: baseController.getAll,
  getContactById: baseController.getById,
  createContact,
  updateContact: baseController.update,
  deleteContact: baseController.remove,
};