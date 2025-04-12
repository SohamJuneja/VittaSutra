const Expenditure = require('../models/Expenditure');
const Project = require('../models/Project');
const blockchainService = require('../blockchain/blockchainService');
const { validationResult } = require('express-validator');

// Create a new expenditure
exports.createExpenditure = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Only officials can create expenditures
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create expenditures'
      });
    }

    const { 
      project: projectId, 
      amount, 
      category, 
      date, 
      description, 
      paymentMethod,
      paymentDetails,
      status
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Default status is Pending
    const expenditureStatus = status || 'Pending';
    
    // Create new expenditure in MongoDB
    const newExpenditure = new Expenditure({
      project: projectId,
      amount: parseFloat(amount),
      category,
      date: new Date(date),
      description,
      paymentMethod,
      paymentDetails,
      createdBy: req.user.id,
      status: expenditureStatus
    });
    
    // If status is already Approved, set the approvedBy and approvalDate
    if (expenditureStatus === 'Approved') {
      newExpenditure.approvedBy = req.user.id;
      newExpenditure.approvalDate = new Date();
    }
    
    // Process attachments if present
    if (req.files && req.files.length > 0) {
      newExpenditure.attachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadDate: new Date()
      }));
    }
    
    // Save expenditure to MongoDB
    const savedExpenditure = await newExpenditure.save();
    
    // If approved, record on blockchain
    let blockchainResult = { success: false };
    if (expenditureStatus === 'Approved') {
      // Get proof hash (IPFS or just the MongoDB ID for now)
      const proofHash = savedExpenditure._id.toString();
      
      blockchainResult = await blockchainService.addExpenditure(
        savedExpenditure._id.toString(),
        projectId,
        amount,
        category,
        description,
        Math.floor(new Date(date).getTime() / 1000),  // Convert to seconds timestamp
        proofHash
      );
      
      // Update expenditure with blockchain data
      if (blockchainResult.success) {
        savedExpenditure.blockchainData = {
          txHash: blockchainResult.txHash,
          blockNumber: blockchainResult.blockNumber,
          timestamp: new Date(),
          verified: false
        };
        
        await savedExpenditure.save();
      }
    }
    
    res.status(201).json({
      success: true,
      expenditure: savedExpenditure,
      blockchainStatus: blockchainResult.success ? 'recorded' : 'pending'
    });
  } catch (error) {
    console.error('Create expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get all expenditures with pagination and filters
exports.getAllExpenditures = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      project: projectId, 
      category, 
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sort = 'date',
      order = 'desc' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query = {};
    
    // Filter by project
    if (projectId) query.project = projectId;
    
    // Filter by category
    if (category) query.category = category;
    
    // Filter by status
    if (status) query.status = status;
    
    // Filter by amount range
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.date.$lte = endDateObj;
      }
    }
    
    // User type specific filtering
    if (req.user.userType === 'citizen') {
      // Citizens can only see approved expenditures
      query.status = 'Approved';
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sort] = order === 'desc' ? -1 : 1;
    
    // Get expenditures with pagination
    const expenditures = await Expenditure.find(query)
      .populate('project', 'nameHindi nameEnglish department')
      .populate('createdBy', 'name email userType')
      .populate('approvedBy', 'name email userType')
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Expenditure.countDocuments(query);
    
    // Hide sensitive payment details for citizens
    let filteredExpenditures = expenditures;
    if (req.user.userType === 'citizen') {
      filteredExpenditures = expenditures.map(exp => {
        const expObj = exp.toObject();
        delete expObj.paymentDetails;
        return expObj;
      });
    }
    
    res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      expenditures: filteredExpenditures
    });
  } catch (error) {
    console.error('Get all expenditures error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenditures',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get expenditure by ID
exports.getExpenditureById = async (req, res) => {
  try {
    const expenditureId = req.params.id;
    
    // Find expenditure by ID
    const expenditure = await Expenditure.findById(expenditureId)
      .populate('project', 'nameHindi nameEnglish department status')
      .populate('createdBy', 'name email userType')
      .populate('approvedBy', 'name email userType');
    
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    // Check if citizen is trying to access non-approved expenditure
    if (req.user.userType === 'citizen' && expenditure.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this expenditure'
      });
    }
    
    // Get blockchain verification if available
    let blockchainVerification = null;
    if (expenditure.blockchainData && expenditure.blockchainData.txHash) {
      blockchainVerification = await blockchainService.getExpenditureFromBlockchain(
        expenditure._id.toString()
      );
      
      // Verify transaction on blockchain
      const txVerified = await blockchainService.verifyTransaction(
        expenditure.blockchainData.txHash
      );
      
      if (txVerified && !expenditure.blockchainData.verified) {
        expenditure.blockchainData.verified = true;
        await expenditure.save();
      }
    }
    
    // Hide sensitive payment details for citizens
    let filteredExpenditure = expenditure;
    if (req.user.userType === 'citizen') {
      const expObj = expenditure.toObject();
      delete expObj.paymentDetails;
      filteredExpenditure = expObj;
    }
    
    res.status(200).json({
      success: true,
      expenditure: filteredExpenditure,
      blockchainVerification: blockchainVerification?.success ? blockchainVerification.data : null
    });
  } catch (error) {
    console.error('Get expenditure by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Update expenditure
exports.updateExpenditure = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Only officials can update expenditures
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update expenditures'
      });
    }

    const expenditureId = req.params.id;
    
    // Find expenditure by ID
    const expenditure = await Expenditure.findById(expenditureId);
    
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    // Check status and blockchain recording
    const originalStatus = expenditure.status;
    const wasAlreadyApproved = originalStatus === 'Approved';
    
    const { 
      amount, 
      category, 
      date, 
      description, 
      paymentMethod,
      paymentDetails,
      status
    } = req.body;
    
    // Update fields
    if (amount) expenditure.amount = parseFloat(amount);
    if (category) expenditure.category = category;
    if (date) expenditure.date = new Date(date);
    if (description) expenditure.description = description;
    if (paymentMethod) expenditure.paymentMethod = paymentMethod;
    if (paymentDetails) expenditure.paymentDetails = paymentDetails;
    
    // Handle status change and approval
    if (status && status !== originalStatus) {
      expenditure.status = status;
      
      // If changing to Approved status
      if (status === 'Approved' && originalStatus !== 'Approved') {
        expenditure.approvedBy = req.user.id;
        expenditure.approvalDate = new Date();
      }
      
      // If rejecting an expenditure
      if (status === 'Rejected' && req.body.rejectionReason) {
        expenditure.rejectionReason = req.body.rejectionReason;
      }
    }
    
    // Process new attachments if present
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadDate: new Date()
      }));
      
      // Append new attachments to existing ones
      expenditure.attachments = [...(expenditure.attachments || []), ...newAttachments];
    }
    
    // Save updated expenditure
    const updatedExpenditure = await expenditure.save();
    
    // Handle blockchain recording if needed
    let blockchainResult = { success: false };
    
    // If newly approved or approved with changes to amount, category, date, or description
    if ((status === 'Approved' && !wasAlreadyApproved) || 
        (wasAlreadyApproved && (amount || category || date || description))) {
      
      // Get proof hash (IPFS or just the MongoDB ID for now)
      const proofHash = updatedExpenditure._id.toString();
      
      blockchainResult = await blockchainService.addExpenditure(
        updatedExpenditure._id.toString(),
        updatedExpenditure.project.toString(),
        updatedExpenditure.amount,
        updatedExpenditure.category,
        updatedExpenditure.description,
        Math.floor(updatedExpenditure.date.getTime() / 1000),  // Convert to seconds timestamp
        proofHash
      );
      
      // Update expenditure with blockchain data
      if (blockchainResult.success) {
        updatedExpenditure.blockchainData = {
          txHash: blockchainResult.txHash,
          blockNumber: blockchainResult.blockNumber,
          timestamp: new Date(),
          verified: false
        };
        
        await updatedExpenditure.save();
      }
    }
    
    res.status(200).json({
      success: true,
      expenditure: updatedExpenditure,
      blockchainStatus: blockchainResult.success ? 'updated' : 'pending'
    });
  } catch (error) {
    console.error('Update expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Delete expenditure
exports.deleteExpenditure = async (req, res) => {
  try {
    // Only officials can delete expenditures
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete expenditures'
      });
    }

    const expenditureId = req.params.id;
    
    // Find expenditure by ID
    const expenditure = await Expenditure.findById(expenditureId);
    
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    // Check if already approved - cannot delete if recorded on blockchain
    if (expenditure.status === 'Approved' && expenditure.blockchainData?.txHash) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an approved expenditure recorded on blockchain. Change status to Rejected instead.'
      });
    }
    
    // Delete expenditure
    await Expenditure.findByIdAndDelete(expenditureId);
    
    res.status(200).json({
      success: true,
      message: 'Expenditure deleted successfully'
    });
  } catch (error) {
    console.error('Delete expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Verify expenditure on blockchain
exports.verifyExpenditure = async (req, res) => {
  try {
    // Only officials can verify expenditures
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to verify expenditures'
      });
    }

    const expenditureId = req.params.id;
    
    // Find expenditure by ID
    const expenditure = await Expenditure.findById(expenditureId);
    
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    // Check if already verified
    if (expenditure.blockchainData?.verified) {
      return res.status(400).json({
        success: false,
        message: 'Expenditure already verified'
      });
    }
    
    // Verify on blockchain
    const blockchainResult = await blockchainService.verifyExpenditure(
      expenditure._id.toString()
    );
    
    if (!blockchainResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify expenditure on blockchain',
        error: blockchainResult.error
      });
    }
    
    // Update blockchain verification status
    expenditure.blockchainData = {
      ...expenditure.blockchainData,
      verified: true,
      verificationHash: blockchainResult.txHash
    };
    
    await expenditure.save();
    
    res.status(200).json({
      success: true,
      message: 'Expenditure verified successfully',
      verificationTxHash: blockchainResult.txHash
    });
  } catch (error) {
    console.error('Verify expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
}; 