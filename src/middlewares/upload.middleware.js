const multer = require('multer');
const path = require('path');
const { FILE_UPLOAD, HTTP_STATUS } = require('../config/constants');
const { AppError } = require('./error.middleware');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'src/uploads/';

    // Determine upload path based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...FILE_UPLOAD.IMAGE_TYPES,
    ...FILE_UPLOAD.VIDEO_TYPES,
    ...FILE_UPLOAD.DOCUMENT_TYPES,
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not supported`, HTTP_STATUS.BAD_REQUEST), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
  fileFilter: fileFilter,
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for mixed uploads (multiple fields)
const uploadFields = (fields) => {
  return upload.fields(fields);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
};