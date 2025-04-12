// MetaMask connector for the frontend
// This file can be used in your frontend to connect to the blockchain via MetaMask

// Contract ABI - This will be generated after compilation
// You'll need to replace this with the actual ABI from your compiled contract
const ProjectFundingABI = []; // Replace with actual ABI after compilation

// Default contract address (replace with your deployed address)
const defaultContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

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
              status: ["Not Started", "In Progress", "Completed", "Cancelled"][projectDetails[7]],
              startDate: new Date(projectDetails[8] * 1000),
              endDate: new Date(projectDetails[9] * 1000)
            });
          }
        } catch (error) {
          // If project doesn't exist, stop the loop
          break;
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

      const result = await this.contract.methods.createProject(
        name,
        description,
        department,
        totalBudgetWei,
        manager || this.userAccount,
        startTimestamp,
        endTimestamp
      ).send({ from: this.userAccount });

      return result;
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
      
      const result = await this.contract.methods.allocateFunds(
        projectId,
        amountWei,
        description
      ).send({ from: this.userAccount });

      return result;
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
      const amountWei = this.web3.utils.toWei(amount.toString(), 'ether');
      
      const result = await this.contract.methods.recordExpense(
        projectId,
        amountWei,
        description
      ).send({ from: this.userAccount });

      return result;
    } catch (error) {
      console.error("Error recording expense:", error);
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
      }

      return transactions;
    } catch (error) {
      console.error("Error fetching project transactions:", error);
      throw error;
    }
  }
}

// Export connector for use in frontend
if (typeof window !== 'undefined') {
  window.BlockchainConnector = BlockchainConnector;
}

// Example usage in HTML:
/*
<!DOCTYPE html>
<html>
<head>
  <title>VittaSutra Blockchain Interface</title>
  <script src="https://cdn.jsdelivr.net/npm/web3@1.8.2/dist/web3.min.js"></script>
  <script src="./metamaskConnector.js"></script>
</head>
<body>
  <h1>VittaSutra Blockchain Demo</h1>
  
  <button id="connectButton">Connect to MetaMask</button>
  <div id="accountInfo" style="display:none;">
    <p>Connected Account: <span id="accountAddress"></span></p>
  </div>

  <div id="projectForm" style="display:none; margin-top: 20px;">
    <h2>Create New Project</h2>
    <form id="createProjectForm">
      <div>
        <label for="projectName">Project Name:</label>
        <input type="text" id="projectName" required>
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea id="description" required></textarea>
      </div>
      <div>
        <label for="department">Department:</label>
        <input type="text" id="department" required>
      </div>
      <div>
        <label for="budget">Total Budget (ETH):</label>
        <input type="number" id="budget" required min="0" step="0.01">
      </div>
      <div>
        <label for="startDate">Start Date:</label>
        <input type="date" id="startDate" required>
      </div>
      <div>
        <label for="endDate">End Date:</label>
        <input type="date" id="endDate" required>
      </div>
      <button type="submit">Create Project</button>
    </form>
  </div>

  <div id="projectsList" style="margin-top: 20px;">
    <h2>Projects</h2>
    <ul id="projects"></ul>
  </div>

  <script>
    let connector;

    document.addEventListener('DOMContentLoaded', function() {
      connector = new BlockchainConnector();
      
      // Initialize UI elements
      const connectButton = document.getElementById('connectButton');
      const accountInfo = document.getElementById('accountInfo');
      const accountAddress = document.getElementById('accountAddress');
      const projectForm = document.getElementById('projectForm');
      const createProjectForm = document.getElementById('createProjectForm');
      const projectsList = document.getElementById('projects');

      // Connect button handler
      connectButton.addEventListener('click', async function() {
        try {
          const connection = await connector.connectToMetaMask();
          accountAddress.textContent = connection.account;
          accountInfo.style.display = 'block';
          projectForm.style.display = 'block';
          
          // Initialize contract
          connector.initializeContract();
          
          // Load projects
          loadProjects();
        } catch (error) {
          alert('Error connecting to MetaMask: ' + error.message);
        }
      });

      // Create project form handler
      createProjectForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        try {
          const name = document.getElementById('projectName').value;
          const description = document.getElementById('description').value;
          const department = document.getElementById('department').value;
          const budget = document.getElementById('budget').value;
          const startDate = new Date(document.getElementById('startDate').value);
          const endDate = new Date(document.getElementById('endDate').value);

          await connector.createProject(name, description, department, budget, null, startDate, endDate);
          alert('Project created successfully!');
          
          // Reset form and reload projects
          createProjectForm.reset();
          loadProjects();
        } catch (error) {
          alert('Error creating project: ' + error.message);
        }
      });

      // Function to load projects
      async function loadProjects() {
        try {
          const projects = await connector.getProjects();
          projectsList.innerHTML = '';
          
          if (projects.length === 0) {
            projectsList.innerHTML = '<li>No projects found</li>';
            return;
          }
          
          projects.forEach(project => {
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>${project.name}</strong> (${project.status}) - 
              Budget: ${project.totalBudget} ETH, 
              Allocated: ${project.allocatedAmount} ETH, 
              Spent: ${project.spentAmount} ETH
            `;
            projectsList.appendChild(li);
          });
        } catch (error) {
          console.error('Error loading projects:', error);
          projectsList.innerHTML = '<li>Error loading projects</li>';
        }
      }
    });
  </script>
</body>
</html>
*/ 