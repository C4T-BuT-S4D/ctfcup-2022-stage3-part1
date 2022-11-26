require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    ctfpuc: {
      url: 'http://127.0.0.1:48545/?a=123',
      accounts: ['3beac0685582da835a6ecfe0cc7b878a76bfc229a54c2f7ef5cd4efe4e05ccbc']
    }
  }
};
