// Script to interact with the deployed ProjectFunding contract
const hre = require("hardhat");

async function main() {
  console.log("Interacting with ProjectFunding contract...");
  
  // Get the deployed contract address from command line arguments or use a default
  const contractAddress = process.argv[2] || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default local deployment address
  
  // Get contract instance
  const ProjectFunding = await hre.ethers.getContractFactory("ProjectFunding");
  const projectFunding = ProjectFunding.attach(contractAddress);

  // Get signers (accounts)
  const [owner, official, manager] = await hre.ethers.getSigners();
  
  console.log("Contract owner:", owner.address);
  console.log("Official address:", official.address);
  console.log("Project manager:", manager.address);

  try {
    // Authorize an official
    console.log("\nAuthorizing official...");
    const authTx = await projectFunding.authorizeOfficial(official.address);
    await authTx.wait();
    console.log(`Official authorized: ${official.address}`);

    // Create a new project
    console.log("\nCreating a new project...");
    const name = "Smart City Infrastructure";
    const description = "Development of smart traffic management system for urban areas";
    const department = "Urban Development";
    const totalBudget = hre.ethers.parseEther("100"); // 100 ETH as budget
    const startDate = Math.floor(Date.now() / 1000); // Current timestamp
    const endDate = startDate + 31536000; // One year from now
    
    const createTx = await projectFunding.createProject(
      name,
      description,
      department,
      totalBudget,
      manager.address,
      startDate,
      endDate
    );
    const createReceipt = await createTx.wait();
    
    // Get project ID from event
    const projectCreatedEvent = createReceipt.logs
      .filter(log => log.fragment && log.fragment.name === 'ProjectCreated')
      .map(log => projectFunding.interface.parseLog(log))[0];
    
    const projectId = projectCreatedEvent ? projectCreatedEvent.args.projectId : 1;
    console.log(`Project created with ID: ${projectId}`);

    // Update project status to in progress
    console.log("\nUpdating project status to InProgress...");
    const updateTx = await projectFunding.updateProjectStatus(projectId, 1); // 1 = InProgress
    await updateTx.wait();
    console.log("Project status updated to InProgress");

    // Allocate funds to the project
    console.log("\nAllocating funds to the project...");
    const allocateAmount = hre.ethers.parseEther("50"); // 50 ETH allocation
    const allocateTx = await projectFunding.allocateFunds(
      projectId,
      allocateAmount,
      "Initial fund allocation for Q1 2024"
    );
    const allocateReceipt = await allocateTx.wait();
    
    const allocationEvent = allocateReceipt.logs
      .filter(log => log.fragment && log.fragment.name === 'FundsAllocated')
      .map(log => projectFunding.interface.parseLog(log))[0];
    
    const allocationTxId = allocationEvent ? allocationEvent.args.transactionId : 1;
    console.log(`Funds allocated: ${hre.ethers.formatEther(allocateAmount)} ETH, Transaction ID: ${allocationTxId}`);

    // Record an expense
    console.log("\nRecording a project expense...");
    const expenseAmount = hre.ethers.parseEther("10"); // 10 ETH expense
    const expenseTx = await projectFunding.recordExpense(
      projectId,
      expenseAmount,
      "Payment to contractors for system design"
    );
    const expenseReceipt = await expenseTx.wait();
    
    const expenseEvent = expenseReceipt.logs
      .filter(log => log.fragment && log.fragment.name === 'FundsSpent')
      .map(log => projectFunding.interface.parseLog(log))[0];
    
    const expenseTxId = expenseEvent ? expenseEvent.args.transactionId : 2;
    console.log(`Expense recorded: ${hre.ethers.formatEther(expenseAmount)} ETH, Transaction ID: ${expenseTxId}`);

    // Get project details
    console.log("\nFetching project details...");
    const projectDetails = await projectFunding.getProject(projectId);
    
    console.log(`
    Project Name: ${projectDetails[0]}
    Department: ${projectDetails[2]}
    Total Budget: ${hre.ethers.formatEther(projectDetails[3])} ETH
    Allocated: ${hre.ethers.formatEther(projectDetails[4])} ETH
    Spent: ${hre.ethers.formatEther(projectDetails[5])} ETH
    Status: ${["NotStarted", "InProgress", "Completed", "Cancelled"][projectDetails[7]]}
    `);

    // Get project transactions
    console.log("\nFetching project transactions...");
    const transactionIds = await projectFunding.getProjectTransactions(projectId);
    console.log(`Total transactions: ${transactionIds.length}`);
    
    for (let i = 0; i < transactionIds.length; i++) {
      const txId = transactionIds[i];
      const txDetails = await projectFunding.getTransaction(txId);
      
      console.log(`
      Transaction ID: ${txId}
      Type: ${["Allocation", "Expense", "Return"][txDetails[3]]}
      Amount: ${hre.ethers.formatEther(txDetails[2])} ETH
      Description: ${txDetails[1]}
      Executed by: ${txDetails[4]}
      Timestamp: ${new Date(Number(txDetails[5]) * 1000).toLocaleString()}
      `);
    }

    console.log("\nInteraction complete. Contract is ready for use with MetaMask.");
    console.log(`Contract Address: ${contractAddress}`);

  } catch (error) {
    console.error("Error during contract interaction:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 