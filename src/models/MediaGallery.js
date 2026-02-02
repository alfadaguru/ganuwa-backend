const mongoose = require('mongoose');
const { MEDIA_TYPES } = require('../config/constants');

const mediaGallerySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(MEDIA_TYPES),
      required: [true, 'Media type is required'],
    },
    mediaUrl: {
      type: String, // for single image or video
    },
    thumbnail: {
      type: String,
    },
    media: [{ // for albums
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      caption: {
        type: String,
      },
      type: {
        type: String,
      },
    }],
    category: {
      type: String,
      enum: ['event', 'project', 'government', 'infrastructure', 'culture', 'general'],
    },
    tags: [{
      type: String,
    }],
    eventDate: {
      type: Date,
    },
    location: {
      type: String,
    },
    photographer: {
      type: String,
    },
    duration: {
      type: String, // for videos
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
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
mediaGallerySchema.index({ type: 1 });
mediaGallerySchema.index({ category: 1 });
mediaGallerySchema.index({ featured: 1 });
mediaGallerySchema.index({ tags: 1 });

const MediaGallery = mongoose.model('MediaGallery', mediaGallerySchema);

module.exports = MediaGallery;