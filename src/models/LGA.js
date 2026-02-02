const mongoose = require('mongoose');
const slugify = require('slugify');

const lgaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'LGA name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
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
    capital: {
      type: String,
    },
    population: {
      type: Number,
    },
    area: {
      type: Number, // in square kilometers
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    chairman: {
      name: {
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
    wards: [{
      type: String,
    }],
    facilities: {
      schools: {
        type: Number,
        default: 0,
      },
      healthCenters: {
        type: Number,
        default: 0,
      },
      markets: {
        type: Number,
        default: 0,
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
    },
    displayOrder: {
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
lgaSchema.index({ slug: 1 });
lgaSchema.index({ name: 1 });

// Auto-generate slug
lgaSchema.pre('validate', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const LGA = mongoose.model('LGA', lgaSchema);

module.exports = LGA;
