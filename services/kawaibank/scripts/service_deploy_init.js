const hre = require("hardhat");

async function main() {
  const Box = await ethers.getContractFactory("Box");
  const Coin = await ethers.getContractFactory("Coin");
  const Card = await ethers.getContractFactory("Card");
  const KawaiBank = await ethers.getContractFactory("KawaiBank");

  const box = await Box.deploy();
  await box.deployTransaction.wait(1);

  const coin = await Coin.deploy();
  await coin.deployTransaction.wait(1);

  const card = await Card.deploy();
  await card.deployTransaction.wait(1);

  const kawaiBank = await KawaiBank.deploy(box.address, coin.address, card.address);
  await kawaiBank.deployTransaction.wait(1);

  console.log(JSON.stringify({ kawaiBank: kawaiBank.address }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
