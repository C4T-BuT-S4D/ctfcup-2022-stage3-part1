const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Box", async function () {
  let Box;
  let KawaiBank;

  async function deploy() {
    Box = await ethers.getContractFactory("Box");
    KawaiBank = await ethers.getContractFactory("KawaiBank");

    const box = await Box.deploy();

    const kawaiBank = await KawaiBank.deploy(box.address);

    const [_, otherAccount] = await ethers.getSigners();
    await Box.attach(await kawaiBank.box()).connect(otherAccount).init();

    return { kawaiBank };
  }

  describe("Deployment", async function () {
    it("Returns name", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiBank.box());
      const [_, otherAccount] = await ethers.getSigners();
      await expect(box.connect(otherAccount).name()).to.eventually.equal("KawaiBox");
    });
  });

  describe("Box", async function () {
    it("Mints", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiBank.box());
      const [_, otherAccount] = await ethers.getSigners();

      await box.connect(otherAccount).mint(1, "data", "key");
      await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
    });

    describe("Data", async function () {
      it("Shows data to owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, otherAccount] = await ethers.getSigners();

        await box.connect(otherAccount).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner operator", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(otherAccount.address, true);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with token approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Reverts with non-owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });
    });

    describe("Balance", async function () {
      it("Initiates to zero", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, otherAccount] = await ethers.getSigners();

        await expect(box.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(0);
      });

      it("Increases after mint", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, otherAccount] = await ethers.getSigners();

        await box.connect(otherAccount).mint(1, "data", "key");
        await expect(box.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(1);
      });

      it("Decreases after transfer", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
      });
    });

    describe("Transfers", async function () {
      it("Transfers from owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(otherAccount.address);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Doesn't show data to non-owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256)'](1)).to.be.reverted;
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });

      it("Changes balances after transfer", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [_, owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
        await expect(box.connect(owner).balanceOf(otherAccount.address)).to.eventually.equal(1);
      });
    });
  });
});
