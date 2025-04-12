const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't include password by default in query results
    },
    userType: {
      type: String,
      enum: ['citizen', 'official'],
      required: true,
    },
    department: {
      type: String,
      required: function() {
        return this.userType === 'official';
      },
    },
    designation: {
      type: String,
      required: function() {
        return this.userType === 'official';
      },
    },
    profilePicture: {
      type: String,
    },
    phoneNumber: {
      type: String,
      match: [
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
        'Please provide a valid phone number'
      ],
    },
    address: {
      type: String,
      required: function() {
        return this.userType === 'citizen';
      }
    },
    idProof: {
      type: String,
      required: function() {
        return this.userType === 'citizen';
      }
    },
    blockchainAddress: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    role: {
      type: String,
      enum: [config.roles.CITIZEN, config.roles.OFFICIAL, config.roles.ADMIN],
      default: function() {
        return this.userType === 'official' ? config.roles.OFFICIAL : config.roles.CITIZEN;
      }
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        return ret;
      }
    }
  }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Check if email is government email
UserSchema.statics.isGovernmentEmail = function(email) {
  return email.endsWith('@gov.in');
};

// Check if password is correct
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to determine if user is an official (includes admin)
UserSchema.methods.isOfficial = function() {
  return this.userType === 'official' || this.role === config.roles.ADMIN;
};

// Method to determine if user is an admin
UserSchema.methods.isAdmin = function() {
  return this.role === config.roles.ADMIN;
};

// Static method to find by email with password included
UserSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

const User = mongoose.model('User', UserSchema);

module.exports = User; 