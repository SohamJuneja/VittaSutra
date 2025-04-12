const ethers = require('ethers');
const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../../config');


const abiPath = path.join(__dirname, 'abi/ExpenditureTracker.json');
const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

const BLOCKCHAIN_ENABLED = config.blockchain.enabled;
const BLOCKCHAIN_PROVIDER = config.blockchain.provider;
const CONTRACT_ADDRESS = config.blockchain.contractAddress;
const OWNER_PRIVATE_KEY = config.blockchain.ownerPrivateKey;
const GAS_LIMIT = config.blockchain.gasLimit;
const GAS_PRICE = config.blockchain.gasPrice;


let provider;
let wallet;
let contract;


async function initBlockchain() {
  if (!BLOCKCHAIN_ENABLED) {
    logger.info('Blockchain integration is disabled');
    return false;
  }

  try {
    logger.info(`Connecting to blockchain provider at ${BLOCKCHAIN_PROVIDER}`);
    provider = new ethers.JsonRpcProvider(BLOCKCHAIN_PROVIDER);
    
   
    await provider.getBlockNumber();
    
    if (!CONTRACT_ADDRESS) {
      logger.error('Contract address is not configured');
      return false;
    }
    
    if (!OWNER_PRIVATE_KEY) {
      logger.error('Owner private key is not configured');
      return false;
    }
    
  
    wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
  
    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
    
    logger.info(`Connected to contract at ${CONTRACT_ADDRESS}`);
    return true;
  } catch (error) {
    logger.error('Failed to initialize blockchain connection:', error);
    return false;
  }
}

/**
 * Generate a unique bytes32 hash from a string
 * @param {string} text - Text to hash
 * @returns {string} - Hex string of bytes32 hash
 */
function generateBytes32Hash(text) {
  return '0x' + createHash('sha256').update(text).digest('hex');
}

/**
 * Create a new project on the blockchain
 * @param {Object} project - Project data
 * @returns {Promise<Object>} - Transaction receipt
 */
async function createProject(project) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping createProject');
    return null;
  }
  
  try {
    const projectId = generateBytes32Hash(project._id.toString());
    const projectNameHash = generateBytes32Hash(project.name);
    
    logger.info(`Creating project on blockchain with ID: ${projectId}`);
    
    const tx = await contract.createProject(
      projectId,
      projectNameHash,
      ethers.parseEther(project.budget.toString())
    );
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error creating project on blockchain:', error);
    throw error;
  }
}

/**
 * Add expenditure to the blockchain
 * @param {Object} expenditure - Expenditure data
 * @param {string} projectId - MongoDB project ID
 * @returns {Promise<Object>} - Transaction receipt
 */
async function addExpenditure(expenditure, projectId) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping addExpenditure');
    return null;
  }
  
  try {
    const expenditureId = generateBytes32Hash(expenditure._id.toString());
    const blockchainProjectId = generateBytes32Hash(projectId);
    const categoryHash = generateBytes32Hash(expenditure.category);
    const descriptionHash = generateBytes32Hash(expenditure.description);
    const proofHash = expenditure.attachments && expenditure.attachments.length > 0
      ? generateBytes32Hash(expenditure.attachments[0])
      : generateBytes32Hash('no-proof');
    
    logger.info(`Adding expenditure to blockchain with ID: ${expenditureId}`);
    
    const tx = await contract.addExpenditure(
      expenditureId,
      blockchainProjectId,
      ethers.parseEther(expenditure.amount.toString()),
      categoryHash,
      descriptionHash,
      Math.floor(new Date(expenditure.date).getTime() / 1000),
      proofHash
    );
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error adding expenditure to blockchain:', error);
    throw error;
  }
}

/**
 * Verify an expenditure on the blockchain
 * @param {string} expenditureId - MongoDB expenditure ID
 * @returns {Promise<Object>}
 */
async function verifyExpenditure(expenditureId) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping verifyExpenditure');
    return null;
  }
  
  try {
    const blockchainExpenditureId = generateBytes32Hash(expenditureId.toString());
    
    logger.info(`Verifying expenditure on blockchain with ID: ${blockchainExpenditureId}`);
    
    const tx = await contract.verifyExpenditure(blockchainExpenditureId);
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error verifying expenditure on blockchain:', error);
    throw error;
  }
}

/**
 * Submit a complaint to the blockchain
 * @param {Object} complaint - Complaint data
 * @param {string} projectId - MongoDB project ID
 * @returns {Promise<Object>} - Transaction receipt
 */
async function submitComplaint(complaint, projectId) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping submitComplaint');
    return null;
  }
  
  try {
    const complaintId = generateBytes32Hash(complaint._id.toString());
    const blockchainProjectId = generateBytes32Hash(projectId);
    const titleHash = generateBytes32Hash(complaint.title);
    const descriptionHash = generateBytes32Hash(complaint.description);
    const proofHash = complaint.attachments && complaint.attachments.length > 0
      ? generateBytes32Hash(complaint.attachments[0])
      : generateBytes32Hash('no-proof');
    
    logger.info(`Submitting complaint to blockchain with ID: ${complaintId}`);
    
    const tx = await contract.submitComplaint(
      complaintId,
      blockchainProjectId,
      titleHash,
      descriptionHash,
      proofHash
    );
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error submitting complaint to blockchain:', error);
    throw error;
  }
}

