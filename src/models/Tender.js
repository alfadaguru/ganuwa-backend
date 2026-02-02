const mongoose = require('mongoose');
const slugify = require('slugify');

const tenderSchema = new mongoose.Schema(
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
      enum: ['goods', 'services', 'works', 'consultancy', 'supplies'],
      required: [true, 'Category is required'],
    },
    tenderNumber: {
      type: String,
      required: [true, 'Tender number is required'],
      unique: true,
      uppercase: true,
    },
    value: {
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'NGN',
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
      },
    },
    openingDate: {
      type: Date,
      required: [true, 'Opening date is required'],
    },
    closingDate: {
      type: Date,
      required: [true, 'Closing date is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'awarded', 'cancelled'],
      default: 'open',
    },
    requirements: {
      en: [
        {
          type: String,
        },
      ],
      ha: [
        {
          type: String,
        },
      ],
      ar: [
        {
          type: String,
        },
      ],
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
    mda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MDA',
    },
    documents: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        fileSize: {
          type: Number,
        },
        fileType: {
          type: String,
        },
      },
    ],
    awardedTo: {
      type: String,
    },
    awardDate: {
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
tenderSchema.index({ slug: 1 });
tenderSchema.index({ tenderNumber: 1 });
tenderSchema.index({ category: 1 });
tenderSchema.index({ status: 1 });
tenderSchema.index({ openingDate: -1 });
tenderSchema.index({ closingDate: 1 });
tenderSchema.index({ featured: 1 });

// Auto-generate slug from English title
tenderSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

// Virtual to check if tender is active
tenderSchema.virtual('isActive').get(function () {
  const now = new Date();
  return this.status === 'open' && this.closingDate > now && this.openingDate <= now;
});

// Virtual to check if tender is upcoming
tenderSchema.virtual('isUpcoming').get(function () {
  const now = new Date();
  return this.status === 'open' && this.openingDate > now;
});

// Virtual to check if tender is expired
tenderSchema.virtual('isExpired').get(function () {
  const now = new Date();
  return this.closingDate < now;
});

// Auto-close expired tenders
tenderSchema.pre('save', function (next) {
  const now = new Date();
  if (this.status === 'open' && this.closingDate < now) {
    this.status = 'closed';
  }
  next();
});

// Method to increment views
tenderSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

const Tender = mongoose.model('Tender', tenderSchema);

module.exports = Tender;