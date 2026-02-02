const mongoose = require('mongoose');
const slugify = require('slugify');
const { CONTENT_STATUS } = require('../config/constants');

const pressReleaseSchema = new mongoose.Schema(
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
    content: {
      en: {
        type: String,
        required: [true, 'English content is required'],
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
      enum: ['government', 'development', 'policy', 'statement', 'clarification'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    contactPerson: {
      name: {
        type: String,
      },
      title: {
        type: String,
      },
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
    attachments: [{
      fileName: {
        type: String,
      },
      url: {
        type: String,
      },
      fileType: {
        type: String,
      },
    }],
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
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
pressReleaseSchema.index({ slug: 1 });
pressReleaseSchema.index({ releaseDate: -1 });
pressReleaseSchema.index({ status: 1 });

// Auto-generate slug
pressReleaseSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

const PressRelease = mongoose.model('PressRelease', pressReleaseSchema);

module.exports = PressRelease;