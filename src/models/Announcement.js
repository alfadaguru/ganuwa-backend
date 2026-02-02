const mongoose = require('mongoose');
const { ANNOUNCEMENT_TYPES, PRIORITY_LEVELS } = require('../config/constants');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      en: {
        type: String,
        required: [true, 'English title is required'],
        trim: true,
      },
      ha: {
        type: String,
        trim: true,
      },
      ar: {
        type: String,
        trim: true,
      },
    },
    content: {
      en: {
        type: String,
      },
      ha: {
        type: String,
      },
      ar: {
        type: String,
      },
    },
    type: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_TYPES),
      required: [true, 'Announcement type is required'],
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      default: PRIORITY_LEVELS.MEDIUM,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'businesses', 'students', 'residents', 'visitors'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'scheduled'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
announcementSchema.index({ type: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ startDate: 1, endDate: 1 });
announcementSchema.index({ priority: -1 });

// Auto-update status based on dates
announcementSchema.pre('save', function (next) {
  const now = new Date();

  if (this.startDate > now) {
    this.status = 'scheduled';
  } else if (this.endDate && this.endDate < now) {
    this.status = 'expired';
  } else {
    this.status = 'active';
  }

  next();
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
