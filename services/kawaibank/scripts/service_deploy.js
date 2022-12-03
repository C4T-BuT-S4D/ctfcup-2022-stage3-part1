const hre = require("hardhat");

const config = require('../config.js');

async function main() {
  const [deployer] = await ethers.getSigners();

  const KawaiBank = await ethers.getContractFactory("KawaiBank");
  const Box = await ethers.getContractFactory("Box");
  const Coin = await ethers.getContractFactory("Coin");

  const box = await Box.deploy();
  await box.deployTransaction.wait(1);

  const coin = await Coin.deploy();
  await coin.deployTransaction.wait(1);

  {
    const tx = await KawaiBank.attach(config.KAWAIBANK_ADDRESS).connect(deployer).upgradeBox(box.address);
    await tx.wait(1);
  }

  {
    const tx = await KawaiBank.attach(config.KAWAIBANK_ADDRESS).connect(deployer).upgradeCoin(coin.address);
    await tx.wait(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
