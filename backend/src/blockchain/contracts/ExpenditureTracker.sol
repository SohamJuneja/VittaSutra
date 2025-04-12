// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ExpenditureTracker
 * @dev Smart contract for tracking government project expenditures
 * with transparency and accountability
 */
contract ExpenditureTracker {
    // Role definitions
    uint8 private constant ROLE_NONE = 0;
    uint8 private constant ROLE_OFFICIAL = 1;
    uint8 private constant ROLE_ADMIN = 2;
    
   
    struct Project {
        bytes32 id;
        bytes32 name;
        uint256 budget;
        uint256 spent;
        uint256 createdAt;
        address createdBy;
        bool isActive;
        bytes32[] expenditureIds;
        bytes32[] complaintIds;
    }
    
    struct Expenditure {
        bytes32 id;
        bytes32 projectId;
        uint256 amount;
        bytes32 category;
        bytes32 description;
        uint256 date;
        address approvedBy;
        bytes32 proofHash;
        uint256 createdAt;
        bool verified;
    }
    
    struct Complaint {
        bytes32 id;
        bytes32 projectId;
        bytes32 title;
        bytes32 description;
        bytes32 proofHash;
        uint256 createdAt;
        bool resolved;
        bytes32 responseHash;
    }
    
   
    address public owner;
    mapping(address => uint8) public roles;
    mapping(bytes32 => Project) private projects;
    mapping(bytes32 => Expenditure) private expenditures;
    mapping(bytes32 => Complaint) private complaints;
    bytes32[] private projectIds;
    
    event ProjectCreated(
        bytes32 indexed id,
        bytes32 name,
        uint256 budget,
        address createdBy
    );
    
    event ExpenditureAdded(
        bytes32 indexed id,
        bytes32 indexed projectId,
        uint256 amount,
        address approvedBy
    );
    
    event ExpenditureVerified(
        bytes32 indexed id,
        bytes32 indexed projectId,
        address verifiedBy
    );
    
    event OfficialAdded(address indexed officialAddress);
    event OfficialRemoved(address indexed officialAddress);
    
    event ComplaintSubmitted(
        bytes32 indexed id,
        bytes32 indexed projectId,
        bytes32 title
    );
    
    event ComplaintResolved(
        bytes32 indexed id,
        bytes32 responseHash
    );
    
   
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    modifier onlyOfficial() {
        require(
            roles[msg.sender] == ROLE_OFFICIAL || roles[msg.sender] == ROLE_ADMIN || msg.sender == owner,
            "Only government officials can call this function"
        );
        _;
    }
    
    modifier onlyAdmin() {
        require(
            roles[msg.sender] == ROLE_ADMIN || msg.sender == owner,
            "Only administrators can call this function"
        );
        _;
    }
    
  
    constructor() {
        owner = msg.sender;
    }
    
   
    function addOfficial(address officialAddress, bool isAdmin) public onlyAdmin {
        roles[officialAddress] = isAdmin ? ROLE_ADMIN : ROLE_OFFICIAL;
        emit OfficialAdded(officialAddress);
    }
    
    function removeOfficial(address officialAddress) public onlyAdmin {
        require(officialAddress != owner, "Cannot remove the owner");
        roles[officialAddress] = ROLE_NONE;
        emit OfficialRemoved(officialAddress);
    }
    
    
    function createProject(
        bytes32 id,
        bytes32 name,
        uint256 budget
    ) public onlyOfficial {
        require(projects[id].createdAt == 0, "Project with this ID already exists");
        require(budget > 0, "Budget must be greater than zero");
        
        Project storage project = projects[id];
        project.id = id;
        project.name = name;
        project.budget = budget;
        project.spent = 0;
        project.createdAt = block.timestamp;
        project.createdBy = msg.sender;
        project.isActive = true;
        
        projectIds.push(id);
        
        emit ProjectCreated(id, name, budget, msg.sender);
    }
    
    function updateProjectBudget(bytes32 projectId, uint256 newBudget) public onlyOfficial {
        require(projects[projectId].createdAt > 0, "Project does not exist");
        require(newBudget > 0, "Budget must be greater than zero");
        
        projects[projectId].budget = newBudget;
    }
    
   
    function addExpenditure(
        bytes32 id,
        bytes32 projectId,
        uint256 amount,
        bytes32 category,
        bytes32 description,
        uint256 date,
        bytes32 proofHash
    ) public onlyOfficial {
        require(projects[projectId].createdAt > 0, "Project does not exist");
        require(expenditures[id].createdAt == 0, "Expenditure with this ID already exists");
        require(amount > 0, "Amount must be greater than zero");
        
        Expenditure storage expenditure = expenditures[id];
        expenditure.id = id;
        expenditure.projectId = projectId;
        expenditure.amount = amount;
        expenditure.category = category;
        expenditure.description = description;
        expenditure.date = date;
        expenditure.approvedBy = msg.sender;
        expenditure.proofHash = proofHash;
        expenditure.createdAt = block.timestamp;
        expenditure.verified = false;
        
        projects[projectId].expenditureIds.push(id);
        projects[projectId].spent += amount;
        
        emit ExpenditureAdded(id, projectId, amount, msg.sender);
    }
    
    function verifyExpenditure(bytes32 expenditureId) public onlyAdmin {
        require(expenditures[expenditureId].createdAt > 0, "Expenditure does not exist");
        require(!expenditures[expenditureId].verified, "Expenditure already verified");
        
        expenditures[expenditureId].verified = true;
        
        emit ExpenditureVerified(
            expenditureId,
            expenditures[expenditureId].projectId,
            msg.sender
        );
    }
    
  
    function submitComplaint(
        bytes32 id,
        bytes32 projectId,
        bytes32 title,
        bytes32 description,
        bytes32 proofHash
    ) public {
        require(projects[projectId].createdAt > 0, "Project does not exist");
        require(complaints[id].createdAt == 0, "Complaint with this ID already exists");
        
        Complaint storage complaint = complaints[id];
        complaint.id = id;
        complaint.projectId = projectId;
        complaint.title = title;
        complaint.description = description;
        complaint.proofHash = proofHash;
        complaint.createdAt = block.timestamp;
        complaint.resolved = false;
        
        projects[projectId].complaintIds.push(id);
        
        emit ComplaintSubmitted(id, projectId, title);
    }
    
    function resolveComplaint(bytes32 complaintId, bytes32 responseHash) public onlyOfficial {
        require(complaints[complaintId].createdAt > 0, "Complaint does not exist");
        require(!complaints[complaintId].resolved, "Complaint already resolved");
        
        complaints[complaintId].resolved = true;
        complaints[complaintId].responseHash = responseHash;
        
        emit ComplaintResolved(complaintId, responseHash);
    }
    
    function getProject(bytes32 projectId) public view returns (
        bytes32 id,
        bytes32 name,
        uint256 budget,
        uint256 spent,
        uint256 createdAt,
        address createdBy,
        bool isActive
    ) {
        Project storage project = projects[projectId];
        return (
            project.id,
            project.name,
            project.budget,
            project.spent,
            project.createdAt,
            project.createdBy,
            project.isActive
        );
    }
    
    function getExpenditure(bytes32 expenditureId) public view returns (
        bytes32 id,
        bytes32 projectId,
        uint256 amount,
        bytes32 category,
        bytes32 description,
        uint256 date,
        address approvedBy,
        bytes32 proofHash,
        uint256 createdAt,
        bool verified
    ) {
        Expenditure storage expenditure = expenditures[expenditureId];
        return (
            expenditure.id,
            expenditure.projectId,
            expenditure.amount,
            expenditure.category,
            expenditure.description,
            expenditure.date,
            expenditure.approvedBy,
            expenditure.proofHash,
            expenditure.createdAt,
            expenditure.verified
        );
    }
    
    function getAllProjectIds() public view returns (bytes32[] memory) {
        return projectIds;
    }
    
    function getProjectExpenditureIds(bytes32 projectId) public view returns (bytes32[] memory) {
        require(projects[projectId].createdAt > 0, "Project does not exist");
        return projects[projectId].expenditureIds;
    }
    
    function getProjectComplaintIds(bytes32 projectId) public view returns (bytes32[] memory) {
        require(projects[projectId].createdAt > 0, "Project does not exist");
        return projects[projectId].complaintIds;
    }
} 