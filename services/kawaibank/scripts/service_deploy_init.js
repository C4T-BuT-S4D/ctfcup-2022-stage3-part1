const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const Box = await ethers.getContractFactory("Box");
  const KawaiBank = await ethers.getContractFactory("KawaiBank");

  const box = await Box.deploy();
  await box.deployTransaction.wait(1);

  const kawaiBank = await KawaiBank.deploy(box.address);
  await kawaiBank.deployTransaction.wait(1);

  console.log(JSON.stringify({ kawaiBank: kawaiBank.address }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
