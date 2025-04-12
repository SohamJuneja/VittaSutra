const Complaint = require('../models/Complaint');
const Project = require('../models/Project');
const blockchainService = require('../blockchain/blockchainService');
const { validationResult } = require('express-validator');

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { 
      project: projectId, 
      title, 
      description, 
      category, 
      location,
      dateOfIncident
    } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Create new complaint in MongoDB
    const newComplaint = new Complaint({
      project: projectId,
      title,
      description,
      category,
      location,
      dateOfIncident: new Date(dateOfIncident),
      submittedBy: req.user.id,
      status: 'Pending',
      priority: req.body.priority || 'Medium',
      isPublic: req.body.isPublic === true
    });
    
    // Process attachments if present
    if (req.files && req.files.length > 0) {
      newComplaint.attachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadDate: new Date(),
        type: getFileType(file.mimetype),
        description: file.originalname
      }));
    }
    
    // Save complaint to MongoDB
    const savedComplaint = await newComplaint.save();
    
    // Record on blockchain for transparency
    // Generate a proof hash from the first attachment or the complaint ID itself
    const proofHash = req.files && req.files.length > 0 
      ? req.files[0].path 
      : savedComplaint._id.toString();
    
    const blockchainResult = await blockchainService.submitComplaint(
      savedComplaint._id.toString(),
      projectId,
      title,
      description,
      proofHash
    );
    
    // Update complaint with blockchain data
    if (blockchainResult.success) {
      savedComplaint.blockchainData = {
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        timestamp: new Date()
      };
      
      await savedComplaint.save();
    }
    
    res.status(201).json({
      success: true,
      complaint: savedComplaint,
      blockchainStatus: blockchainResult.success ? 'recorded' : 'pending'
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get all complaints with pagination and filters
exports.getAllComplaints = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      project: projectId, 
      category, 
      status,
      priority,
      startDate,
      endDate,
      sort = 'createdAt',
      order = 'desc' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    let query = {};
    
    // Filter by project
    if (projectId) query.project = projectId;
    
    // Filter by category
    if (category) query.category = category;
    
    // Filter by status
    if (status) query.status = status;
    
    // Filter by priority
    if (priority) query.priority = priority;
    
    // Filter by date range of incident
    if (startDate || endDate) {
      query.dateOfIncident = {};
      if (startDate) query.dateOfIncident.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.dateOfIncident.$lte = endDateObj;
      }
    }
    
    // User type specific filtering
    if (req.user.userType === 'citizen') {
      // Citizens can only see their own complaints or public ones
      query = {
        ...query,
        $or: [
          { submittedBy: req.user.id },
          { isPublic: true }
        ]
      };
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sort] = order === 'desc' ? -1 : 1;
    
    // Get complaints with pagination
    const complaints = await Complaint.find(query)
      .populate('project', 'nameHindi nameEnglish department')
      .populate('submittedBy', 'name email userType')
      .populate('assignedTo', 'name email userType')
      .populate('responses.respondedBy', 'name email userType')
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Complaint.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      complaints
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaintId = req.params.id;
    
    // Find complaint by ID
    const complaint = await Complaint.findById(complaintId)
      .populate('project', 'nameHindi nameEnglish department status')
      .populate('submittedBy', 'name email userType')
      .populate('assignedTo', 'name email userType')
      .populate('responses.respondedBy', 'name email userType')
      .populate('resolution.resolvedBy', 'name email userType');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check access permissions
    if (req.user.userType === 'citizen' && 
        !complaint.isPublic && 
        complaint.submittedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this complaint'
      });
    }
    
    // Get blockchain verification if available
    let blockchainVerification = null;
    if (complaint.blockchainData && complaint.blockchainData.txHash) {
      // Verify transaction on blockchain
      const txVerified = await blockchainService.verifyTransaction(
        complaint.blockchainData.txHash
      );
      
      blockchainVerification = {
        txHash: complaint.blockchainData.txHash,
        blockNumber: complaint.blockchainData.blockNumber,
        timestamp: complaint.blockchainData.timestamp,
        verified: txVerified
      };
    }
    
    res.status(200).json({
      success: true,
      complaint,
      blockchainVerification
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Update complaint status and details
exports.updateComplaint = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const complaintId = req.params.id;
    
    // Find complaint by ID
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check permissions
    if (req.user.userType === 'citizen') {
      // Citizens can only update their own complaints and only certain fields
      if (complaint.submittedBy.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this complaint'
        });
      }
      
      // Citizens can only update title, description, and category if complaint is still pending
      if (complaint.status !== 'Pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot update complaint that is already under investigation or resolved'
        });
      }
      
      // Update allowed fields for citizens
      const { title, description, category, isPublic } = req.body;
      
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) complaint.category = category;
      if (isPublic !== undefined) complaint.isPublic = isPublic;
    } else {
      // Officials can update more fields
      const { 
        status, 
        priority, 
        assignedTo,
        verificationChecklist
      } = req.body;
      
      if (status) complaint.status = status;
      if (priority) complaint.priority = priority;
      if (assignedTo) complaint.assignedTo = assignedTo;
      
      // Update verification checklist
      if (verificationChecklist) {
        complaint.verificationChecklist = {
          ...complaint.verificationChecklist,
          ...verificationChecklist
        };
      }
      
      // If resolving the complaint
      if (status === 'Resolved' && complaint.status !== 'Resolved') {
        complaint.resolution = {
          actionTaken: req.body.actionTaken,
          date: new Date(),
          resolvedBy: req.user.id
        };
        
        // Record resolution on blockchain
        const responseHash = `Resolution by ${req.user.id} on ${new Date().toISOString()}`;
        
        const blockchainResult = await blockchainService.resolveComplaint(
          complaintId,
          responseHash
        );
        
        if (blockchainResult.success) {
          // Update blockchain record with resolution data
          complaint.blockchainData = {
            ...complaint.blockchainData,
            resolutionTxHash: blockchainResult.txHash,
            resolutionTimestamp: new Date()
          };
        }
      }
    }
    
    // Process new attachments if present
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadDate: new Date(),
        type: getFileType(file.mimetype),
        description: file.originalname
      }));
      
      // Append new attachments to existing ones
      complaint.attachments = [...(complaint.attachments || []), ...newAttachments];
    }
    
    // Save updated complaint
    const updatedComplaint = await complaint.save();
    
    res.status(200).json({
      success: true,
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Add response to a complaint
exports.addResponse = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Only officials can add responses
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to respond to complaints'
      });
    }

    const complaintId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }
    
    // Find complaint by ID
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Create response object
    const response = {
      message,
      respondedBy: req.user.id,
      date: new Date()
    };
    
    // Process attachments if present
    if (req.files && req.files.length > 0) {
      response.attachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path
      }));
    }
    
    // Add response to complaint
    complaint.responses.push(response);
    
    // If not already, set status to under investigation
    if (complaint.status === 'Pending') {
      complaint.status = 'Under Investigation';
    }
    
    // If not already assigned, assign to the responding official
    if (!complaint.assignedTo) {
      complaint.assignedTo = req.user.id;
    }
    
    // Save complaint with new response
    const updatedComplaint = await complaint.save();
    
    res.status(200).json({
      success: true,
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Submit feedback for a resolved complaint
exports.submitFeedback = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Only the citizen who submitted the complaint can provide feedback
    const complaintId = req.params.id;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating is required and must be between 1 and 5'
      });
    }
    
    // Find complaint by ID
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Check if user is the one who submitted the complaint
    if (complaint.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the complaint submitter can provide feedback'
      });
    }
    
    // Check if complaint is resolved
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only provide feedback for resolved complaints'
      });
    }
    
    // Check if feedback already exists
    if (complaint.resolution && complaint.resolution.feedback && complaint.resolution.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been provided for this complaint'
      });
    }
    
    // Add feedback to resolution
    if (!complaint.resolution) {
      complaint.resolution = {};
    }
    
    complaint.resolution.feedback = {
      rating,
      comment,
      date: new Date()
    };
    
    // Save updated complaint
    const updatedComplaint = await complaint.save();
    
    res.status(200).json({
      success: true,
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get complaint statistics
exports.getComplaintStatistics = async (req, res) => {
  try {
    // Get departmental filtering if provided
    const { department, projectId } = req.query;
    
    // Build filter
    const projectFilter = {};
    
    if (projectId) {
      projectFilter.project = projectId;
    } else if (department) {
      // Find projects in the department first
      const projectIds = await Project.find({ department })
        .distinct('_id');
      
      projectFilter.project = { $in: projectIds };
    }
    
    // Get status counts
    const pendingCount = await Complaint.countDocuments({ 
      ...projectFilter,
      status: 'Pending' 
    });
    
    const underInvestigationCount = await Complaint.countDocuments({ 
      ...projectFilter,
      status: 'Under Investigation' 
    });
    
    const resolvedCount = await Complaint.countDocuments({ 
      ...projectFilter,
      status: 'Resolved' 
    });
    
    const rejectedCount = await Complaint.countDocuments({ 
      ...projectFilter,
      status: 'Rejected' 
    });
    
    // Get category distribution
    const categoryDistribution = await Complaint.aggregate([
      { $match: projectFilter },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get resolution time statistics (in days)
    const resolutionTimeStats = await Complaint.aggregate([
      { 
        $match: { 
          ...projectFilter,
          status: 'Resolved',
          'resolution.date': { $exists: true }
        } 
      },
      {
        $project: {
          resolutionTime: { 
            $divide: [
              { $subtract: ['$resolution.date', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' },
          minResolutionTime: { $min: '$resolutionTime' },
          maxResolutionTime: { $max: '$resolutionTime' }
        }
      }
    ]);
    
    // Get feedback statistics
    const feedbackStats = await Complaint.aggregate([
      {
        $match: {
          ...projectFilter,
          'resolution.feedback.rating': { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$resolution.feedback.rating' },
          count: { $sum: 1 },
          ratings: {
            $push: '$resolution.feedback.rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          avgRating: 1,
          count: 1,
          distribution: {
            1: {
              $size: {
                $filter: {
                  input: '$ratings',
                  as: 'rating',
                  cond: { $eq: ['$$rating', 1] }
                }
              }
            },
            2: {
              $size: {
                $filter: {
                  input: '$ratings',
                  as: 'rating',
                  cond: { $eq: ['$$rating', 2] }
                }
              }
            },
            3: {
              $size: {
                $filter: {
                  input: '$ratings',
                  as: 'rating',
                  cond: { $eq: ['$$rating', 3] }
                }
              }
            },
            4: {
              $size: {
                $filter: {
                  input: '$ratings',
                  as: 'rating',
                  cond: { $eq: ['$$rating', 4] }
                }
              }
            },
            5: {
              $size: {
                $filter: {
                  input: '$ratings',
                  as: 'rating',
                  cond: { $eq: ['$$rating', 5] }
                }
              }
            }
          }
        }
      }
    ]);
    
    // Get monthly complaint trend for past 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const monthlyComplaints = await Complaint.aggregate([
      { 
        $match: { 
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { 
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1 
        } 
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        status: {
          pending: pendingCount,
          underInvestigation: underInvestigationCount,
          resolved: resolvedCount,
          rejected: rejectedCount,
          total: pendingCount + underInvestigationCount + resolvedCount + rejectedCount
        },
        categoryDistribution,
        resolutionTime: resolutionTimeStats.length > 0 ? {
          avg: resolutionTimeStats[0].avgResolutionTime,
          min: resolutionTimeStats[0].minResolutionTime,
          max: resolutionTimeStats[0].maxResolutionTime
        } : {
          avg: 0,
          min: 0,
          max: 0
        },
        feedback: feedbackStats.length > 0 ? {
          avgRating: feedbackStats[0].avgRating,
          count: feedbackStats[0].count,
          distribution: feedbackStats[0].distribution
        } : {
          avgRating: 0,
          count: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        },
        monthlyTrend: monthlyComplaints
      }
    });
  } catch (error) {
    console.error('Get complaint statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Utility function to determine file type from MIME type
function getFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || 
      mimeType.includes('document') || 
      mimeType.includes('text/')) return 'document';
  return 'document'; // Default
} 