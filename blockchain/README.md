# VittaSutra Blockchain Integration

This directory contains a local blockchain setup using Hardhat for the VittaSutra platform, allowing transparent tracking of government funds and projects.

## Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)
- MetaMask browser extension

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

3. Start a local blockchain node:
   ```
   npx hardhat node
   ```

4. In a new terminal, deploy the contract to the local blockchain:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```
   Note the contract address output from this command.

5. Create sample project and transactions (optional):
   ```
   npx hardhat run scripts/interact.js --network localhost
   ```

## Using MetaMask with the Local Blockchain

1. Open MetaMask and add a new network with the following details:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

2. Import one of the development accounts into MetaMask:
   - Open your terminal where Hardhat node is running
   - Find one of the accounts and its private key
   - In MetaMask, click on your account icon > Import Account
   - Paste the private key and click Import

3. Open the web interface:
   - Serve the files from the `public` directory using a local server
   - You can use any simple HTTP server, such as:
     ```
     npx serve public
     ```
   - Open the provided URL in your browser

4. Connect with MetaMask:
   - Click "Connect MetaMask" in the web interface
   - Follow the prompts to connect your imported account

## Smart Contract Functions

The `ProjectFunding` contract provides the following functionality:

- Creating government projects with budget allocation
- Tracking fund allocations to projects
- Recording expenses against allocated funds
- Viewing project details and transaction history

## Project Structure

- `contracts/`: Smart contract code
  - `ProjectFunding.sol`: Main contract for fund tracking
- `scripts/`: Helper scripts
  - `deploy.js`: Deployment script
  - `interact.js`: Script to interact with the deployed contract
- `public/`: Web interface files
  - `index.html`: Simple web interface
  - `js/metamaskConnector.js`: JavaScript connector for MetaMask

## Development Commands

- Compile contracts: `npx hardhat compile`
- Run tests: `npx hardhat test`
- Start local blockchain: `npx hardhat node`
- Deploy contract: `npx hardhat run scripts/deploy.js --network localhost`
- View contract help: `npx hardhat help`

## MetaMask Integration

The web interface uses MetaMask for blockchain interaction. The `metamaskConnector.js` file provides the necessary code to:

1. Connect to MetaMask
2. Interact with the deployed contract
3. Display project information and transactions
4. Create new projects and record transactions

## Notes

- This is a local development setup and not suitable for production use without additional security measures
- The contract uses a fixed chain ID (1337) for local development with MetaMask
- Each time you restart the Hardhat node, you'll need to redeploy the contract and update the contract address in the web interface
