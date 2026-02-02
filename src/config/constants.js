// User Roles
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  VIEWER: 'viewer',
};

// Content Status
const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
};

// News Categories
const NEWS_CATEGORIES = {
  GOVERNMENT: 'government',
  DEVELOPMENT: 'development',
  EDUCATION: 'education',
  HEALTH: 'health',
  INFRASTRUCTURE: 'infrastructure',
  AGRICULTURE: 'agriculture',
  SECURITY: 'security',
  ECONOMY: 'economy',
};

// Service Categories
const SERVICE_CATEGORIES = {
  ONLINE_APPLICATION: 'online_application',
  LICENSE: 'license',
  PERMIT: 'permit',
  TAX: 'tax',
  LAND: 'land',
  HEALTH: 'health',
  EDUCATION: 'education',
  BUSINESS: 'business',
  OTHER: 'other',
};

// Project Categories
const PROJECT_CATEGORIES = {
  INFRASTRUCTURE: 'infrastructure',
  HEALTH: 'health',
  EDUCATION: 'education',
  AGRICULTURE: 'agriculture',
  WATER: 'water',
  ENERGY: 'energy',
  HOUSING: 'housing',
  TRANSPORTATION: 'transportation',
};

// Project Status
const PROJECT_STATUS = {
  PLANNING: 'planning',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
};

// MDA Types
const MDA_TYPES = {
  MINISTRY: 'ministry',
  DEPARTMENT: 'department',
  AGENCY: 'agency',
};

// Event Categories
const EVENT_CATEGORIES = {
  GOVERNMENT: 'government',
  PUBLIC: 'public',
  COMMUNITY: 'community',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  EDUCATION: 'education',
  HEALTH: 'health',
};

// Event Status
const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Announcement Types
const ANNOUNCEMENT_TYPES = {
  HOLIDAY: 'holiday',
  EVENT: 'event',
  NOTICE: 'notice',
  SERVICE: 'service',
  EMERGENCY: 'emergency',
  GENERAL: 'general',
};

// Priority Levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Media Types
const MEDIA_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  ALBUM: 'album',
};

// Contact Status
const CONTACT_STATUS = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
};

// Contact Categories
const CONTACT_CATEGORIES = {
  GENERAL: 'general',
  COMPLAINT: 'complaint',
  INQUIRY: 'inquiry',
  FEEDBACK: 'feedback',
  SUGGESTION: 'suggestion',
  REQUEST: 'request',
};

// Supported Languages
const LANGUAGES = {
  ENGLISH: 'en',
  HAUSA: 'ha',
  ARABIC: 'ar',
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload
const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  VIDEO_TYPES: ['video/mp4', 'video/webm'],
  DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'Entry already exists',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
};

// Budget Document Categories
const BUDGET_CATEGORIES = {
  ANNUAL: 'annual',
  QUARTERLY: 'quarterly',
  CAPITAL: 'capital',
  RECURRENT: 'recurrent',
  SUPPLEMENTARY: 'supplementary',
};

// Tender Categories
const TENDER_CATEGORIES = {
  GOODS: 'goods',
  SERVICES: 'services',
  WORKS: 'works',
  CONSULTANCY: 'consultancy',
  SUPPLIES: 'supplies',
};

// Tender Status
const TENDER_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  AWARDED: 'awarded',
  CANCELLED: 'cancelled',
};

// Job Types
const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  TEMPORARY: 'temporary',
};

// Job Status
const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled',
};

// FOI Request Types
const FOI_REQUEST_TYPES = {
  INFORMATION: 'information',
  DOCUMENT: 'document',
  DATA: 'data',
  RECORD: 'record',
  OTHER: 'other',
};

// FOI Request Status
const FOI_REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Dataset Categories
const DATASET_CATEGORIES = {
  FINANCE: 'finance',
  HEALTH: 'health',
  EDUCATION: 'education',
  INFRASTRUCTURE: 'infrastructure',
  POPULATION: 'population',
  TRANSPORT: 'transport',
  ENVIRONMENT: 'environment',
  AGRICULTURE: 'agriculture',
  ECONOMY: 'economy',
  GOVERNANCE: 'governance',
  SECURITY: 'security',
  OTHER: 'other',
};

// Dataset Format Types
const DATASET_FORMAT_TYPES = {
  CSV: 'csv',
  JSON: 'json',
  EXCEL: 'excel',
  PDF: 'pdf',
  XML: 'xml',
  GEOJSON: 'geojson',
  API: 'api',
};

// Dataset Update Frequency
const DATASET_UPDATE_FREQUENCY = {
  REAL_TIME: 'real-time',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually',
  AS_NEEDED: 'as-needed',
};

// Dataset License Types
const DATASET_LICENSE_TYPES = {
  OPEN: 'open',
  CC_BY: 'cc-by',
  CC_BY_SA: 'cc-by-sa',
  CC0: 'cc0',
  GOVERNMENT_USE: 'government-use',
  RESTRICTED: 'restricted',
};

// Currency Types
const CURRENCY_TYPES = {
  NGN: 'NGN',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
};

module.exports = {
  ROLES,
  CONTENT_STATUS,
  NEWS_CATEGORIES,
  SERVICE_CATEGORIES,
  PROJECT_CATEGORIES,
  PROJECT_STATUS,
  MDA_TYPES,
  EVENT_CATEGORIES,
  EVENT_STATUS,
  ANNOUNCEMENT_TYPES,
  PRIORITY_LEVELS,
  MEDIA_TYPES,
  CONTACT_STATUS,
  CONTACT_CATEGORIES,
  LANGUAGES,
  PAGINATION,
  FILE_UPLOAD,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BUDGET_CATEGORIES,
  TENDER_CATEGORIES,
  TENDER_STATUS,
  JOB_TYPES,
  JOB_STATUS,
  FOI_REQUEST_TYPES,
  FOI_REQUEST_STATUS,
  DATASET_CATEGORIES,
  DATASET_FORMAT_TYPES,
  DATASET_UPDATE_FREQUENCY,
  DATASET_LICENSE_TYPES,
  CURRENCY_TYPES,
};