const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads/projects');

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
    cb(null, 'project-' + uniqueSuffix + ext);
  }
});

const fileFilter = function(req, file, cb) {
  // Allow only certain file types
  const allowedFileTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, XLS, and XLSX files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Project creation validation
const createProjectValidation = [
  body('nameHindi')
    .notEmpty()
    .withMessage('Hindi name is required')
    .trim(),
  body('nameEnglish')
    .notEmpty()
    .withMessage('English name is required')
    .trim(),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .trim(),
  body('budget')
    .notEmpty()
    .withMessage('Budget is required')
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('expectedEndDate')
    .notEmpty()
    .withMessage('Expected end date is required')
    .isISO8601()
    .withMessage('Invalid expected end date format')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('Expected end date must be after start date');
      }
      return true;
    }),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim()
];

// Project update validation
const updateProjectValidation = [
  body('nameHindi')
    .optional()
    .trim(),
  body('nameEnglish')
    .optional()
    .trim(),
  body('department')
    .optional()
    .trim(),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('expectedEndDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expected end date format'),
  body('actualEndDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid actual end date format'),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'])
    .withMessage('Invalid status value'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be a number between 0 and 100'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority value')
];

// Routes

// Create a new project - Only officials can create projects
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('official'), 
  upload.array('attachments', 5), 
  createProjectValidation, 
  projectController.createProject
);

// Get all projects - Both citizens and officials can see projects
router.get(
  '/',
  authMiddleware,
  projectController.getAllProjects
);

// Get project by ID - Both citizens and officials can see projects
router.get(
  '/:id',
  authMiddleware,
  projectController.getProjectById
);

// Update project - Only officials can update projects
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('official'),
  upload.array('attachments', 5),
  updateProjectValidation,
  projectController.updateProject
);

// Delete project - Only officials can delete projects
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('official'),
  projectController.deleteProject
);

// Get project statistics - Both citizens and officials can see statistics
router.get(
  '/stats/overview',
  authMiddleware,
  projectController.getProjectStatistics
);

module.exports = router; 