/**
 * Resolve a complaint on the blockchain
 * @param {string} complaintId - MongoDB complaint ID
 * @param {string} response - Response text
 * @returns {Promise<Object>} - Transaction receipt
 */
async function resolveComplaint(complaintId, response) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping resolveComplaint');
    return null;
  }
  
  try {
    const blockchainComplaintId = generateBytes32Hash(complaintId.toString());
    const responseHash = generateBytes32Hash(response);
    
    logger.info(`Resolving complaint on blockchain with ID: ${blockchainComplaintId}`);
    
    const tx = await contract.resolveComplaint(blockchainComplaintId, responseHash);
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error resolving complaint on blockchain:', error);
    throw error;
  }
}

/**
 * Add a government official to the blockchain
 * @param {string} address - Ethereum address of the official
 * @param {boolean} isAdmin - Whether the official is an admin
 * @returns {Promise<Object>} - Transaction receipt
 */
async function addOfficial(address, isAdmin) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping addOfficial');
    return null;
  }
  
  try {
    logger.info(`Adding official ${address} to blockchain with admin rights: ${isAdmin}`);
    
    const tx = await contract.addOfficial(address, isAdmin);
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error adding official to blockchain:', error);
    throw error;
  }
}

/**
 * Update project budget on the blockchain
 * @param {string} projectId - MongoDB project ID
 * @param {number} newBudget - New budget amount
 * @returns {Promise<Object>} - Transaction receipt
 */
async function updateProjectBudget(projectId, newBudget) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping updateProjectBudget');
    return null;
  }
  
  try {
    const blockchainProjectId = generateBytes32Hash(projectId.toString());
    
    logger.info(`Updating project budget on blockchain for project ID: ${blockchainProjectId}`);
    
    const tx = await contract.updateProjectBudget(
      blockchainProjectId,
      ethers.parseEther(newBudget.toString())
    );
    
    return await tx.wait();
  } catch (error) {
    logger.error('Error updating project budget on blockchain:', error);
    throw error;
  }
}

/**
 * Get project details from the blockchain
 * @param {string} projectId - MongoDB project ID
 * @returns {Promise<Object>} - Project details
 */
async function getProjectFromBlockchain(projectId) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping getProjectFromBlockchain');
    return null;
  }
  
  try {
    const blockchainProjectId = generateBytes32Hash(projectId.toString());
    
    logger.info(`Getting project from blockchain with ID: ${blockchainProjectId}`);
    
    const projectData = await contract.getProject(blockchainProjectId);
    
    return {
      id: projectData[0],
      name: projectData[1],
      budget: ethers.formatEther(projectData[2]),
      spent: ethers.formatEther(projectData[3]),
      createdAt: new Date(projectData[4] * 1000).toISOString(),
      createdBy: projectData[5],
      isActive: projectData[6]
    };
  } catch (error) {
    logger.error('Error getting project from blockchain:', error);
    return null;
  }
}

/**
 * Get expenditure details from the blockchain
 * @param {string} expenditureId - MongoDB expenditure ID
 * @returns {Promise<Object>} - Expenditure details
 */
async function getExpenditureFromBlockchain(expenditureId) {
  if (!BLOCKCHAIN_ENABLED || !contract) {
    logger.info('Blockchain is disabled or not initialized, skipping getExpenditureFromBlockchain');
    return null;
  }
  
  try {
    const blockchainExpenditureId = generateBytes32Hash(expenditureId.toString());
    
    logger.info(`Getting expenditure from blockchain with ID: ${blockchainExpenditureId}`);
    
    const expenditureData = await contract.getExpenditure(blockchainExpenditureId);
    
    return {
      id: expenditureData[0],
      projectId: expenditureData[1],
      amount: ethers.formatEther(expenditureData[2]),
      category: expenditureData[3],
      description: expenditureData[4],
      date: new Date(expenditureData[5] * 1000).toISOString(),
      approvedBy: expenditureData[6],
      proofHash: expenditureData[7],
      createdAt: new Date(expenditureData[8] * 1000).toISOString(),
      verified: expenditureData[9]
    };
  } catch (error) {
    logger.error('Error getting expenditure from blockchain:', error);
    return null;
  }
}

module.exports = {
  initBlockchain,
  createProject,
  addExpenditure,
  verifyExpenditure,
  submitComplaint,
  resolveComplaint,
  addOfficial,
  updateProjectBudget,
  getProjectFromBlockchain,
  getExpenditureFromBlockchain,
  generateBytes32Hash
}; 