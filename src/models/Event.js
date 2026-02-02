const mongoose = require('mongoose');
const slugify = require('slugify');
const { EVENT_CATEGORIES, EVENT_STATUS } = require('../config/constants');

const eventSchema = new mongoose.Schema(
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
    slug: {
      type: String,
      unique: true,
      lowercase: true,
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
    featuredImage: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    category: {
      type: String,
      enum: Object.values(EVENT_CATEGORIES),
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
    venue: {
      name: {
        type: String,
      },
      address: {
        type: String,
      },
      lga: {
        type: String,
      },
      coordinates: {
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    },
    organizer: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    registrationRequired: {
      type: Boolean,
      default: false,
    },
    registrationUrl: {
      type: String,
    },
    capacity: {
      type: Number,
    },
    attendees: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.UPCOMING,
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
eventSchema.index({ slug: 1 });
eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

// Auto-generate slug
eventSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;