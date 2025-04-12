// MetaMask connector for the frontend
// This file can be used in your frontend to connect to the blockchain via MetaMask

// Contract ABI - Generated after compilation
const ProjectFundingABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsAllocated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsReturned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "FundsSpent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "manager",
        "type": "address"
      }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum ProjectFunding.ProjectStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "ProjectUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "allocateFunds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedOfficials",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "official",
        "type": "address"
      }
    ],
    "name": "authorizeOfficial",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "department",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalBudget",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "manager",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "startDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endDate",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "department",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalBudget",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "allocatedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "spentAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "manager",
        "type": "address"
      },
      {
        "internalType": "enum ProjectFunding.ProjectStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "startDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endDate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      }
    ],
    "name": "getProjectTransactions",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "transactionId",
        "type": "uint256"
      }
    ],
    "name": "getTransaction",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "enum ProjectFunding.TransactionType",
        "name": "transactionType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "executor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projectTransactions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "projects",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "department",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalBudget",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "allocatedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "spentAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "manager",
        "type": "address"
      },
      {
        "internalType": "enum ProjectFunding.ProjectStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "startDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endDate",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "recordExpense",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "official",
        "type": "address"
      }
    ],
    "name": "removeOfficial",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "returnFunds",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "transactions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "enum ProjectFunding.TransactionType",
        "name": "transactionType",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "executor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "projectId",
        "type": "uint256"
      },
      {
        "internalType": "enum ProjectFunding.ProjectStatus",
        "name": "status",
        "type": "uint8"
      }
    ],
    "name": "updateProjectStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Default contract address (replace with your deployed address)
const defaultContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; 

