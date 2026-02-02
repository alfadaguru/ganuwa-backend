const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * @desc    Register new user (Admin only)
 * @route   POST /api/v1/auth/register
 * @access  Private/Admin
 */
const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, department, phoneNumber } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', HTTP_STATUS.CONFLICT));
  }

  // Store original password for email
  const originalPassword = password;

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    phoneNumber,
  });

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(user, originalPassword).catch(err => {
    logger.error(`Failed to send welcome email to ${user.email}: ${err.message}`);
  });

  // Remove password from response
  user.password = undefined;

  logger.info(`New user registered: ${user.email} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.CREATED, { user }, 'User registered successfully');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('Please provide email and password', HTTP_STATUS.BAD_REQUEST));
  }

  // Get user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated', HTTP_STATUS.FORBIDDEN));
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to database
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove sensitive data
  user.password = undefined;
  user.refreshToken = undefined;

  logger.info(`User logged in: ${user.email}`);

  successResponse(
    res,
    HTTP_STATUS.OK,
    {
      user,
      accessToken,
      refreshToken,
    },
    SUCCESS_MESSAGES.LOGIN_SUCCESS
  );
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return next(new AppError('Refresh token is required', HTTP_STATUS.BAD_REQUEST));
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(token);

  // Get user
  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if refresh token matches
  if (user.refreshToken !== token) {
    return next(new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED));
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

  // Update refresh token in database
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  successResponse(
    res,
    HTTP_STATUS.OK,
    {
      accessToken,
      refreshToken: newRefreshToken,
    },
    'Token refreshed successfully'
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = catchAsync(async (req, res, next) => {
  // Clear refresh token from database
  req.user.refreshToken = null;
  await req.user.save({ validateBeforeSave: false });

  logger.info(`User logged out: ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  successResponse(res, HTTP_STATUS.OK, { user }, 'User profile retrieved');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phoneNumber, department, profileImage } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;
  if (department) user.department = department;
  if (profileImage) user.profileImage = profileImage;

  await user.save();

  logger.info(`User profile updated: ${user.email}`);

  successResponse(res, HTTP_STATUS.OK, { user }, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', HTTP_STATUS.BAD_REQUEST));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user: ${user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, 'Password changed successfully');
});

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address', HTTP_STATUS.BAD_REQUEST));
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists or not for security
    return successResponse(res, HTTP_STATUS.OK, null, SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email (non-blocking)
  emailService.sendPasswordResetEmail(user, resetToken).catch(err => {
    logger.error(`Failed to send password reset email to ${user.email}: ${err.message}`);
  });

  logger.info(`Password reset requested for: ${user.email}`);

  // In development, also return the reset URL in response
  successResponse(
    res,
    HTTP_STATUS.OK,
    process.env.NODE_ENV === 'development'
      ? { resetUrl: `${process.env.ADMIN_PANEL_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}` }
      : null,
    SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide new password', HTTP_STATUS.BAD_REQUEST));
  }

  // Hash token and find user
  const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST));
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  logger.info(`Password reset completed for: ${user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS);
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};