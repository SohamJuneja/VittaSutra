// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectFunding
 * @dev Contract for managing government project funding and transactions
 */
contract ProjectFunding is Ownable {
    // Enum for project status
    enum ProjectStatus { 
        Draft,      // Initial state
        Approved,   // Project approved by officials
        Active,     // Project is currently active
        OnHold,     // Project temporarily paused
        Completed,  // Project completed successfully
        Cancelled   // Project cancelled
    }
    
    // Enum for transaction types
    enum TransactionType { 
        Allocation, // Funds allocated to the project
        Expense,    // Expense recorded for the project
        Return      // Funds returned from the project
    }
    
    // Project structure
    struct Project {
        uint256 id;
        string name;
        string description;
        string department;
        uint256 totalBudget;
        uint256 allocatedAmount;
        uint256 spentAmount;
        address manager;
        ProjectStatus status;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
    }
    
    // Transaction structure
    struct Transaction {
        uint256 id;
        uint256 projectId;
        string description;
        uint256 amount;
        TransactionType transactionType;
        address executor;
        uint256 timestamp;
    }
    
    // Project and transaction storage
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => uint256[]) public projectTransactions;
    mapping(address => bool) public authorizedOfficials;
    
    // Counters
    uint256 private projectCounter;
    uint256 private transactionCounter;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, string name, address manager);
    event ProjectUpdated(uint256 indexed projectId, ProjectStatus status);
    event FundsAllocated(uint256 indexed projectId, uint256 transactionId, uint256 amount);
    event FundsSpent(uint256 indexed projectId, uint256 transactionId, uint256 amount, string description);
    event FundsReturned(uint256 indexed projectId, uint256 transactionId, uint256 amount);
    
    // Constructor
    constructor() Ownable(msg.sender) {
        // Initialize counters
        projectCounter = 0;
        transactionCounter = 0;
    }
    
    // Modifier to allow only authorized officials and owner
    modifier onlyAuthorized() {
        require(owner() == msg.sender || authorizedOfficials[msg.sender], "Not authorized");
        _;
    }
    
    // Modifier to allow only the project manager or authorized officials
    modifier onlyManagerOrAuthorized(uint256 projectId) {
        require(
            projects[projectId].manager == msg.sender || 
            owner() == msg.sender || 
            authorizedOfficials[msg.sender], 
            "Only project manager or authorized officials can perform this action"
        );
        _;
    }
    
    /**
     * @dev Authorize an official to perform administrative actions
     * @param official Address of the official to authorize
     */
    function authorizeOfficial(address official) external onlyOwner {
        authorizedOfficials[official] = true;
    }
    
    /**
     * @dev Remove authorization from an official
     * @param official Address of the official to remove
     */
    function removeOfficial(address official) external onlyOwner {
        authorizedOfficials[official] = false;
    }
    
    /**
     * @dev Create a new project
     * @param name Project name
     * @param description Project description
     * @param department Government department
     * @param totalBudget Total budget allocated for the project
     * @param manager Address of the project manager
     * @param startDate Project start date (timestamp)
     * @param endDate Project end date (timestamp)
     * @return New project ID
     */
    function createProject(
        string memory name,
        string memory description,
        string memory department,
        uint256 totalBudget,
        address manager,
        uint256 startDate,
        uint256 endDate
    ) external onlyAuthorized returns (uint256) {
        require(totalBudget > 0, "Budget must be greater than 0");
        require(startDate < endDate, "Start date must be before end date");
        require(manager != address(0), "Invalid manager address");
        
        projectCounter++;
        uint256 projectId = projectCounter;
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            description: description,
            department: department,
            totalBudget: totalBudget,
            allocatedAmount: 0,
            spentAmount: 0,
            manager: manager,
            status: ProjectStatus.Draft,
            startDate: startDate,
            endDate: endDate,
            isActive: true
        });
        
        emit ProjectCreated(projectId, name, manager);
        return projectId;
    }
    
    /**
     * @dev Update project status
     * @param projectId ID of the project
     * @param status New project status
     */
    function updateProjectStatus(uint256 projectId, ProjectStatus status) external onlyAuthorized {
        require(projects[projectId].id != 0, "Project does not exist");
        projects[projectId].status = status;
        emit ProjectUpdated(projectId, status);
    }
    
    /**
     * @dev Allocate funds to a project
     * @param projectId ID of the project
     * @param amount Amount to allocate
     * @param description Description of the allocation
     * @return Transaction ID
     */
    function allocateFunds(
        uint256 projectId, 
        uint256 amount, 
        string memory description
    ) external onlyAuthorized returns (uint256) {
        require(projects[projectId].id != 0, "Project does not exist");
        require(amount > 0, "Amount must be greater than 0");
        
        // Update project allocated amount
        projects[projectId].allocatedAmount += amount;
        
        // Create transaction record
        transactionCounter++;
        uint256 transactionId = transactionCounter;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            projectId: projectId,
            description: description,
            amount: amount,
            transactionType: TransactionType.Allocation,
            executor: msg.sender,
            timestamp: block.timestamp
        });
        
        // Link transaction to project
        projectTransactions[projectId].push(transactionId);
        
        emit FundsAllocated(projectId, transactionId, amount);
        return transactionId;
    }
    
    /**
     * @dev Record an expense for a project
     * @param projectId ID of the project
     * @param amount Amount spent
     * @param description Description of the expense
     * @return Transaction ID
     */
    function recordExpense(
        uint256 projectId, 
        uint256 amount, 
        string memory description
    ) external onlyManagerOrAuthorized(projectId) returns (uint256) {
        require(projects[projectId].id != 0, "Project does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(
            projects[projectId].allocatedAmount - projects[projectId].spentAmount >= amount,
            "Insufficient allocated funds"
        );
        
        // Update project spent amount
        projects[projectId].spentAmount += amount;
        
        // Create transaction record
        transactionCounter++;
        uint256 transactionId = transactionCounter;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            projectId: projectId,
            description: description,
            amount: amount,
            transactionType: TransactionType.Expense,
            executor: msg.sender,
            timestamp: block.timestamp
        });
        
        // Link transaction to project
        projectTransactions[projectId].push(transactionId);
        
        emit FundsSpent(projectId, transactionId, amount, description);
        return transactionId;
    }
    
    /**
     * @dev Return unused funds from a project
     * @param projectId ID of the project
     * @param amount Amount to return
     * @param description Description of the return
     * @return Transaction ID
     */
    function returnFunds(
        uint256 projectId, 
        uint256 amount, 
        string memory description
    ) external onlyManagerOrAuthorized(projectId) returns (uint256) {
        require(projects[projectId].id != 0, "Project does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(
            projects[projectId].allocatedAmount - projects[projectId].spentAmount >= amount, 
            "Amount exceeds available funds"
        );
        
        // Update project allocated amount
        projects[projectId].allocatedAmount -= amount;
        
        // Create transaction record
        transactionCounter++;
        uint256 transactionId = transactionCounter;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            projectId: projectId,
            description: description,
            amount: amount,
            transactionType: TransactionType.Return,
            executor: msg.sender,
            timestamp: block.timestamp
        });
        
        // Link transaction to project
        projectTransactions[projectId].push(transactionId);
        
        emit FundsReturned(projectId, transactionId, amount);
        return transactionId;
    }
    
    /**
     * @dev Get project details
     * @param projectId ID of the project
     * @return name Project name
     * @return description Project description
     * @return department Project department
     * @return totalBudget Total project budget
     * @return allocatedAmount Amount allocated to project
     * @return spentAmount Amount spent on project
     * @return manager Project manager address
     * @return status Project status
     * @return startDate Project start date
     * @return endDate Project end date
     */
    function getProject(uint256 projectId) external view returns (
        string memory name,
        string memory description,
        string memory department,
        uint256 totalBudget,
        uint256 allocatedAmount,
        uint256 spentAmount,
        address manager,
        ProjectStatus status,
        uint256 startDate,
        uint256 endDate
    ) {
        require(projects[projectId].id != 0, "Project does not exist");
        Project storage project = projects[projectId];
        
        return (
            project.name,
            project.description,
            project.department,
            project.totalBudget,
            project.allocatedAmount,
            project.spentAmount,
            project.manager,
            project.status,
            project.startDate,
            project.endDate
        );
    }
    
    /**
     * @dev Get transaction details
     * @param transactionId ID of the transaction
     * @return projectId Project ID for this transaction
     * @return description Transaction description
     * @return amount Transaction amount
     * @return transactionType Type of transaction
     * @return executor Address that executed the transaction
     * @return timestamp Transaction timestamp
     */
    function getTransaction(uint256 transactionId) external view returns (
        uint256 projectId,
        string memory description,
        uint256 amount,
        TransactionType transactionType,
        address executor,
        uint256 timestamp
    ) {
        require(transactions[transactionId].id != 0, "Transaction does not exist");
        Transaction storage txn = transactions[transactionId];
        
        return (
            txn.projectId,
            txn.description,
            txn.amount,
            txn.transactionType,
            txn.executor,
            txn.timestamp
        );
    }
    
    /**
     * @dev Get all transactions for a project
     * @param projectId ID of the project
     * @return Array of transaction IDs
     */
    function getProjectTransactions(uint256 projectId) external view returns (uint256[] memory) {
        require(projects[projectId].id != 0, "Project does not exist");
        return projectTransactions[projectId];
    }
} 