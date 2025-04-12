require('dotenv').config();
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
const config = require('../config');

const BLOCKCHAIN_PROVIDER = config.blockchain.provider;
const OWNER_PRIVATE_KEY = config.blockchain.ownerPrivateKey;
const GAS_LIMIT = config.blockchain.gasLimit;
const GAS_PRICE = config.blockchain.gasPrice;

if (!OWNER_PRIVATE_KEY) {
  console.error('Error: OWNER_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

async function deployContract() {
  try {
    console.log('Starting contract deployment process...');
    
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_PROVIDER);
    console.log(`Connected to blockchain provider at: ${BLOCKCHAIN_PROVIDER}`);
    
    const contractPath = path.resolve(__dirname, '../src/blockchain/contracts/ExpenditureTracker.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    console.log('Contract source code loaded successfully');
    
    console.log('Compiling contract...');
    const input = {
      language: 'Solidity',
      sources: {
        'ExpenditureTracker.sol': {
          content: contractSource
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    };
    
    const compiledContract = JSON.parse(solc.compile(JSON.stringify(input)));
    
    if (compiledContract.errors) {
      compiledContract.errors.forEach(error => {
        console.error(error.formattedMessage);
      });
      
      if (compiledContract.errors.some(error => error.severity === 'error')) {
        throw new Error('Contract compilation failed');
      }
    }
    
    const contractName = 'ExpenditureTracker';
    const contract = compiledContract.contracts['ExpenditureTracker.sol'][contractName];
    
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;
    
    const abiPath = path.resolve(__dirname, '../src/blockchain/abi/ExpenditureTracker.json');
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
    console.log(`ABI saved to: ${abiPath}`);
    
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const deployerAddress = wallet.address;
    console.log(`Deploying from address: ${deployerAddress}`);
    
    console.log('Deploying contract...');
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    const deployTransaction = factory.getDeployTransaction();
    const gasEstimate = await provider.estimateGas(deployTransaction);
    console.log(`Estimated gas: ${gasEstimate}`);
    
    const deployedContract = await factory.deploy({
      gasLimit: Math.min(gasEstimate * 1.2, GAS_LIMIT),
      gasPrice: ethers.parseUnits(GAS_PRICE, 'wei')
    });
    
    await deployedContract.waitForDeployment();
    const contractAddress = await deployedContract.getAddress();
    
    console.log(`Contract deployed successfully at address: ${contractAddress}`);
    
    const envPath = path.resolve(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*\n/, `CONTRACT_ADDRESS=${contractAddress}\n`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated with contract address');
    
    console.log('Deployment completed successfully!');
    return contractAddress;
    
  } catch (error) {
    console.error('Error deploying contract:', error);
    process.exit(1);
  }
}

deployContract()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 