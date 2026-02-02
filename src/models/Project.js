const mongoose = require('mongoose');
const slugify = require('slugify');
const { PROJECT_CATEGORIES, PROJECT_STATUS } = require('../config/constants');

const projectSchema = new mongoose.Schema(
  {
    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
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
        required: [true, 'English description is required'],
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
    gallery: [{
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
      caption: {
        type: String,
      },
    }],
    category: {
      type: String,
      enum: Object.values(PROJECT_CATEGORIES),
    },
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
    },
    budget: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    contractor: {
      type: String,
    },
    location: {
      lga: {
        type: String,
      },
      address: {
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
    startDate: {
      type: Date,
    },
    expectedCompletionDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    ministry: {
      type: String,
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
projectSchema.index({ slug: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'location.lga': 1 });
projectSchema.index({ featured: 1 });

// Auto-generate slug
projectSchema.pre('validate', function (next) {
  if (this.isModified('name.en') && !this.slug) {
    this.slug = slugify(this.name.en, { lower: true, strict: true });
  }
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;