const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("KawaiBank", async function () {
  let KawaiBank;
  let Box;
  let Coin;

  async function deploy() {
    KawaiBank = await ethers.getContractFactory("KawaiBank");

    Box = await ethers.getContractFactory("Box");
    Coin = await ethers.getContractFactory("Coin");

    const box = await Box.deploy();
    const coin = await Coin.deploy();

    const kawaiBank = await KawaiBank.deploy(box.address, coin.address);

    return { kawaiBank };
  }

  describe("Box", async function () {
    it("Returns name", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiBank.box());
      const [owner] = await ethers.getSigners();

      await expect(box.connect(owner).name()).to.eventually.equal("KawaiBox");
    });

    it("Mints", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiBank.box());
      const [owner] = await ethers.getSigners();

      await box.connect(owner).mint(1, "data", "key");
      await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
    });

    describe("Data", async function () {
      it("Shows data to owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner operator", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(otherAccount.address, true);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with token approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Reverts with non-owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });
    });

    describe("Balance", async function () {
      it("Initiates to zero", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner] = await ethers.getSigners();

        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
      });

      it("Increases after mint", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(1);
      });

      it("Decreases after transfer", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
      });
    });

    describe("Transfers", async function () {
      it("Transfers from owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(otherAccount.address);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Transfers with token approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(otherAccount.address);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Transfers with operator approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(otherAccount.address, true);
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(otherAccount.address);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Doesn't show data to non-owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256)'](1)).to.be.reverted;
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });

      it("Changes balances after transfer", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
        await expect(box.connect(owner).balanceOf(otherAccount.address)).to.eventually.equal(1);
      });

      it("Doesn't transfer from non-owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1)).to.be.reverted;
      });

      it("Transfers to self", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, owner.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(owner.address);
        await expect(box.connect(otherAccount).balanceOf(owner.address)).to.eventually.equal(1);
      });

      it("Callbacks on transfer", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        BoxOwner = await ethers.getContractFactory("BoxOwner");

        const boxOwner = await BoxOwner.deploy();
        const box = Box.attach(await kawaiBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(boxOwner.address, true);
        await boxOwner.connect(owner).doSafeTransferFrom(box.address, owner.address, otherAccount.address, 1);
        await expect(box.connect(otherAccount).balanceOf(owner.address)).to.eventually.equal(0);
        await expect(box.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(1);
        await expect(boxOwner.connect(owner).statuses(0)).to.eventually.equal('exterminated');
        await expect(boxOwner.connect(owner).statuses(1)).to.eventually.equal('materialized');
      });
    });
  });

  describe("Coin", async function () {
    it("Returns name", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [owner] = await ethers.getSigners();

      await expect(coin.connect(owner).name()).to.eventually.equal("KawaiCoin");
    });

    it("Mints initial", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [owner] = await ethers.getSigners();

      await expect(coin.connect(owner).balanceOf(owner.address)).to.eventually.equal(1000000000000000000n);
    });

    it("Gets coins", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [_, otherAccount] = await ethers.getSigners();

      await coin.connect(otherAccount).getCoins(1);
      await expect(coin.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(1n);
    });

    it("Doesn't get many coins", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [_, otherAccount] = await ethers.getSigners();

      await expect(coin.connect(otherAccount).getCoins(2)).to.be.reverted;
    });

    it("Gets many coins for shareholder", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [owner] = await ethers.getSigners();

      await coin.connect(owner).getCoins(10);
      await expect(coin.connect(owner).balanceOf(owner.address)).to.eventually.equal(1000000000000000010n)
    });

    it("Increases total supply", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [owner] = await ethers.getSigners();

      await coin.connect(owner).getCoins(10);
      await expect(coin.connect(owner).totalSupply()).to.eventually.equal(1000000000000000010n);
    });

    it("Transfers ownership", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [owner, otherAccount] = await ethers.getSigners();

      await coin.connect(owner).setOwner(otherAccount.address);
      await coin.connect(otherAccount).mint(otherAccount.address, 2);
      await expect(coin.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(2n);
    });

    it("Doesn't allow shareholder transfer", async function () {
      const { kawaiBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiBank.coin());
      const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

      await expect(coin.connect(otherAccount1).setShareholder(otherAccount2.address)).to.be.reverted;
    });

    describe("Transfers", async function () {
      it("Transfers from owner", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await coin.connect(otherAccount1).transfer(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount2.address)).to.eventually.equal(1n);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount1.address)).to.eventually.equal(0n);
      });

      it("Doesn't transfer from owner without balance", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await expect(coin.connect(otherAccount1).transfer(otherAccount2.address, 1)).to.be.reverted;
      });

      it("Transfers from non-owner with approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await coin.connect(otherAccount1).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount3.address)).to.eventually.equal(1n);
      });

      it("Doesn't transfer from non-owner without approval", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await expect(coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1)).to.be.reverted;
      });

      it("Transfers from non-owner without balance", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).approve(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1)).to.be.reverted;
      });
    });

    describe("Retail", async function () {
      it("Can view its own item", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount] = await ethers.getSigners();

        await coin.connect(otherAccount).sellItem(0, "data", 10);
        await expect(coin.connect(otherAccount).viewItem(0)).to.eventually.equal("data");
      });

      it("Can view item after purchase", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).getCoins(1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).buyItem(0);
        await expect(coin.connect(otherAccount2).viewItem(0)).to.eventually.equal("data");
      });

      it("Can view its own item after purchase", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).getCoins(1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).buyItem(0);
        await expect(coin.connect(otherAccount1).viewItem(0)).to.eventually.equal("data");
      });

      it("Can't buy without balance", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount2).buyItem(0)).to.be.reverted;
      });

      it("Changes balances after purchase", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).getCoins(1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).buyItem(0);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount1.address)).to.eventually.equal(1n);
        await expect(coin.connect(otherAccount2).balanceOf(otherAccount2.address)).to.eventually.equal(0n);
        await expect(coin.connect(otherAccount1).totalSupply()).to.eventually.equal(1000000000000000001n);
      });

      it("Can't view item without purchase", async function () {
        const { kawaiBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await expect(coin.connect(otherAccount2).viewItem(0)).to.be.reverted;
      });
    });
  })
});
