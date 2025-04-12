// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectExpenditure {
    // Struct to store expenditure details
    struct Expenditure {
        uint256 projectId;
        uint256 amount;
        string category;
        string description;
        uint256 date;
        address recordedBy;
        bool isVerified;
    }

    // Mapping to store expenditures by project ID
    mapping(uint256 => Expenditure[]) public projectExpenditures;
    
    // Mapping to track official users
    mapping(address => bool) public isOfficial;
    
    // Owner of the contract
    address public owner;
    
    // Events
    event ExpenditureRecorded(
        uint256 indexed projectId,
        uint256 indexed expenditureId,
        uint256 amount,
        string category,
        string description,
        address recordedBy
    );
    
    event ExpenditureVerified(
        uint256 indexed projectId,
        uint256 indexed expenditureId,
        address verifiedBy
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOfficial() {
        require(isOfficial[msg.sender], "Only official users can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        isOfficial[msg.sender] = true;
    }
    
    // Function to add an official user
    function addOfficial(address _official) external onlyOwner {
        isOfficial[_official] = true;
    }
    
    // Function to remove an official user
    function removeOfficial(address _official) external onlyOwner {
        isOfficial[_official] = false;
    }
    
    // Function to record a new expenditure
    function recordExpenditure(
        uint256 _projectId,
        uint256 _amount,
        string memory _category,
        string memory _description
    ) external onlyOfficial {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        Expenditure memory newExpenditure = Expenditure({
            projectId: _projectId,
            amount: _amount,
            category: _category,
            description: _description,
            date: block.timestamp,
            recordedBy: msg.sender,
            isVerified: false
        });
        
        projectExpenditures[_projectId].push(newExpenditure);
        
        emit ExpenditureRecorded(
            _projectId,
            projectExpenditures[_projectId].length - 1,
            _amount,
            _category,
            _description,
            msg.sender
        );
    }
    
    // Function to verify an expenditure
    function verifyExpenditure(uint256 _projectId, uint256 _expenditureId) external onlyOfficial {
        require(_expenditureId < projectExpenditures[_projectId].length, "Expenditure does not exist");
        require(!projectExpenditures[_projectId][_expenditureId].isVerified, "Expenditure already verified");
        
        projectExpenditures[_projectId][_expenditureId].isVerified = true;
        
        emit ExpenditureVerified(_projectId, _expenditureId, msg.sender);
    }
    
    // Function to get all expenditures for a project
    function getProjectExpenditures(uint256 _projectId) external view returns (Expenditure[] memory) {
        return projectExpenditures[_projectId];
    }
    
    // Function to get a specific expenditure
    function getExpenditure(uint256 _projectId, uint256 _expenditureId) external view returns (Expenditure memory) {
        require(_expenditureId < projectExpenditures[_projectId].length, "Expenditure does not exist");
        return projectExpenditures[_projectId][_expenditureId];
    }
    
    // Function to get the total number of expenditures for a project
    function getExpenditureCount(uint256 _projectId) external view returns (uint256) {
        return projectExpenditures[_projectId].length;
    }
} 