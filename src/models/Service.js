const mongoose = require('mongoose');
const slugify = require('slugify');
const { SERVICE_CATEGORIES } = require('../config/constants');

const serviceSchema = new mongoose.Schema(
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
    icon: {
      type: String,
    },
    category: {
      type: String,
      enum: Object.values(SERVICE_CATEGORIES),
    },
    applicationUrl: {
      type: String,
    },
    requirements: [{
      en: {
        type: String,
      },
      ha: {
        type: String,
      },
      ar: {
        type: String,
      },
    }],
    processingTime: {
      type: String,
    },
    fee: {
      type: String,
    },
    contactPerson: {
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
    status: {
      type: String,
      enum: ['active', 'inactive', 'coming_soon'],
      default: 'active',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    popularityScore: {
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
serviceSchema.index({ slug: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ popularityScore: -1 });

// Auto-generate slug
serviceSchema.pre('validate', function (next) {
  if (this.isModified('name.en') && !this.slug) {
    this.slug = slugify(this.name.en, { lower: true, strict: true });
  }
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;