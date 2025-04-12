const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');


const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      userType: user.userType,
      role: user.role
    },
    config.server.jwtSecret,
    {
      expiresIn: config.server.jwtExpiresIn
    }
  );
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, userType, department, designation, phoneNumber, address, idProof } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

   
    const isGovernmentEmail = User.isGovernmentEmail(email);
    
  
    if (userType === 'official' && !isGovernmentEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Officials must use a government email (@gov.in)'
      });
    }

    
    const newUser = new User({
      name,
      email,
      password,
      userType,
      ...(userType === 'official' && { department, designation }),
      ...(userType === 'citizen' && { address, idProof }),
      phoneNumber,
      
      isEmailVerified: isGovernmentEmail,
      role: userType === 'official' ? config.roles.OFFICIAL : config.roles.CITIZEN
    });

    
    if (!isGovernmentEmail) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      newUser.emailVerificationToken = verificationToken;
      newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; 
    }

    
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          userType: newUser.userType,
          ...(newUser.userType === 'official' && { department: newUser.department }),
          isEmailVerified: newUser.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

   
    const user = await User.findByEmailWithPassword(email);

    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is disabled. Please contact support.'
      });
    }

 
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

 
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.role,
          ...(user.userType === 'official' && { 
            department: user.department,
            designation: user.designation
          }),
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: error.message
    });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          role: user.role,
          ...(user.userType === 'official' && { 
            department: user.department,
            designation: user.designation
          }),
          ...(user.userType === 'citizen' && { 
            address: user.address
          }),
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          blockchainAddress: user.blockchainAddress,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
   
    const allowedUpdates = ['name', 'phoneNumber', 'blockchainAddress'];
    
    if (req.user.userType === 'official') {
      allowedUpdates.push('designation');
    } else {
      allowedUpdates.push('address');
    }

   
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

   
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          userType: updatedUser.userType,
          role: updatedUser.role,
          ...(updatedUser.userType === 'official' && { 
            department: updatedUser.department,
            designation: updatedUser.designation
          }),
          ...(updatedUser.userType === 'citizen' && { 
            address: updatedUser.address
          }),
          phoneNumber: updatedUser.phoneNumber,
          profilePicture: updatedUser.profilePicture,
          blockchainAddress: updatedUser.blockchainAddress,
          isEmailVerified: updatedUser.isEmailVerified
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
      error: error.message
    });
  }
};


exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

  
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current password and new password'
      });
    }

    
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    user.password = newPassword;
    await user.save();

   
    const token = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
      data: { token }
    });
  } catch (error) {
    logger.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update password',
      error: error.message
    });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email address'
      });
    }

   
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User with this email does not exist'
      });
    }

    
    const resetToken = crypto.randomBytes(32).toString('hex');

    
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });


    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a new password'
      });
    }

    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Password reset token is invalid or has expired'
      });
    }

  
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

   
    const jwtToken = generateToken(user);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful',
      data: { token: jwtToken }
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
      error: error.message
    });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

  
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Email verification token is invalid or has expired'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify email',
      error: error.message
    });
  }
}; 