const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads/complaints');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'complaint-' + uniqueSuffix + ext);
  }
});

const fileFilter = function(req, file, cb) {
  // Allow only certain file types
  const allowedFileTypes = [
    'image/jpeg', 
    'image/png',
    'image/gif', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, DOCX, MP4, MOV, MP3, and WAV files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Complaint creation validation
const createComplaintValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project ID is required'),
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Quality Issues',
      'Delay',
      'Corruption',
      'Safety Concerns',
      'Environmental Concerns',
      'Labor Issues',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('dateOfIncident')
    .notEmpty()
    .withMessage('Date of incident is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Date of incident cannot be in the future');
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

// Complaint update validation
const updateComplaintValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('category')
    .optional()
    .isIn([
      'Quality Issues',
      'Delay',
      'Corruption',
      'Safety Concerns',
      'Environmental Concerns',
      'Labor Issues',
      'Other'
    ])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['Pending', 'Under Investigation', 'Resolved', 'Rejected'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  body('actionTaken')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.status === 'Resolved' && !value) {
        throw new Error('Action taken is required when resolving a complaint');
      }
      return true;
    })
];

// Response validation
const responseValidation = [
  body('message')
    .notEmpty()
    .withMessage('Response message is required')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Response message must be at least 10 characters')
];

// Feedback validation
const feedbackValidation = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
];

// Routes

// Create a new complaint - Both citizens and officials can create complaints
router.post(
  '/', 
  authMiddleware, 
  upload.array('attachments', 5), 
  createComplaintValidation, 
  complaintController.createComplaint
);

// Get all complaints - Filtered by user type
router.get(
  '/',
  authMiddleware,
  complaintController.getAllComplaints
);

// Get complaint by ID - Filtered by user type and permissions
router.get(
  '/:id',
  authMiddleware,
  complaintController.getComplaintById
);

// Update complaint status and details
router.put(
  '/:id',
  authMiddleware,
  upload.array('attachments', 5),
  updateComplaintValidation,
  complaintController.updateComplaint
);

// Add response to a complaint - Only officials can respond
router.post(
  '/:id/responses',
  authMiddleware,
  roleMiddleware('official'),
  upload.array('attachments', 5),
  responseValidation,
  complaintController.addResponse
);

// Submit feedback for a resolved complaint - Only citizens who submitted the complaint can provide feedback
router.post(
  '/:id/feedback',
  authMiddleware,
  roleMiddleware('citizen'),
  feedbackValidation,
  complaintController.submitFeedback
);

// Get complaint statistics
router.get(
  '/stats/overview',
  authMiddleware,
  complaintController.getComplaintStatistics
);

module.exports = router; 