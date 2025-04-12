const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../../config');


const BLOCKCHAIN_ENABLED = config.blockchain.enabled;
const BLOCKCHAIN_PROVIDER = config.blockchain.provider;
const CONTRACT_ADDRESS = config.blockchain.contractAddress;
const OWNER_PRIVATE_KEY = config.blockchain.ownerPrivateKey;


const contractAbiPath = path.join(__dirname, 'abi/ExpenditureTracker.json');
let contractAbi;

try {
  contractAbi = JSON.parse(fs.readFileSync(contractAbiPath, 'utf8'));
} catch (error) {
  logger.error(`Failed to load contract ABI: ${error.message}`);
  contractAbi = [];
}


class BlockchainClient {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize the blockchain client
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    if (!BLOCKCHAIN_ENABLED) {
      logger.info('Blockchain integration is disabled');
      return false;
    }

    try {
     
      logger.info(`Connecting to blockchain provider at ${BLOCKCHAIN_PROVIDER}`);
      this.provider = new ethers.JsonRpcProvider(BLOCKCHAIN_PROVIDER);
      
     
      const blockNumber = await this.provider.getBlockNumber();
      logger.info(`Connected to blockchain. Current block number: ${blockNumber}`);
      
    
      if (!CONTRACT_ADDRESS) {
        logger.error('CONTRACT_ADDRESS is not configured');
        return false;
      }
      
      if (!OWNER_PRIVATE_KEY) {
        logger.error('OWNER_PRIVATE_KEY is not configured');
        return false;
      }
      
    
      this.wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, this.provider);
      logger.info(`Using wallet address: ${this.wallet.address}`);
      
    
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractAbi,
        this.wallet
      );
      
      logger.info(`Connected to contract at address: ${CONTRACT_ADDRESS}`);
      
     
      const contractOwner = await this.contract.owner();
      logger.info(`Contract owner: ${contractOwner}`);
      
      this.initialized = true;
      return true;
    } catch (error) {
      logger.error(`Blockchain initialization error: ${error.message}`);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Get the contract instance
   * @returns {ethers.Contract|null} - The contract instance or null if not initialized
   */
  getContract() {
    if (!this.initialized) {
      logger.warn('Attempted to access contract before initialization');
      return null;
    }
    return this.contract;
  }

  /**
   * Get the wallet instance
   * @returns {ethers.Wallet|null} - The wallet instance or null if not initialized
   */
  getWallet() {
    if (!this.initialized) {
      logger.warn('Attempted to access wallet before initialization');
      return null;
    }
    return this.wallet;
  }

  /**
   * Get the provider instance
   * @returns {ethers.Provider|null} - The provider instance or null if not initialized
   */
  getProvider() {
    if (!this.initialized) {
      logger.warn('Attempted to access provider before initialization');
      return null;
    }
    return this.provider;
  }

  /**
   * Get transaction receipt
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object|null>} - Transaction receipt or null
   */
  async getTransactionReceipt(txHash) {
    if (!this.initialized) {
      logger.warn('Attempted to get transaction receipt before initialization');
      return null;
    }
    
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      logger.error(`Error getting transaction receipt: ${error.message}`);
      return null;
    }
  }

  /**
   * Get transaction by hash
   * @param {string} txHash - Transaction hash
   * @returns {Promise<object|null>} - Transaction or null
   */
  async getTransaction(txHash) {
    if (!this.initialized) {
      logger.warn('Attempted to get transaction before initialization');
      return null;
    }
    
    try {
      return await this.provider.getTransaction(txHash);
    } catch (error) {
      logger.error(`Error getting transaction: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if blockchain integration is enabled
   * @returns {boolean} - Whether blockchain integration is enabled
   */
  isEnabled() {
    return BLOCKCHAIN_ENABLED;
  }

  /**
   * Check if client is initialized
   * @returns {boolean} - Whether client is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Format ether value from wei
   * @param {string|BigNumber} wei - Wei value
   * @returns {string} - Ether value
   */
  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  /**
   * Parse ether value to wei
   * @param {string} ether - Ether value
   * @returns {BigNumber} - Wei value
   */
  parseEther(ether) {
    return ethers.parseEther(ether);
  }
}


const client = new BlockchainClient();

module.exports = client; 