// Script to authorize test accounts in the ProjectFunding contract
const hre = require("hardhat");

async function main() {
  console.log("Authorizing test accounts as officials...");

  // Get the deployed contract
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your actual deployed contract address if different
  const projectFunding = ProjectFunding.attach(contractAddress);
  
  // Get test accounts
  const [owner, addr1, addr2] = await hre.ethers.getSigners();
  
  console.log(`Contract owner: ${owner.address}`);
  console.log(`Authorizing account 1: ${addr1.address}`);
  console.log(`Authorizing account 2: ${addr2.address}`);
  
  // Authorize the accounts
  await projectFunding.authorizeOfficial(addr1.address);
  await projectFunding.authorizeOfficial(addr2.address);
  
  // Also authorize the MetaMask account if you have it
  const metaMaskAccount = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Replace with your actual MetaMask account
  if (metaMaskAccount !== "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199") { // Only run if you replaced it
    console.log(`Authorizing MetaMask account: ${metaMaskAccount}`);
    await projectFunding.authorizeOfficial(metaMaskAccount);
  }
  
  console.log("Done! The accounts are now authorized officials.");
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 