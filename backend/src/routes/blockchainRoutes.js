const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { authenticate, restrictTo, restrictToOfficials } = require('../middleware/authMiddleware');
const { blockchainMiddleware, requireBlockchain } = require('../middleware/blockchainMiddleware');
const config = require('../config');

// Apply blockchain middleware to all routes
router.use(blockchainMiddleware);

/**
 * @route GET /api/blockchain/status
 * @desc Get blockchain status and information
 * @access Public
 */
router.get('/status', blockchainController.getBlockchainStatus);

/**
 * @route POST /api/blockchain/register-address
 * @desc Register user's blockchain address
 * @access Private
 */
router.post('/register-address', authenticate, blockchainController.registerAddress);

/**
 * @route POST /api/blockchain/verify/project/:id
 * @desc Verify a project on the blockchain
 * @access Private (Officials only)
 */
router.post(
  '/verify/project/:id',
  authenticate,
  restrictToOfficials,
  requireBlockchain,
  blockchainController.verifyProject
);

/**
 * @route POST /api/blockchain/verify/expenditure/:id
 * @desc Verify an expenditure on the blockchain
 * @access Private (Officials only)
 */
router.post(
  '/verify/expenditure/:id',
  authenticate,
  restrictToOfficials,
  requireBlockchain,
  blockchainController.verifyExpenditure
);

module.exports = router; 