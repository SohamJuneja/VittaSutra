// Script to authorize a MetaMask address
const hre = require("hardhat");

async function main() {
  // Get address from command line
  const addressToAuthorize = process.argv[2];
  
  if (!addressToAuthorize) {
    console.log("Please provide an address to authorize");
    console.log("Usage: npx hardhat run scripts/authorize-address.js --network localhost 0xYourMetaMaskAddress");
    return;
  }
  
  console.log(`Authorizing address: ${addressToAuthorize}`);

  // Get the contract address from deployment
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log(`Using contract at: ${contractAddress}`);
  
  // Get the contract instance
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  const projectFunding = ProjectFunding.attach(contractAddress);
  
  // Authorize the address
  const tx = await projectFunding.authorizeOfficial(addressToAuthorize);
  await tx.wait();
  
  console.log(`Address ${addressToAuthorize} successfully authorized!`);
  console.log("You can now use this address to interact with the contract.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error occurred:");
    console.error(error);
    process.exit(1);
  }); 