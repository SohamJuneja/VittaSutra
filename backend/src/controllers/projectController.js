const Project = require('../models/Project');
const Expenditure = require('../models/Expenditure');
const Complaint = require('../models/Complaint');
const blockchainService = require('../blockchain/blockchainService');
const { validationResult } = require('express-validator');

// Create a new project
exports.createProject = async (req, res) => {
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
      nameHindi, 
      nameEnglish, 
      department, 
      description, 
      startDate, 
      expectedEndDate, 
      budget,
      priority,
      location
    } = req.body;

    // Create new project in MongoDB
    const newProject = new Project({
      nameHindi,
      nameEnglish,
      department,
      description,
      startDate: new Date(startDate),
      expectedEndDate: new Date(expectedEndDate),
      budget: parseFloat(budget),
      status: 'Not Started',
      progress: 0,
      priority: priority || 'Medium',
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id,
      location
    });

    // Process attachments if present
    if (req.files && req.files.length > 0) {
      newProject.attachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadedBy: req.user.id
      }));
    }

    // Save project to MongoDB
    const savedProject = await newProject.save();

    // Record project on blockchain
    const blockchainResult = await blockchainService.createProject(
      savedProject._id.toString(),
      `${nameEnglish} - ${nameHindi}`,
      budget
    );

    // Update project with blockchain data
    if (blockchainResult.success) {
      savedProject.blockchainData = {
        projectHash: savedProject._id.toString(),
        contractAddress: process.env.CONTRACT_ADDRESS,
        creationTxHash: blockchainResult.txHash,
        lastUpdateTxHash: blockchainResult.txHash
      };
      
      await savedProject.save();
    }

    res.status(201).json({
      success: true,
      project: savedProject,
      blockchainStatus: blockchainResult.success ? 'recorded' : 'pending'
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get all projects with pagination and filters
exports.getAllProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department, 
      priority,
      search,
      sort = 'createdAt',
      order = 'desc' 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (priority) query.priority = priority;
    
    // Text search
    if (search) {
      query.$or = [
        { nameHindi: { $regex: search, $options: 'i' } },
        { nameEnglish: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort configuration
    const sortConfig = {};
    sortConfig[sort] = order === 'desc' ? -1 : 1;
    
    // Get projects with pagination
    const projects = await Project.find(query)
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email userType')
      .populate('lastUpdatedBy', 'name email userType');
    
    // Get total count for pagination
    const total = await Project.countDocuments(query);
    
    // Filter sensitive data for non-officials if the user is a citizen
    let filteredProjects = projects;
    if (req.user.userType === 'citizen') {
      filteredProjects = projects.map(project => {
        // Return a simpler version for citizens
        return {
          _id: project._id,
          nameHindi: project.nameHindi,
          nameEnglish: project.nameEnglish,
          department: project.department,
          description: project.description,
          startDate: project.startDate,
          expectedEndDate: project.expectedEndDate,
          budget: project.budget,
          spent: project.spent,
          status: project.status,
          progress: project.progress,
          location: project.location,
          remainingBudget: project.remainingBudget,
          budgetUtilizationPercentage: project.budgetUtilizationPercentage,
          createdAt: project.createdAt
        };
      });
    }
    
    res.status(200).json({
      success: true,
      count: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      projects: filteredProjects
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Find project by ID
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email userType')
      .populate('lastUpdatedBy', 'name email userType')
      .populate('team.userId', 'name email userType department designation');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get blockchain verification if available
    let blockchainVerification = null;
    if (project.blockchainData && project.blockchainData.projectHash) {
      blockchainVerification = await blockchainService.getProjectFromBlockchain(project._id.toString());
    }
    
    // Get additional data based on user type
    let expenditures = [];
    let complaints = [];
    
    // Officials can see all expenditures and complaints
    if (req.user.userType === 'official') {
      expenditures = await Expenditure.find({ project: projectId })
        .populate('createdBy', 'name email userType')
        .populate('approvedBy', 'name email userType')
        .sort({ date: -1 });
      
      complaints = await Complaint.find({ project: projectId })
        .populate('submittedBy', 'name email userType')
        .populate('assignedTo', 'name email userType')
        .populate('responses.respondedBy', 'name email userType')
        .populate('resolution.resolvedBy', 'name email userType')
        .sort({ createdAt: -1 });
    } 
    // Citizens see only approved expenditures and their own complaints
    else {
      expenditures = await Expenditure.find({ 
        project: projectId,
        status: 'Approved'
      })
        .select('-paymentDetails.accountNumber -paymentDetails.bankName')
        .sort({ date: -1 });
      
      complaints = await Complaint.find({ 
        project: projectId,
        $or: [
          { submittedBy: req.user.id },
          { isPublic: true }
        ]
      })
        .populate('submittedBy', 'name')
        .populate('responses.respondedBy', 'name')
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({
      success: true,
      project,
      expenditures,
      complaints,
      blockchainVerification: blockchainVerification?.success ? blockchainVerification.data : null
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const projectId = req.params.id;
    
    // Find project by ID
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only officials can update projects
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update projects'
      });
    }
    
    const { 
      nameHindi, 
      nameEnglish, 
      department, 
      description, 
      startDate, 
      expectedEndDate, 
      actualEndDate,
      budget,
      status,
      progress,
      priority,
      location,
      milestones
    } = req.body;
    
    // Update fields
    if (nameHindi) project.nameHindi = nameHindi;
    if (nameEnglish) project.nameEnglish = nameEnglish;
    if (department) project.department = department;
    if (description) project.description = description;
    if (startDate) project.startDate = new Date(startDate);
    if (expectedEndDate) project.expectedEndDate = new Date(expectedEndDate);
    if (actualEndDate) project.actualEndDate = new Date(actualEndDate);
    if (budget) project.budget = parseFloat(budget);
    if (status) project.status = status;
    if (progress !== undefined) project.progress = progress;
    if (priority) project.priority = priority;
    if (location) project.location = location;
    if (milestones) project.milestones = milestones;
    
    // Update attachments if present
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        name: file.originalname,
        path: file.path,
        uploadedBy: req.user.id
      }));
      
      // Append new attachments to existing ones
      project.attachments = [...project.attachments, ...newAttachments];
    }
    
    // Update last updated fields
    project.lastUpdatedBy = req.user.id;
    
    // If status is completed and actual end date is not set, set it to today
    if (status === 'Completed' && !actualEndDate) {
      project.actualEndDate = new Date();
    }
    
    // Save updated project
    const updatedProject = await project.save();
    
    // Update blockchain record if budget changed
    let blockchainResult = { success: false };
    if (budget && project.blockchainData && project.blockchainData.projectHash) {
      blockchainResult = await blockchainService.updateProjectBudget(
        project._id.toString(),
        parseFloat(budget)
      );
      
      // Update blockchain transaction record
      if (blockchainResult.success) {
        project.blockchainData.lastUpdateTxHash = blockchainResult.txHash;
        await project.save();
      }
    }
    
    res.status(200).json({
      success: true,
      project: updatedProject,
      blockchainStatus: blockchainResult.success ? 'updated' : 'pending'
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Delete project (soft delete by changing status to 'Cancelled')
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Find project by ID
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Only officials can delete projects
    if (req.user.userType !== 'official') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete projects'
      });
    }
    
    // Check if project has expenditures
    const expenditureCount = await Expenditure.countDocuments({ 
      project: projectId,
      status: 'Approved'
    });
    
    if (expenditureCount > 0) {
      // If project has expenditures, just mark as cancelled (soft delete)
      project.status = 'Cancelled';
      project.lastUpdatedBy = req.user.id;
      await project.save();
      
      return res.status(200).json({
        success: true,
        message: 'Project cancelled successfully',
        softDelete: true
      });
    }
    
    // If no expenditures, allow hard delete
    await Project.findByIdAndDelete(projectId);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      softDelete: false
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

// Get project statistics
exports.getProjectStatistics = async (req, res) => {
  try {
    // Get departmental filtering if provided
    const { department } = req.query;
    const filter = department ? { department } : {};
    
    // Get overall stats
    const totalProjects = await Project.countDocuments(filter);
    const completedProjects = await Project.countDocuments({ ...filter, status: 'Completed' });
    const inProgressProjects = await Project.countDocuments({ ...filter, status: 'In Progress' });
    const notStartedProjects = await Project.countDocuments({ ...filter, status: 'Not Started' });
    const onHoldProjects = await Project.countDocuments({ ...filter, status: 'On Hold' });
    const cancelledProjects = await Project.countDocuments({ ...filter, status: 'Cancelled' });
    
    // Get budget stats
    const budgetStats = await Project.aggregate([
      { $match: filter },
      { 
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$spent' },
          avgBudget: { $avg: '$budget' },
          avgSpent: { $avg: '$spent' }
        }
      }
    ]);
    
    // Get department-wise stats
    const departmentStats = await Project.aggregate([
      { 
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$spent' },
          completed: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get monthly expenditure trend for past 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const monthlyExpenditure = await Expenditure.aggregate([
      { 
        $match: { 
          date: { $gte: oneYearAgo },
          status: 'Approved'
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
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
        totalProjects,
        completedProjects,
        inProgressProjects,
        notStartedProjects,
        onHoldProjects,
        cancelledProjects,
        budget: budgetStats.length > 0 ? {
          totalBudget: budgetStats[0].totalBudget,
          totalSpent: budgetStats[0].totalSpent,
          remainingBudget: budgetStats[0].totalBudget - budgetStats[0].totalSpent,
          utilizationPercentage: (budgetStats[0].totalSpent / budgetStats[0].totalBudget) * 100,
          avgBudget: budgetStats[0].avgBudget,
          avgSpent: budgetStats[0].avgSpent
        } : {
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          utilizationPercentage: 0,
          avgBudget: 0,
          avgSpent: 0
        },
        departmentStats,
        monthlyExpenditure
      }
    });
  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
}; 