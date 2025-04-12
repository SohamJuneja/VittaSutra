const express = require('express');
const blockchainService = require('../blockchain/blockchainService');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const router = express.Router();

// Get blockchain status (connection info, block number)
router.get(
  '/status',
  authMiddleware,
  async (req, res) => {
    try {
      const status = await blockchainService.initialize();
      
      if (!status) {
        return res.status(500).json({
          success: false,
          message: 'Blockchain connection error'
        });
      }
      
      res.status(200).json({
        success: true,
        status: 'connected'
      });
    } catch (error) {
      console.error('Blockchain status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blockchain status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

// Verify a transaction on the blockchain
router.get(
  '/verify/:txHash',
  authMiddleware,
  async (req, res) => {
    try {
      const { txHash } = req.params;
      
      if (!txHash || txHash.length !== 66 || !txHash.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction hash format'
        });
      }
      
      const verified = await blockchainService.verifyTransaction(txHash);
      
      res.status(200).json({
        success: true,
        verified,
        txHash
      });
    } catch (error) {
      console.error('Blockchain verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify transaction',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

// Get project data from blockchain
router.get(
  '/project/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await blockchainService.getProjectFromBlockchain(id);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Project not found on blockchain or error occurred',
          error: result.error
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get blockchain project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project from blockchain',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

// Get expenditure data from blockchain
router.get(
  '/expenditure/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await blockchainService.getExpenditureFromBlockchain(id);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: 'Expenditure not found on blockchain or error occurred',
          error: result.error
        });
      }
      
      res.status(200).json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Get blockchain expenditure error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get expenditure from blockchain',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

// Add an official to blockchain contract - Admin only
router.post(
  '/official',
  authMiddleware,
  roleMiddleware('official'),
  async (req, res) => {
    try {
      // Only admins can add officials to blockchain
      // Since we don't have a separate admin role in our authentication system,
      // we're using the official role here, but in a real application you would 
      // check for an admin flag or separate admin role
      
      const { address, isAdmin } = req.body;
      
      if (!address || address.length !== 42 || !address.startsWith('0x')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Ethereum address format'
        });
      }
      
      // Call blockchain service to add official
      // This would be implemented in a real application
      const result = {
        success: true,
        txHash: '0x' + '0'.repeat(64), // Mock transaction hash
        message: 'Official would be added to blockchain in a real application'
      };
      
      res.status(200).json({
        success: true,
        result
      });
    } catch (error) {
      console.error('Add blockchain official error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add official to blockchain',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  }
);

module.exports = router; 