// Helper class for blockchain interactions
class BlockchainConnector {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.contractAddress = null;
    this.userAccount = null;
    this.isConnected = false;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask
  async connectToMetaMask() {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to use this application.");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.userAccount = accounts[0];

      // Get Web3 instance
      this.web3 = new Web3(window.ethereum);
      
      // Get the network ID
      const networkId = await this.web3.eth.net.getId();
      
      // Configure UI based on network
      if (networkId === 1) {
        console.log("Connected to Ethereum Mainnet");
      } else if (networkId === 1337 || networkId === 31337) {
        console.log("Connected to local Hardhat/Ganache network");
      } else {
        console.log(`Connected to network ID: ${networkId}`);
      }

      // Set up event listeners for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        this.userAccount = accounts[0];
        console.log(`Account changed to: ${this.userAccount}`);
        // You might want to reload the UI here
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        console.log(`Chain changed to: ${chainId}`);
        // MetaMask recommends reloading the page
        window.location.reload();
      });

      this.isConnected = true;
      return {
        account: this.userAccount,
        networkId
      };
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      throw error;
    }
  }

  // Initialize contract with address
  initializeContract(contractAddress = defaultContractAddress) {
    if (!this.web3) {
      throw new Error("Web3 not initialized. Connect to MetaMask first.");
    }

    this.contractAddress = contractAddress;
    this.contract = new this.web3.eth.Contract(
      ProjectFundingABI,
      this.contractAddress
    );

    return this.contract;
  }

  // Get all projects (this would need to be enhanced with events or indexing in a real app)
  async getProjects(maxCount = 10) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    const projects = [];
    try {
      // Start from 1 as project IDs are 1-based
      for (let i = 1; i <= maxCount; i++) {
        try {
          const projectDetails = await this.contract.methods.getProject(i).call();
          if (projectDetails[0] !== "") { // Check if name is not empty
            projects.push({
              id: i,
              name: projectDetails[0],
              description: projectDetails[1],
              department: projectDetails[2],
              totalBudget: this.web3.utils.fromWei(projectDetails[3], 'ether'),
              allocatedAmount: this.web3.utils.fromWei(projectDetails[4], 'ether'),
              spentAmount: this.web3.utils.fromWei(projectDetails[5], 'ether'),
              manager: projectDetails[6],
              status: ["Draft", "Approved", "Active", "OnHold", "Completed", "Cancelled"][projectDetails[7]],
              startDate: new Date(projectDetails[8] * 1000),
              endDate: new Date(projectDetails[9] * 1000)
            });
          }
        } catch (error) {
          // If project doesn't exist, stop the loop
          if (error.message.includes("Project does not exist") || i > 1) {
            break;
          } else {
            console.error(`Error fetching project ${i}:`, error);
          }
        }
      }
      return projects;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  // Create a new project
  async createProject(name, description, department, totalBudget, manager, startDate, endDate) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const totalBudgetWei = this.web3.utils.toWei(totalBudget.toString(), 'ether');
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      // If manager is not provided, use the current user
      const projectManager = manager || this.userAccount;

      console.log(`Creating project with params:`, {
        name, description, department, totalBudget: totalBudgetWei, 
        manager: projectManager, startDate: startTimestamp, endDate: endTimestamp
      });

      const result = await this.contract.methods.createProject(
        name,
        description,
        department,
        totalBudgetWei,
        projectManager,
        startTimestamp,
        endTimestamp
      ).send({ from: this.userAccount });

      // Get the project ID from the event
      let projectId = 0;
      if (result.events && result.events.ProjectCreated) {
        projectId = result.events.ProjectCreated.returnValues.projectId;
      }

      console.log(`Project created with ID: ${projectId}`);
      return { ...result, projectId };
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  // Allocate funds to a project
  async allocateFunds(projectId, amount, description) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      console.log(`Allocating ${amount} ETH to project ${projectId}: "${description}"`);

      const result = await this.contract.methods.allocateFunds(
        projectId,
        amountWei,
        description
      ).send({ from: this.userAccount });

      // Get the transaction ID from the event
      let transactionId = 0;
      if (result.events && result.events.FundsAllocated) {
        transactionId = result.events.FundsAllocated.returnValues.transactionId;
      }

      console.log(`Funds allocated with transaction ID: ${transactionId}`);
      return { ...result, transactionId };
    } catch (error) {
      console.error("Error allocating funds:", error);
      throw error;
    }
  }

  // Record an expense
  async recordExpense(projectId, amount, description) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      // Convert to string first to handle decimal inputs properly
      const amountStr = amount.toString();
      const amountWei = this.web3.utils.toWei(amountStr, 'ether');
      
      console.log(`Recording expense of ${amount} ETH for project ${projectId}: "${description}"`);
      console.log(`Project ID: ${projectId}, Amount in Wei: ${amountWei}`);

      // Ensure projectId is a number
      const projectIdNum = parseInt(projectId);
      
      const result = await this.contract.methods.recordExpense(
        projectIdNum,
        amountWei,
        description
      ).send({ from: this.userAccount });

      // Get the transaction ID from the event
      let transactionId = 0;
      if (result.events && result.events.FundsSpent) {
        transactionId = result.events.FundsSpent.returnValues.transactionId;
        console.log(`Expense recorded with transaction ID: ${transactionId}`);
      } else {
        console.warn("Transaction successful but FundsSpent event not found", result);
      }

      return { ...result, transactionId };
    } catch (error) {
      console.error("Error recording expense:", error);
      throw error;
    }
  }

  // Return unused funds to the budget
  async returnFunds(projectId, amount, description) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      console.log(`Returning ${amount} ETH from project ${projectId}: "${description}"`);

      const result = await this.contract.methods.returnFunds(
        projectId,
        amountWei,
        description
      ).send({ from: this.userAccount });

      // Get the transaction ID from the event
      let transactionId = 0;
      if (result.events && result.events.FundsReturned) {
        transactionId = result.events.FundsReturned.returnValues.transactionId;
      }

      console.log(`Funds returned with transaction ID: ${transactionId}`);
      return { ...result, transactionId };
    } catch (error) {
      console.error("Error returning funds:", error);
      throw error;
    }
  }

  // Update project status
  async updateProjectStatus(projectId, status) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    // Status mapping: Draft(0), Approved(1), Active(2), OnHold(3), Completed(4), Cancelled(5)
    const statusMap = {
      "Draft": 0,
      "Approved": 1,
      "Active": 2,
      "OnHold": 3,
      "Completed": 4,
      "Cancelled": 5
    };

    // Status can be either a string (status name) or a number (status code)
    const statusCode = typeof status === 'string' ? statusMap[status] : status;

    try {
      console.log(`Updating status of project ${projectId} to ${status} (code: ${statusCode})`);

      const result = await this.contract.methods.updateProjectStatus(
        projectId,
        statusCode
      ).send({ from: this.userAccount });

      console.log(`Project status updated successfully`);
      return result;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  }

  // Get project transactions
  async getProjectTransactions(projectId) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const transactionIds = await this.contract.methods.getProjectTransactions(projectId).call();
      const transactions = [];

      for (const txId of transactionIds) {
        try {
          const txDetails = await this.contract.methods.getTransaction(txId).call();
          transactions.push({
            id: txId,
            projectId: txDetails[0],
            description: txDetails[1],
            amount: this.web3.utils.fromWei(txDetails[2], 'ether'),
            type: ["Allocation", "Expense", "Return"][txDetails[3]],
            executor: txDetails[4],
            timestamp: new Date(txDetails[5] * 1000)
          });
        } catch (error) {
          console.error(`Error fetching transaction ${txId}:`, error);
          // Continue with the next transaction
        }
      }

      return transactions;
    } catch (error) {
      console.error("Error fetching project transactions:", error);
      throw error;
    }
  }

  // Check if the current user is an authorized official
  async isAuthorizedOfficial() {
    if (!this.contract || !this.userAccount) {
      throw new Error("Contract not initialized or user not connected");
    }

    try {
      const isAuthorized = await this.contract.methods.authorizedOfficials(this.userAccount).call();
      return isAuthorized;
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  }

  // Check if the current user is the contract owner
  async isContractOwner() {
    if (!this.contract || !this.userAccount) {
      throw new Error("Contract not initialized or user not connected");
    }

    try {
      const owner = await this.contract.methods.owner().call();
      return owner.toLowerCase() === this.userAccount.toLowerCase();
    } catch (error) {
      console.error("Error checking ownership:", error);
      return false;
    }
  }
}

// Export connector for use in frontend
if (typeof window !== 'undefined') {
  window.BlockchainConnector = BlockchainConnector;
} 