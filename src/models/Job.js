const mongoose = require('mongoose');
const slugify = require('slugify');

const jobSchema = new mongoose.Schema(
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
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    mda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MDA',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary'],
      default: 'full-time',
      required: [true, 'Job type is required'],
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
    responsibilities: {
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
    qualifications: {
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
    salary: {
      min: {
        type: Number,
        min: 0,
      },
      max: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'NGN',
        enum: ['NGN', 'USD', 'EUR', 'GBP'],
      },
      displaySalary: {
        type: Boolean,
        default: false,
      },
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    postDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'filled'],
      default: 'open',
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    contactEmail: {
      type: String,
    },
    applicationUrl: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: {
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
jobSchema.index({ slug: 1 });
jobSchema.index({ department: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ postDate: -1 });
jobSchema.index({ featured: 1 });

// Auto-generate slug from English title
jobSchema.pre('validate', function (next) {
  if (this.isModified('title.en') && !this.slug) {
    this.slug = slugify(this.title.en, { lower: true, strict: true });
  }
  next();
});

// Virtual to check if job is active
jobSchema.virtual('isActive').get(function () {
  const now = new Date();
  return this.status === 'open' && this.applicationDeadline > now;
});

// Virtual to check if job is expired
jobSchema.virtual('isExpired').get(function () {
  const now = new Date();
  return this.applicationDeadline < now;
});

// Auto-close expired jobs
jobSchema.pre('save', function (next) {
  const now = new Date();
  if (this.status === 'open' && this.applicationDeadline < now) {
    this.status = 'closed';
  }
  next();
});

// Method to increment views
jobSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to increment applications
jobSchema.methods.incrementApplications = function () {
  this.applications += 1;
  return this.save({ validateBeforeSave: false });
};

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;