// Simple setup script for VittaSutra testing
const hre = require("hardhat");

async function main() {
  console.log("Setting up a simple test project...");

  // Get the contract
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  const projectFunding = await ProjectFunding.deploy();
  await projectFunding.waitForDeployment();
  
  const address = await projectFunding.getAddress();
  console.log(`Contract deployed to: ${address}`);
  
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Using account: ${deployer.address}`);
  
  // Create a test project
  console.log("Creating a test project...");
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsLater = now + (180 * 24 * 60 * 60);
  
  const tx = await projectFunding.createProject(
    "Test Project",
    "This is a test project for development",
    "IT Department",
    hre.ethers.parseEther("10"),
    deployer.address,
    now,
    sixMonthsLater
  );
  
  await tx.wait();
  console.log("Test project created with ID 1");
  
  // Allocate funds
  const allocateTx = await projectFunding.allocateFunds(
    1, // Project ID
    hre.ethers.parseEther("5"),
    "Initial test allocation"
  );
  
  await allocateTx.wait();
  console.log("5 ETH allocated to project");
  
  // Authorize the MetaMask account if provided
  if (process.env.METAMASK_ADDRESS) {
    console.log(`Authorizing MetaMask account: ${process.env.METAMASK_ADDRESS}`);
    await projectFunding.authorizeOfficial(process.env.METAMASK_ADDRESS);
    console.log("MetaMask account authorized");
  } else {
    console.log("To authorize your MetaMask account, run this command with the METAMASK_ADDRESS environment variable");
    console.log("Example: METAMASK_ADDRESS=0x123... npx hardhat run scripts/simple-setup.js --network localhost");
  }
  
  console.log("\nNext steps:");
  console.log("1. Import a test account to MetaMask");
  console.log(`   - The contract owner is: ${deployer.address}`);
  console.log(`   - Private key: ${process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"}`);
  console.log("2. Connect your MetaMask to the local network (http://127.0.0.1:8545, Chain ID: 1337)");
  console.log("3. Go to your frontend and test recording an expense for Project ID 1");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 