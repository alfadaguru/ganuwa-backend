const mongoose = require('mongoose');
const { PRIORITY_LEVELS } = require('../config/constants');

const foiRequestSchema = new mongoose.Schema(
  {
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
      trim: true,
    },
    requesterEmail: {
      type: String,
      required: [true, 'Requester email is required'],
      lowercase: true,
      trim: true,
    },
    requesterPhone: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      enum: ['information', 'document', 'data', 'record', 'other'],
      required: [true, 'Request type is required'],
      default: 'information',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    mda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MDA',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY_LEVELS),
      default: PRIORITY_LEVELS.MEDIUM,
    },
    responseText: {
      type: String,
    },
    responseDocuments: [
      {
        title: {
          type: String,
        },
        url: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    responseDate: {
      type: Date,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    requestNumber: {
      type: String,
      unique: true,
      uppercase: true,
    },
    internalNotes: [
      {
        note: {
          type: String,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
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
foiRequestSchema.index({ requestNumber: 1 });
foiRequestSchema.index({ requesterEmail: 1 });
foiRequestSchema.index({ status: 1 });
foiRequestSchema.index({ priority: 1 });
foiRequestSchema.index({ requestType: 1 });
foiRequestSchema.index({ mda: 1 });
foiRequestSchema.index({ assignedTo: 1 });
foiRequestSchema.index({ createdAt: -1 });
foiRequestSchema.index({ dueDate: 1 });

// Auto-generate request number
foiRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber && this.isNew) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('FOIRequest').countDocuments();
    this.requestNumber = `FOI-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Auto-set due date (14 days from creation by default)
foiRequestSchema.pre('save', function (next) {
  if (!this.dueDate && this.isNew) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    this.dueDate = dueDate;
  }
  next();
});

// Virtual to check if request is overdue
foiRequestSchema.virtual('isOverdue').get(function () {
  if (!this.dueDate || this.status === 'completed' || this.status === 'rejected' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual to calculate days remaining
foiRequestSchema.virtual('daysRemaining').get(function () {
  if (!this.dueDate || this.status === 'completed' || this.status === 'rejected' || this.status === 'cancelled') {
    return null;
  }
  const now = new Date();
  const timeDiff = this.dueDate - now;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
});

// Method to add status history
foiRequestSchema.methods.addStatusHistory = function (status, userId, note = '') {
  this.statusHistory.push({
    status,
    changedBy: userId,
    changedAt: new Date(),
    note,
  });
  return this;
};

// Method to add internal note
foiRequestSchema.methods.addInternalNote = function (note, userId) {
  this.internalNotes.push({
    note,
    addedBy: userId,
    addedAt: new Date(),
  });
  return this;
};

const FOIRequest = mongoose.model('FOIRequest', foiRequestSchema);

module.exports = FOIRequest;