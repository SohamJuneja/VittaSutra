# Government Expenditure Tracker - Backend

The backend API for the Government Expenditure Tracking System with blockchain integration.

## Quick Start

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration

4. Deploy the smart contract to the blockchain:
   ```
   npm run deploy-contract
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Blockchain Configuration

The system uses Ethereum or a compatible blockchain for transparency. You need to:

1. Set `BLOCKCHAIN_ENABLED=true` in the `.env` file
2. Set `BLOCKCHAIN_PROVIDER` to your Ethereum node URL (e.g., local Ganache, Infura, etc.)
3. Configure `OWNER_PRIVATE_KEY` with a valid private key that has funds
4. Run the deployment script, which will update the `CONTRACT_ADDRESS` in your `.env`

## File Structure

```
backend/
├── config/                # Configuration files
├── logs/                  # Application logs
├── scripts/               # Utility scripts
│   └── deploy-contract.js # Blockchain contract deployment
├── src/
│   ├── blockchain/        # Blockchain integration
│   │   ├── abi/           # Smart contract ABI
│   │   ├── contracts/     # Solidity smart contracts
│   │   ├── blockchainService.js # Blockchain functionality
│   │   └── client.js      # Blockchain client wrapper
│   ├── controllers/       # API controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   │   └── logger.js      # Logging utility
│   └── server.js          # Application entry point
├── uploads/               # Uploaded files directory
├── .env                   # Environment variables
└── package.json           # Dependencies and scripts
```

## NPM Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot reload
- `npm test` - Run tests
- `npm run deploy-contract` - Deploy the smart contract to the blockchain

## API Documentation

The API includes the following endpoints:

- `/api/auth` - Authentication and user management
- `/api/projects` - Project CRUD operations
- `/api/expenditures` - Expenditure tracking
- `/api/complaints` - Citizen complaint handling 