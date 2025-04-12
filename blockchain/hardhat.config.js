/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Default private key for local development (DO NOT use in production)
const DEVELOPMENT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const PRIVATE_KEY = process.env.PRIVATE_KEY || DEVELOPMENT_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    localhost2: {
      url: "http://127.0.0.1:8546",
    },
    hardhat: {
      chainId: 1337, // MetaMask requires a fixed chainId for localhost
      mining: {
        auto: true, // Auto mine transactions immediately (helpful for testing)
        interval: 0
      }
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
