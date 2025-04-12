// Script to create sample projects in the ProjectFunding contract
const hre = require("hardhat");

async function main() {
  console.log("Creating sample projects...");

  // Get the deployed contract
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your actual deployed contract address if different
  const projectFunding = ProjectFunding.attach(contractAddress);
  
  // Get test accounts
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
  
  // Current timestamp
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsLater = now + (180 * 24 * 60 * 60); // 180 days later
  
  // Create sample projects
  console.log("Creating Smart City Project...");
  const project1 = await projectFunding.createProject(
    "स्मार्ट सिटी परियोजना / Smart City Project",
    "यह परियोजना नागरिकों के लिए डिजिटल सेवाओं के विकास और कार्यान्वयन पर केंद्रित है",
    "शहरी विकास विभाग / Urban Development",
    hre.ethers.parseEther("50"), // 50 ETH
    addr1.address, // Project manager
    now,
    sixMonthsLater
  );
  
  console.log("Creating Digital Healthcare System...");
  const project2 = await projectFunding.createProject(
    "डिजिटल स्वास्थ्य प्रणाली / Digital Healthcare System",
    "राज्य में स्वास्थ्य सेवाओं को डिजिटल बनाने की परियोजना",
    "स्वास्थ्य विभाग / Health Department",
    hre.ethers.parseEther("30"), // 30 ETH
    addr2.address, // Project manager
    now,
    sixMonthsLater
  );
  
  console.log("Creating Rural Education Program...");
  const project3 = await projectFunding.createProject(
    "ग्रामीण शिक्षा कार्यक्रम / Rural Education Program",
    "ग्रामीण क्षेत्रों में शिक्षा की गुणवत्ता में सुधार के लिए कार्यक्रम",
    "शिक्षा विभाग / Education Department",
    hre.ethers.parseEther("20"), // 20 ETH
    addr1.address, // Project manager
    now,
    sixMonthsLater
  );
  
  console.log("Allocating funds to projects...");
  // Allocate funds to projects
  await projectFunding.allocateFunds(
    1, // Project ID 1
    hre.ethers.parseEther("20"), // 20 ETH
    "Initial allocation for Smart City Project"
  );
  
  await projectFunding.allocateFunds(
    2, // Project ID 2
    hre.ethers.parseEther("28"), // 28 ETH
    "Initial allocation for Digital Healthcare System"
  );
  
  await projectFunding.allocateFunds(
    3, // Project ID 3
    hre.ethers.parseEther("5"), // 5 ETH
    "Initial allocation for Rural Education Program"
  );
  
  // Update project status
  await projectFunding.updateProjectStatus(1, 2); // Status 2 = Active
  await projectFunding.updateProjectStatus(2, 4); // Status 4 = Completed
  await projectFunding.updateProjectStatus(3, 0); // Status 0 = Draft
  
  console.log("Done! Sample projects have been created and funded.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 