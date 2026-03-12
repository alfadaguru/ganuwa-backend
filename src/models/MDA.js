const mongoose = require('mongoose');
const slugify = require('slugify');
const { MDA_TYPES } = require('../config/constants');

const mdaSchema = new mongoose.Schema(
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
    acronym: {
      type: String,
      uppercase: true,
    },
    type: {
      type: String,
      enum: Object.values(MDA_TYPES),
      required: [true, 'MDA type is required'],
    },
    sector: {
      type: String,
      enum: ['administration', 'economic', 'law_and_justice', 'social_services'],
    },
    subSector: {
      type: String,
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
    logo: {
      url: {
        type: String,
      },
      publicId: {
        type: String,
      },
    },
    head: {
      name: {
        type: String,
      },
      title: {
        type: String,
      },
      image: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    contactInfo: {
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      address: {
        type: String,
      },
      website: {
        type: String,
      },
    },
    services: [{
      type: String,
    }],
    parentMDA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MDA',
    },
    displayOrder: {
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
mdaSchema.index({ slug: 1 });
mdaSchema.index({ type: 1 });
mdaSchema.index({ isActive: 1 });

// Auto-generate slug
mdaSchema.pre('validate', function (next) {
  if (this.isModified('name.en') && !this.slug) {
    this.slug = slugify(this.name.en, { lower: true, strict: true });
  }
  next();
});

const MDA = mongoose.model('MDA', mdaSchema);

module.exports = MDA;
