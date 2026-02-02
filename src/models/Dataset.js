const mongoose = require('mongoose');
const slugify = require('slugify');
const { CONTENT_STATUS } = require('../config/constants');

const datasetSchema = new mongoose.Schema(
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
        required: [true, 'English description is required'],
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
      enum: [
        'finance',
        'health',
        'education',
        'infrastructure',
        'population',
        'transport',
        'environment',
        'agriculture',
        'economy',
        'governance',
        'security',
        'other',
      ],
      required: [true, 'Category is required'],
    },
    formats: [
      {
        type: {
          type: String,
          enum: ['csv', 'json', 'excel', 'pdf', 'xml', 'geojson', 'api'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        size: {
          type: Number, // in bytes
        },
        description: {
          type: String,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updateFrequency: {
      type: String,
      enum: ['real-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as-needed'],
      default: 'as-needed',
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    license: {
      type: {
        type: String,
        enum: ['open', 'cc-by', 'cc-by-sa', 'cc0', 'government-use', 'restricted'],
        default: 'open',
      },
      name: {
        type: String,
      },
      url: {
        type: String,
      },
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
    mda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MDA',
    },
    apiEndpoint: {
      type: String,
    },
    apiDocumentation: {
      type: String,
    },
    temporalCoverage: {
      start: {
        type: Date,
      },
      end: {
        type: Date,
      },
    },
    geographicCoverage: {
      type: String,
      default: 'Kano State',
    },
    dataQuality: {
      completeness: {
        type: Number,
        min: 0,
        max: 100,
      },
      accuracy: {
        type: Number,
        min: 0,
        max: 100,
      },
      notes: {
        type: String,
      },
    },
    relatedDatasets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset',
      },
    ],
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
    },
    featured: {
      type: Boolean,
      default: false,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
datasetSchema.index({ slug: 1 });
datasetSchema.index({ category: 1 });
datasetSchema.index({ status: 1 });
datasetSchema.index({ featured: 1 });
datasetSchema.index({ tags: 1 });
datasetSchema.index({ lastUpdated: -1 });
datasetSchema.index({ publishDate: -1 });
datasetSchema.index({ 'title.en': 'text', 'description.en': 'text', tags: 'text' });

// Auto-generate slug from English title
datasetSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

// Auto-set publish date when status changes to published
datasetSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === CONTENT_STATUS.PUBLISHED && !this.publishDate) {
    this.publishDate = new Date();
  }
  next();
});

// Virtual to calculate total size
datasetSchema.virtual('totalSize').get(function () {
  return this.formats.reduce((total, format) => total + (format.size || 0), 0);
});

// Virtual to check if dataset is published
datasetSchema.virtual('isPublished').get(function () {
  return this.status === CONTENT_STATUS.PUBLISHED;
});

// Method to increment downloads
datasetSchema.methods.incrementDownloads = function () {
  this.downloads += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to increment views
datasetSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;