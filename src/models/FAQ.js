const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      en: {
        type: String,
        required: [true, 'English question is required'],
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
    answer: {
      en: {
        type: String,
        required: [true, 'English answer is required'],
      },
      ha: {
        type: String,
      },
      ar: {
        type: String,
      },
    },
    category: {
      type: String,
      enum: ['general', 'services', 'tax', 'education', 'health', 'business', 'legal'],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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
faqSchema.index({ category: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ displayOrder: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;