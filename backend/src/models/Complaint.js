const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Quality Issues',
        'Delay',
        'Corruption',
        'Safety Concerns',
        'Environmental Concerns',
        'Labor Issues',
        'Other',
      ],
      required: true,
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
    dateOfIncident: {
      type: Date,
      required: true,
    },
    attachments: [
      {
        name: String,
        path: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ['image', 'document', 'video', 'audio'],
        },
        description: String,
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'Under Investigation', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    responses: [
      {
        message: String,
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            name: String,
            path: String,
          },
        ],
      },
    ],
    resolution: {
      actionTaken: String,
      date: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      feedback: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        date: Date,
      },
    },
    isPublic: {
      type: Boolean,
      default: false, // By default, complaints are not public
    },
    verificationChecklist: {
      identityVerified: {
        type: Boolean,
        default: false,
      },
      proofReviewed: {
        type: Boolean,
        default: false,
      },
      locationVisited: {
        type: Boolean,
        default: false,
      },
      witnessesInterviewed: {
        type: Boolean,
        default: false,
      },
    },
    blockchainData: {
      txHash: String,
      blockNumber: Number,
      timestamp: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
ComplaintSchema.index({ project: 1, status: 1 });
ComplaintSchema.index({ submittedBy: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ priority: 1 });

// For text search on title and description
ComplaintSchema.index({ 
  title: 'text', 
  description: 'text' 
}, {
  weights: { 
    title: 10, 
    description: 5 
  }
});

const Complaint = mongoose.model('Complaint', ComplaintSchema);

module.exports = Complaint; 