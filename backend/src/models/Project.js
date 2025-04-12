const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    nameHindi: {
      type: String,
      required: true,
      trim: true,
    },
    nameEnglish: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    expectedEndDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Not Started',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    attachments: [
      {
        name: String,
        path: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    milestones: [
      {
        title: String,
        description: String,
        dueDate: Date,
        completedDate: Date,
        status: {
          type: String,
          enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
          default: 'Pending',
        },
        blockchainTxHash: String,
      },
    ],
    team: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
      },
    ],
    blockchainData: {
      projectHash: String,
      contractAddress: String,
      creationTxHash: String,
      lastUpdateTxHash: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for remaining budget
ProjectSchema.virtual('remainingBudget').get(function() {
  return this.budget - this.spent;
});

// Virtual for budget utilization percentage
ProjectSchema.virtual('budgetUtilizationPercentage').get(function() {
  return this.budget > 0 ? (this.spent / this.budget) * 100 : 0;
});

// Virtual for days elapsed
ProjectSchema.virtual('daysElapsed').get(function() {
  const start = new Date(this.startDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Set toJSON option to include virtuals
ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project; 