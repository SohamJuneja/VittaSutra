// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  console.log("Deploying ProjectFunding contract...");

  // Get the contract factory
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  
  // Deploy the contract
  const projectFunding = await ProjectFunding.deploy();
  
  // Wait for deployment to finish
  await projectFunding.waitForDeployment();

  // Get the contract address
  const projectFundingAddress = await projectFunding.getAddress();
  
  console.log(`ProjectFunding deployed to: ${projectFundingAddress}`);
  console.log("Use this address to connect to the contract from your frontend.");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 