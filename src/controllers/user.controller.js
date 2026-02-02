const User = require('../models/User');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');
const { catchAsync, AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (Admin, Super Admin)
 */
const getAllUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    role,
    isActive,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  // Build query
  const query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Search in firstName, lastName, and email
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOrder = order === 'desc' ? -1 : 1;

  // Get users with pagination (exclude password and sensitive fields)
  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    User.countDocuments(query),
  ]);

  paginatedResponse(res, users, page, limit, totalItems, 'Users retrieved successfully');
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private (Admin, Super Admin)
 */
const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    '-password -refreshToken -passwordResetToken -passwordResetExpires'
  );

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  successResponse(res, HTTP_STATUS.OK, { user }, 'User retrieved successfully');
});

/**
 * @desc    Create new user
 * @route   POST /api/v1/users
 * @access  Private (Admin, Super Admin)
 */
const createUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role, department, phoneNumber, isActive } = req.body;

  // Check if user with email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', HTTP_STATUS.CONFLICT));
  }

  // Only super_admin can create super_admin users
  if (role === 'super_admin' && req.user.role !== 'super_admin') {
    return next(
      new AppError('Only super administrators can create super admin users', HTTP_STATUS.FORBIDDEN)
    );
  }

  const userData = {
    firstName,
    lastName,
    email,
    password,
    role: role || 'viewer',
    department,
    phoneNumber,
    isActive: isActive !== undefined ? isActive : true,
  };

  const user = await User.create(userData);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  logger.info(`User created: ${user.email} with role ${user.role} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.CREATED, { user: userResponse }, 'User created successfully');
});

/**
 * @desc    Update user
 * @route   PUT /api/v1/users/:id
 * @access  Private (Admin, Super Admin)
 */
const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const { firstName, lastName, email, password, role, department, phoneNumber, isActive } = req.body;

  // Check if email is being changed to one that already exists
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', HTTP_STATUS.CONFLICT));
    }
  }

  // Only super_admin can modify super_admin users or change role to super_admin
  if (
    (user.role === 'super_admin' || role === 'super_admin') &&
    req.user.role !== 'super_admin'
  ) {
    return next(
      new AppError('Only super administrators can modify super admin users', HTTP_STATUS.FORBIDDEN)
    );
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (password) user.password = password; // Will be hashed by pre-save hook
  if (role) user.role = role;
  if (department !== undefined) user.department = department;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  // Remove sensitive fields from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;

  logger.info(`User updated: ${user.email} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, { user: userResponse }, 'User updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Super Admin only)
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own account', HTTP_STATUS.FORBIDDEN));
  }

  // Only super_admin can delete super_admin users
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    return next(
      new AppError('Only super administrators can delete super admin users', HTTP_STATUS.FORBIDDEN)
    );
  }

  await user.deleteOne();

  logger.info(`User deleted: ${user.email} by ${req.user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, 'User deleted successfully');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    '-password -refreshToken -passwordResetToken -passwordResetExpires'
  );

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  successResponse(res, HTTP_STATUS.OK, { user }, 'Profile retrieved successfully');
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
const updateMyProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  const { firstName, lastName, phoneNumber, department, profileImage } = req.body;

  // Users can only update their own profile fields (not role or isActive)
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (department !== undefined) user.department = department;
  if (profileImage !== undefined) user.profileImage = profileImage;

  await user.save();

  // Remove sensitive fields from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshToken;
  delete userResponse.passwordResetToken;
  delete userResponse.passwordResetExpires;

  logger.info(`Profile updated: ${user.email}`);

  successResponse(res, HTTP_STATUS.OK, { user: userResponse }, 'Profile updated successfully');
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/users/me/password
 * @access  Private
 */
const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError('Please provide both current and new password', HTTP_STATUS.BAD_REQUEST)
    );
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
  }

  // Check if current password is correct
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password changed: ${user.email}`);

  successResponse(res, HTTP_STATUS.OK, null, 'Password changed successfully');
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  changePassword,
};
