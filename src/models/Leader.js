const mongoose = require('mongoose');

const leaderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
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
    subtitle: {
      en: {
        type: String,
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
    position: {
      type: String,
      required: [true, 'Position is required'],
      enum: ['governor', 'deputy_governor', 'commissioner', 'permanent_secretary', 'director', 'special_adviser', 'other'],
    },
    ministry: {
      type: String,
    },
    department: {
      type: String,
    },
    profileImage: {
      url: {
        type: String,
        required: [true, 'Profile image is required'],
      },
      publicId: {
        type: String,
      },
      alt: {
        type: String,
      },
    },
    bio: {
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
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
    },
    socialMedia: {
      twitter: {
        type: String,
      },
      facebook: {
        type: String,
      },
      linkedin: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appointmentDate: {
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
leaderSchema.index({ position: 1 });
leaderSchema.index({ ministry: 1 });
leaderSchema.index({ displayOrder: 1 });
leaderSchema.index({ isActive: 1 });

const Leader = mongoose.model('Leader', leaderSchema);

module.exports = Leader;