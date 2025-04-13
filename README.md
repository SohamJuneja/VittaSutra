# VittaSutra

A blockchain-based system for tracking and managing government project expenditures with enhanced transparency and accountability.

## Overview

VittaSutra is a comprehensive solution designed to bring transparency and efficiency to government project expenditure management. By leveraging blockchain technology, the system ensures immutable records of all financial transactions and project progress, while providing a user-friendly interface for stakeholders to monitor and manage expenditures.

## Solution & Approach

Our solution combines traditional web technologies with blockchain to create a robust and transparent system:

1. **Blockchain Integration**: Smart contracts manage the core financial transactions and project milestones, ensuring immutability and transparency.
2. **Web Application**: A modern web interface provides easy access to project information and expenditure tracking.
3. **Backend Services**: RESTful APIs handle data processing, user authentication, and blockchain interactions.
4. **Real-time Updates**: Stakeholders receive immediate notifications about project progress and expenditure changes.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Web3.js for blockchain interactions
- React Router for navigation
- Supabase for real-time features

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Ethers.js for blockchain integration
- Winston for logging
- Security features (Helmet, Rate Limiting)

### Blockchain
- Solidity for smart contracts
- Hardhat development environment
- Ethers.js for contract interaction
- Comprehensive testing suite

## Setup Instructions

### Prerequisites
- Node.js (>=14.0.0)
- MongoDB
- MetaMask or similar Web3 wallet
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd government-expenditure-tracker
   ```

2. Install dependencies for all components:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   - Create `.env` file in backend directory
   - Configure necessary environment variables (see example files)

### Hardhat SETUP:

1. Open a Terminal and start a hardhat node:
   ```bash
   cd ./blockchain/
   npx hardhat node
   ```
2. Open another terminal and deploy the contract:
   ```bash
   cd ./blockchain/
   npx hardhat run ./scripts/deploy.js --network localhost
   ```
### Development

1. Start the development servers:
   ```bash
   cd ./frontend/
   npm run dev
   ```
   This will start both frontend and backend servers concurrently.

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

### Production Build

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production servers:
   ```bash
   npm start
   ```

## Security Features

- Rate limiting on API endpoints
- Helmet.js for secure HTTP headers
- JWT-based authentication
- Input validation and sanitization
- Secure blockchain transaction handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

Team Black Fish 
