const hre = require("hardhat");

const config = require('../config.js');

async function main() {
  const [deployer] = await ethers.getSigners();

  const Box = await ethers.getContractFactory("Box");
  const KawaiBank = await ethers.getContractFactory("KawaiBank");

  const box = await Box.deploy();
  await box.deployTransaction.wait(1);

  const tx = await KawaiBank.attach(config.KAWAIBANK_ADDRESS).connect(deployer).upgradeBox(box.address);
  await tx.wait(1);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
