const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const expenditureController = require('../controllers/expenditureController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '../../uploads/expenditures');

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
    cb(null, 'expenditure-' + uniqueSuffix + ext);
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

// Expenditure creation validation
const createExpenditureValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project ID is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      return true;
    }),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Labor',
      'Materials',
      'Equipment',
      'Consultation',
      'Transportation',
      'Permits',
      'Administrative',
      'Technology',
      'Miscellaneous'
    ])
    .withMessage('Invalid category'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .trim(),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['Cash', 'Bank Transfer', 'Check', 'Digital Payment'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Under Review'])
    .withMessage('Invalid status')
];

// Expenditure update validation
const updateExpenditureValidation = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom(value => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than zero');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn([
      'Labor',
      'Materials',
      'Equipment',
      'Consultation',
      'Transportation',
      'Permits',
      'Administrative',
      'Technology',
      'Miscellaneous'
    ])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Bank Transfer', 'Check', 'Digital Payment'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Rejected', 'Under Review'])
    .withMessage('Invalid status'),
  body('rejectionReason')
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.status === 'Rejected' && !value) {
        throw new Error('Rejection reason is required when status is Rejected');
      }
      return true;
    })
];

// Routes

// Create a new expenditure - Only officials can create expenditures
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('official'), 
  upload.array('attachments', 5), 
  createExpenditureValidation, 
  expenditureController.createExpenditure
);

// Get all expenditures - Both citizens and officials can see expenditures (filtered)
router.get(
  '/',
  authMiddleware,
  expenditureController.getAllExpenditures
);

// Get expenditure by ID - Both citizens and officials can see expenditures (filtered)
router.get(
  '/:id',
  authMiddleware,
  expenditureController.getExpenditureById
);

// Update expenditure - Only officials can update expenditures
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('official'),
  upload.array('attachments', 5),
  updateExpenditureValidation,
  expenditureController.updateExpenditure
);

// Delete expenditure - Only officials can delete expenditures
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('official'),
  expenditureController.deleteExpenditure
);

// Verify expenditure on blockchain - Only officials can verify expenditures
router.post(
  '/:id/verify',
  authMiddleware,
  roleMiddleware('official'),
  expenditureController.verifyExpenditure
);

module.exports = router; 