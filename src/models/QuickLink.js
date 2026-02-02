const mongoose = require('mongoose');

const quickLinkSchema = new mongoose.Schema(
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
    description: {
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
    icon: {
      type: String,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
    },
    openInNewTab: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['service', 'information', 'emergency', 'resource', 'external'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
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
quickLinkSchema.index({ category: 1 });
quickLinkSchema.index({ isActive: 1 });
quickLinkSchema.index({ displayOrder: 1 });

// Method to increment click count
quickLinkSchema.methods.incrementClicks = function () {
  this.clickCount += 1;
  return this.save({ validateBeforeSave: false });
};

const QuickLink = mongoose.model('QuickLink', quickLinkSchema);

module.exports = QuickLink;