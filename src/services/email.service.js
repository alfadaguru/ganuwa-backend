const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  // Initialize email transporter
  initialize() {
    try {
      // Create reusable transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error(`Email service initialization failed: ${error.message}`);
        } else {
          logger.info('Email service is ready to send messages');
        }
      });
    } catch (error) {
      logger.error(`Error initializing email service: ${error.message}`);
    }
  }

  // Send email helper
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Kano State Government'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${options.to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.ADMIN_PANEL_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .button { display: inline-block; background-color: #006838; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>You requested to reset your password for your Ganuwa CMS account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #006838;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
            <p>Ganuwa Content Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Password Reset Request

      Hello ${user.firstName} ${user.lastName},

      You requested to reset your password for your Ganuwa CMS account.

      Click the link below to reset your password:
      ${resetUrl}

      This link will expire in 1 hour.

      If you didn't request this, please ignore this email and your password will remain unchanged.

      © ${new Date().getFullYear()} Kano State Government. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Ganuwa CMS',
      html,
      text,
    });
  }

  // Send welcome email to new user
  async sendWelcomeEmail(user, tempPassword = null) {
    const loginUrl = `${process.env.ADMIN_PANEL_URL || 'http://localhost:5173'}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .button { display: inline-block; background-color: #006838; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background-color: #fff; padding: 15px; border-left: 4px solid #006838; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Ganuwa CMS</h1>
          </div>
          <div class="content">
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>Your account has been created successfully for the Kano State Government Content Management System.</p>
            <div class="info-box">
              <p><strong>Account Details:</strong></p>
              <p>Email: ${user.email}</p>
              <p>Role: ${user.role.replace('_', ' ').toUpperCase()}</p>
              ${tempPassword ? `<p>Temporary Password: <strong>${tempPassword}</strong></p>` : ''}
            </div>
            ${tempPassword ? '<p><strong>Important:</strong> Please change your password after your first login for security reasons.</p>' : ''}
            <a href="${loginUrl}" class="button">Login to Ganuwa CMS</a>
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
            <p>Ganuwa Content Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to Ganuwa CMS

      Hello ${user.firstName} ${user.lastName},

      Your account has been created successfully for the Kano State Government Content Management System.

      Account Details:
      Email: ${user.email}
      Role: ${user.role.replace('_', ' ').toUpperCase()}
      ${tempPassword ? `Temporary Password: ${tempPassword}` : ''}

      ${tempPassword ? 'Important: Please change your password after your first login for security reasons.' : ''}

      Login URL: ${loginUrl}

      If you have any questions or need assistance, please contact the system administrator.

      © ${new Date().getFullYear()} Kano State Government. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Ganuwa CMS - Account Created',
      html,
      text,
    });
  }

  // Send contact form notification to admin
  async sendContactFormNotification(contact) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .info-box { background-color: #fff; padding: 15px; margin: 10px 0; border-radius: 3px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>A new contact form has been submitted on the Kano State Government website.</p>
            <div class="info-box">
              <p><strong>Name:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <p><strong>Category:</strong> ${contact.category || 'General'}</p>
              <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
            </div>
            <div class="info-box">
              <p><strong>Message:</strong></p>
              <p>${contact.message}</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      New Contact Form Submission

      A new contact form has been submitted on the Kano State Government website.

      Name: ${contact.name}
      Email: ${contact.email}
      Phone: ${contact.phone || 'N/A'}
      Subject: ${contact.subject}
      Category: ${contact.category || 'General'}
      Submitted: ${new Date(contact.createdAt).toLocaleString()}

      Message:
      ${contact.message}

      © ${new Date().getFullYear()} Kano State Government. All rights reserved.
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: `New Contact Form: ${contact.subject}`,
      html,
      text,
    });
  }

  // Send contact form acknowledgment to user
  async sendContactFormAcknowledgment(contact) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Contacting Us</h1>
          </div>
          <div class="content">
            <p>Dear ${contact.name},</p>
            <p>Thank you for contacting the Kano State Government. We have received your message and will respond to you as soon as possible.</p>
            <p><strong>Your message:</strong></p>
            <p style="background-color: #fff; padding: 15px; border-left: 4px solid #006838;">${contact.message}</p>
            <p>If your inquiry is urgent, please contact us directly at:</p>
            <p>Phone: +234 XXX XXX XXXX<br>Email: info@kanostate.gov.ng</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Thank You for Contacting Us

      Dear ${contact.name},

      Thank you for contacting the Kano State Government. We have received your message and will respond to you as soon as possible.

      Your message:
      ${contact.message}

      If your inquiry is urgent, please contact us directly at:
      Phone: +234 XXX XXX XXXX
      Email: info@kanostate.gov.ng

      © ${new Date().getFullYear()} Kano State Government. All rights reserved.
    `;

    return await this.sendEmail({
      to: contact.email,
      subject: 'Thank You for Contacting Kano State Government',
      html,
      text,
    });
  }

  // Send newsletter subscription confirmation
  async sendSubscriptionConfirmation(subscriber) {
    const unsubscribeUrl = `${process.env.WEBSITE_URL || 'http://localhost:3000'}/unsubscribe?email=${subscriber.email}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Confirmed</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for subscribing to the Kano State Government newsletter!</p>
            <p>You will now receive updates about:</p>
            <ul>
              <li>Government news and announcements</li>
              <li>New services and programs</li>
              <li>Community events</li>
              <li>Important notices</li>
            </ul>
            <p>You can unsubscribe at any time by clicking <a href="${unsubscribeUrl}">here</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Subscription Confirmed

      Hello,

      Thank you for subscribing to the Kano State Government newsletter!

      You will now receive updates about:
      - Government news and announcements
      - New services and programs
      - Community events
      - Important notices

      You can unsubscribe at any time by visiting: ${unsubscribeUrl}

      © ${new Date().getFullYear()} Kano State Government. All rights reserved.
    `;

    return await this.sendEmail({
      to: subscriber.email,
      subject: 'Welcome to Kano State Government Newsletter',
      html,
      text,
    });
  }

  // Send newsletter to subscribers
  async sendNewsletter(subject, content, subscribers) {
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${process.env.WEBSITE_URL || 'http://localhost:3000'}/unsubscribe?email=${subscriber.email}`;

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #006838; color: white; padding: 20px; text-align: center; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Kano State Government Newsletter</h1>
              </div>
              <div class="content">
                ${content}
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Kano State Government. All rights reserved.</p>
                <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        await this.sendEmail({
          to: subscriber.email,
          subject: subject,
          html,
        });

        results.sent++;
      } catch (error) {
        results.failed++;
        results.errors.push({ email: subscriber.email, error: error.message });
      }
    }

    return results;
  }
}

// Export singleton instance
module.exports = new EmailService();