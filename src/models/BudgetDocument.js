const mongoose = require('mongoose');
const slugify = require('slugify');
const { CONTENT_STATUS } = require('../config/constants');

const budgetDocumentSchema = new mongoose.Schema(
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
      enum: ['annual', 'quarterly', 'capital', 'recurrent', 'supplementary'],
    },
    tags: {
      type: [String],
      enum: ['Audit', 'Budget', 'Business', 'Education', 'Finance & Economy', 'Health', 'Infrastructure', 'Judiciary', 'Laws', 'LGAs', 'OCDS', 'Procurement', 'Public', 'Reports', 'Roads & Transport'],
      default: [],
    },
    year: {
      type: Number,
      min: [2000, 'Year must be 2000 or later'],
      max: [2100, 'Year must be before 2100'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileSize: {
      type: Number, // in bytes
    },
    fileType: {
      type: String,
      enum: ['pdf', 'excel', 'word', 'csv'],
      default: 'pdf',
    },
    downloads: {
      type: Number,
      default: 0,
    },
    publishDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CONTENT_STATUS),
      default: CONTENT_STATUS.DRAFT,
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes (slug index is already created by unique: true on the field)
budgetDocumentSchema.index({ category: 1 });
budgetDocumentSchema.index({ tags: 1 });
budgetDocumentSchema.index({ year: -1 });
budgetDocumentSchema.index({ status: 1 });
budgetDocumentSchema.index({ publishDate: -1 });
budgetDocumentSchema.index({ featured: 1 });

// Auto-generate slug from English title
budgetDocumentSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

// Auto-set publish date when status changes to published
budgetDocumentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === CONTENT_STATUS.PUBLISHED && !this.publishDate) {
    this.publishDate = new Date();
  }
  next();
});

// Method to increment downloads
budgetDocumentSchema.methods.incrementDownloads = function () {
  this.downloads += 1;
  return this.save({ validateBeforeSave: false });
};

const BudgetDocument = mongoose.model('BudgetDocument', budgetDocumentSchema);

module.exports = BudgetDocument;
