require("@nomicfoundation/hardhat-toolbox");

const config = require('./config.js');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    ctfpuc_private: {
      url: `${config.BLOCKCHAIN_PROTOCOL}://${process.env.BLOCKCHAIN_TOKEN}@${config.BLOCKCHAIN_ADDRESS}:${config.BLOCKCHAIN_PORT}`,
      accounts: [config.DEPLOY_KEY]
    },
    ctfpuc_public: {
      url: `${config.BLOCKCHAIN_PROTOCOL}://${config.BLOCKCHAIN_ADDRESS}:${config.BLOCKCHAIN_PORT}`,
      accounts: [config.DEPLOY_KEY]
    }
  }
};
