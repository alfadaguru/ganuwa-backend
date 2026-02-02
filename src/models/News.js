const mongoose = require('mongoose');
const slugify = require('slugify');
const { NEWS_CATEGORIES, CONTENT_STATUS } = require('../config/constants');

const newsSchema = new mongoose.Schema(
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
    excerpt: {
      en: {
        type: String,
        required: [true, 'English excerpt is required'],
        maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      },
      ha: {
        type: String,
        maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      },
      ar: {
        type: String,
        maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      },
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
      enum: Object.values(NEWS_CATEGORIES),
      required: [true, 'Category is required'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },
    publishDate: {
      type: Date,
    },
    scheduledDate: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
    },
    relatedNews: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News',
    }],
    seo: {
      metaTitle: {
        type: String,
        maxlength: [60, 'Meta title cannot exceed 60 characters'],
      },
      metaDescription: {
        type: String,
        maxlength: [160, 'Meta description cannot exceed 160 characters'],
      },
      keywords: [{
        type: String,
      }],
      ogImage: {
        type: String,
      },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
newsSchema.index({ slug: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ publishDate: -1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ 'title.en': 'text', 'excerpt.en': 'text', 'content.en': 'text' });

// Auto-generate slug from English title
newsSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

// Calculate read time based on content
newsSchema.pre('save', function (next) {
  if (this.isModified('content.en')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.en.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Auto-set publish date when status changes to published
newsSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === CONTENT_STATUS.PUBLISHED && !this.publishDate) {
    this.publishDate = new Date();
  }
  next();
});

// Virtual to check if news is published
newsSchema.virtual('isPublished').get(function () {
  return this.status === CONTENT_STATUS.PUBLISHED;
});

// Method to increment views
newsSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

const News = mongoose.model('News', newsSchema);

module.exports = News;