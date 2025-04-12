const mongoose = require('mongoose');

const ExpenditureSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Labor',
        'Materials',
        'Equipment',
        'Consultation',
        'Transportation',
        'Permits',
        'Administrative',
        'Technology',
        'Miscellaneous',
      ],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Check', 'Digital Payment'],
      required: true,
    },
    paymentDetails: {
      beneficiary: String,
      accountNumber: String,
      bankName: String,
      transactionId: String,
    },
    attachments: [
      {
        name: String,
        path: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Under Review'],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
    },
    blockchainData: {
      txHash: String,
      blockNumber: Number,
      timestamp: Date,
      verified: {
        type: Boolean,
        default: false,
      },
      verificationHash: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
ExpenditureSchema.index({ project: 1, date: -1 });
ExpenditureSchema.index({ createdBy: 1 });
ExpenditureSchema.index({ status: 1 });

// Add a pre-save hook to update Project's spent amount
ExpenditureSchema.pre('save', async function(next) {
  try {
    // Only update project's spent amount if the expenditure is approved
    if (this.status === 'Approved') {
      const Project = mongoose.model('Project');
      
      // If this is a new approved expenditure
      if (this.isNew) {
        await Project.findByIdAndUpdate(
          this.project,
          { $inc: { spent: this.amount } }
        );
      } 
      // If this is an existing expenditure being updated
      else if (this.isModified('amount') || this.isModified('status')) {
        // Get the original document before modification
        const originalDoc = await this.constructor.findById(this._id);
        
        // Calculate the difference
        let amountDifference = 0;
        
        if (originalDoc.status !== 'Approved' && this.status === 'Approved') {
          // If status changed from not approved to approved
          amountDifference = this.amount;
        } else if (originalDoc.status === 'Approved' && this.status !== 'Approved') {
          // If status changed from approved to not approved
          amountDifference = -originalDoc.amount;
        } else if (originalDoc.status === 'Approved' && this.status === 'Approved') {
          // If amount changed while status remains approved
          amountDifference = this.amount - originalDoc.amount;
        }
        
        // Update project's spent amount if there's a difference
        if (amountDifference !== 0) {
          await Project.findByIdAndUpdate(
            this.project,
            { $inc: { spent: amountDifference } }
          );
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Expenditure = mongoose.model('Expenditure', ExpenditureSchema);

module.exports = Expenditure; 