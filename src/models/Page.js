const mongoose = require('mongoose');
const slugify = require('slugify');
const { CONTENT_STATUS } = require('../config/constants');

const pageSchema = new mongoose.Schema(
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
      required: [true, 'Slug is required'],
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
    template: {
      type: String,
      enum: ['default', 'about', 'history', 'geography', 'custom'],
      default: 'default',
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
    parentPage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Page',
    },
    seo: {
      metaTitle: {
        type: String,
      },
      metaDescription: {
        type: String,
      },
      keywords: [{
        type: String,
      }],
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },
    publishDate: {
      type: Date,
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
pageSchema.index({ slug: 1 });
pageSchema.index({ status: 1 });

// Auto-generate slug
pageSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

const Page = mongoose.model('Page', pageSchema);

module.exports = Page;