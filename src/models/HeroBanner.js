const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema(
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
    subtitle: {
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
    image: {
      url: {
        type: String,
        required: [true, 'Image URL is required'],
      },
      publicId: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    mobileImage: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    ctaButton: {
      text: {
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
      url: {
        type: String,
      },
      openInNewTab: {
        type: Boolean,
        default: false,
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
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
heroBannerSchema.index({ isActive: 1 });
heroBannerSchema.index({ displayOrder: 1 });
heroBannerSchema.index({ startDate: 1, endDate: 1 });

const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);

module.exports = HeroBanner;