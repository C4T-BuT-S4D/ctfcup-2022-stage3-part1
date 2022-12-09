const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("KawaiGazPromBank", async function () {
  let KawaiGazPromBank;
  let Box;
  let Coin;
  let Card;
  let Exploit;

  async function deploy() {
    KawaiGazPromBank = await ethers.getContractFactory("KawaiGazPromBank");

    Box = await ethers.getContractFactory("Box");
    Coin = await ethers.getContractFactory("Coin");
    Card = await ethers.getContractFactory("Card");
    Exploit = await ethers.getContractFactory("Exploit");

    const box = await Box.deploy();
    const coin = await Coin.deploy();
    const card = await Card.deploy();
    const exploit = await Exploit.deploy();

    const kawaiGazPromBank = await KawaiGazPromBank.deploy(box.address, coin.address, card.address, exploit.address);

    return { kawaiGazPromBank };
  }

  describe("Box", async function () {
    it("Returns name", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiGazPromBank.box());
      const [owner] = await ethers.getSigners();

      await expect(box.connect(owner).name()).to.eventually.equal("KawaiBox");
    });

    it("Mints", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const box = Box.attach(await kawaiGazPromBank.box());
      const [owner] = await ethers.getSigners();

      await box.connect(owner).mint(1, "data", "key");
      await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
    });

    describe("Data", async function () {
      it("Shows data to owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Shows data to non-owner operator", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(otherAccount.address, true);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Shows data to non-owner with token approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.eventually.equal("data");
      });

      it("Reverts with non-owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });

      it("Reverts with cleared approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await box.connect(otherAccount).clearTokenApprovals(1);
        await expect(box.connect(otherAccount)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });
    });

    describe("Balance", async function () {
      it("Initiates to zero", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner] = await ethers.getSigners();

        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
      });

      it("Increases after mint", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(1);
      });

      it("Decreases after transfer", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
      });
    });

    describe("Transfers", async function () {
      it("Transfers from owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Transfers with token approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).approve(otherAccount.address, 1);
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Transfers with operator approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner).setApprovalForAll(otherAccount.address, true);
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(otherAccount).ownerOf(1)).to.eventually.equal(otherAccount.address);
      });

      it("Shows data to non-owner with key", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "key")).to.eventually.equal("data");
      });

      it("Doesn't show data to non-owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner)['tokenURI(uint256)'](1)).to.be.reverted;
        await expect(box.connect(owner)['tokenURI(uint256,string)'](1, "")).to.be.reverted;
      });

      it("Changes balances after transfer", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(owner)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1);
        await expect(box.connect(owner).balanceOf(owner.address)).to.eventually.equal(0);
        await expect(box.connect(owner).balanceOf(otherAccount.address)).to.eventually.equal(1);
      });

      it("Doesn't transfer from non-owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await expect(box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, otherAccount.address, 1)).to.be.reverted;
      });

      it("Transfers to self", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const box = Box.attach(await kawaiGazPromBank.box());
        const [owner, otherAccount] = await ethers.getSigners();

        await box.connect(owner).mint(1, "data", "key");
        await box.connect(otherAccount)['safeTransferFrom(address,address,uint256)'](owner.address, owner.address, 1);
        await expect(box.connect(owner).ownerOf(1)).to.eventually.equal(owner.address);
        await expect(box.connect(otherAccount).balanceOf(owner.address)).to.eventually.equal(1);
      });

      it("Callbacks on transfer", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        BoxOwner = await ethers.getContractFactory("BoxOwner");

        const boxOwner = await BoxOwner.deploy();
        const box = Box.attach(await kawaiGazPromBank.box());
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
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [owner] = await ethers.getSigners();

      await expect(coin.connect(owner).name()).to.eventually.equal("KawaiCoin");
    });

    it("Mints initial", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [owner] = await ethers.getSigners();

      await expect(coin.connect(owner).balanceOf(owner.address)).to.eventually.equal(1000000000000000000n);
    });

    it("Gets coins", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [_, otherAccount] = await ethers.getSigners();

      await coin.connect(otherAccount).getCoins(1);
      await expect(coin.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(1n);
    });

    it("Doesn't get many coins", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [_, otherAccount] = await ethers.getSigners();

      await expect(coin.connect(otherAccount).getCoins(2)).to.be.reverted;
    });

    it("Gets many coins for shareholder", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [owner] = await ethers.getSigners();

      await coin.connect(owner).getCoins(10);
      await expect(coin.connect(owner).balanceOf(owner.address)).to.eventually.equal(1000000000000000010n)
    });

    it("Increases total supply", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [owner] = await ethers.getSigners();

      await coin.connect(owner).getCoins(10);
      await expect(coin.connect(owner).totalSupply()).to.eventually.equal(1000000000000000010n);
    });

    it("Transfers ownership", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [owner, otherAccount] = await ethers.getSigners();

      await coin.connect(owner).setOwner(otherAccount.address);
      await coin.connect(otherAccount).mint(otherAccount.address, 2);
      await expect(coin.connect(otherAccount).balanceOf(otherAccount.address)).to.eventually.equal(2n);
    });

    it("Doesn't allow shareholder transfer", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const coin = Coin.attach(await kawaiGazPromBank.coin());
      const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

      await expect(coin.connect(otherAccount1).setShareholder(otherAccount2.address)).to.be.reverted;
    });

    describe("Transfers", async function () {
      it("Transfers from owner", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await coin.connect(otherAccount1).transfer(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount2.address)).to.eventually.equal(1n);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount1.address)).to.eventually.equal(0n);
      });

      it("Doesn't transfer from owner without balance", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await expect(coin.connect(otherAccount1).transfer(otherAccount2.address, 1)).to.be.reverted;
      });

      it("Transfers from non-owner with approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await coin.connect(otherAccount1).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1);
        await expect(coin.connect(otherAccount1).balanceOf(otherAccount3.address)).to.eventually.equal(1n);
      });

      it("Doesn't transfer from non-owner without approval", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).getCoins(1);
        await expect(coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1)).to.be.reverted;
      });

      it("Transfers from non-owner without balance", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();

        await coin.connect(otherAccount1).approve(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount2).transferFrom(otherAccount1.address, otherAccount3.address, 1)).to.be.reverted;
      });
    });

    describe("Retail", async function () {
      it("Can view its own item", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount] = await ethers.getSigners();

        await coin.connect(otherAccount).sellItem(0, "data", 10);
        await expect(coin.connect(otherAccount).viewItem(0)).to.eventually.equal("data");
      });

      it("Can view item after purchase", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).getCoins(1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).buyItem(0);
        await expect(coin.connect(otherAccount2).viewItem(0)).to.eventually.equal("data");
      });

      it("Can view its own item after purchase", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).getCoins(1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await coin.connect(otherAccount2).buyItem(0);
        await expect(coin.connect(otherAccount1).viewItem(0)).to.eventually.equal("data");
      });

      it("Can't buy without balance", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await coin.connect(otherAccount2).approve(otherAccount2.address, 1);
        await expect(coin.connect(otherAccount2).buyItem(0)).to.be.reverted;
      });

      it("Changes balances after purchase", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
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
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const coin = Coin.attach(await kawaiGazPromBank.coin());
        const [_, otherAccount1, otherAccount2] = await ethers.getSigners();

        await coin.connect(otherAccount1).sellItem(0, "data", 1);
        await expect(coin.connect(otherAccount2).viewItem(0)).to.be.reverted;
      });
    });
  });

  describe("Card", async function () {
    it("Creates card", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const card = Card.attach(await kawaiGazPromBank.card());
      const [owner] = await ethers.getSigners();

      const balance = await owner.getBalance();

      await expect(card.connect(owner).create(
        0,
        Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
        { value: ethers.utils.parseEther('1') }
      )).not.to.be.reverted;

      await expect(owner.getBalance()).to.eventually.lessThanOrEqual(balance.sub(ethers.utils.parseEther("1.0")));
    });

    describe("Deposits", async function () {
      it("Can deposit", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner] = await ethers.getSigners();

        await card.connect(owner).create(
          0,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0)))
        );

        await card.connect(owner).deposit(0, { value: ethers.utils.parseEther('1') });

        await expect(card.connect(owner).balances(0)).to.eventually.equal(ethers.utils.parseEther('1'));
      });

      it("Can't deposit to non-existent card", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner] = await ethers.getSigners();

        await expect(card.connect(owner).deposit(0, { value: ethers.utils.parseEther('1') })).to.be.reverted;
      });
    });

    describe("Withdrawals", async function () {
      it("Can withdraw", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner] = await ethers.getSigners();

        const balance = await owner.getBalance();

        await card.connect(owner).create(
          0,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
          { value: ethers.utils.parseEther('1') }
        );

        await expect(card.connect(owner).balances(0)).to.eventually.equal(ethers.utils.parseEther('1'));

        await card.connect(owner).withdraw(
          0,
          ethers.utils.parseEther('1')
        );

        await expect(owner.getBalance()).to.eventually.greaterThanOrEqual(balance.sub(ethers.utils.parseEther("0.1")));
      });

      it("Can't withdraw more than balance", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner] = await ethers.getSigners();

        await card.connect(owner).create(
          0,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
          { value: ethers.utils.parseEther('1') }
        );

        await expect(card.connect(owner).withdraw(
          0,
          ethers.utils.parseEther('1.1')
        )).to.be.reverted;
      });

      it("Can't withdraw another owner balance", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner, otherAccount] = await ethers.getSigners();

        await card.connect(owner).create(
          0,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
          { value: ethers.utils.parseEther('1') }
        );

        await expect(card.connect(otherAccount).withdraw(
          0,
          ethers.utils.parseEther('1')
        )).to.be.reverted;
      });
    });

    describe("Gifts", async function () {
      it("Can create and spend gift", async function () {
        const { kawaiGazPromBank } = await loadFixture(deploy);

        const card = Card.attach(await kawaiGazPromBank.card());
        const [owner, otherAccount] = await ethers.getSigners();

        await card.connect(owner).create(
          0,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
          { value: ethers.utils.parseEther('1') }
        );

        await card.connect(otherAccount).create(
          2,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0)))
        );

        await card.connect(owner).createGift(
          1, 0, otherAccount.address, ethers.utils.parseEther('0.5'),
          Uint8Array.from(Array.from('w'.repeat(32)).map(letter => letter.charCodeAt(0)))
        );

        const tx = await card.connect(otherAccount).spendGift(0, 1, ethers.utils.parseEther('0.4'), 2, 3);

        await expect(card.connect(otherAccount).balances(2)).to.eventually.equal(ethers.utils.parseEther('0.4'));
        const sign = await card.sign(
          {
            to: otherAccount.address,
            size: ethers.utils.parseEther('0.5'),
            key: Uint8Array.from(Array.from('w'.repeat(32)).map(letter => letter.charCodeAt(0)))
          },
          tx.blockNumber,
          Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0)))
        );
        await expect(card.connect(otherAccount).signs(2, 3)).to.eventually.equal(sign);
      });
    });

    it("Can't spend another owner gift", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const card = Card.attach(await kawaiGazPromBank.card());
      const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

      await card.connect(owner).create(
        0,
        Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
        { value: ethers.utils.parseEther('1') }
      );

      await card.connect(otherAccount2).create(
        2,
        Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0)))
      );

      await card.connect(owner).createGift(
        1, 0, otherAccount1.address, ethers.utils.parseEther('0.5'),
        Uint8Array.from(Array.from('w'.repeat(32)).map(letter => letter.charCodeAt(0)))
      );

      await expect(card.connect(otherAccount2).spendGift(0, 1, ethers.utils.parseEther('0.4'), 2, 3)).to.be.reverted;
    });

    it("Can't create two gifts with same id", async function () {
      const { kawaiGazPromBank } = await loadFixture(deploy);

      const card = Card.attach(await kawaiGazPromBank.card());
      const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();

      await card.connect(owner).create(
        0,
        Uint8Array.from(Array.from('q'.repeat(32)).map(letter => letter.charCodeAt(0))),
        { value: ethers.utils.parseEther('1') }
      );

      await card.connect(owner).createGift(
        1, 0, otherAccount1.address, ethers.utils.parseEther('0.5'),
        Uint8Array.from(Array.from('w'.repeat(32)).map(letter => letter.charCodeAt(0)))
      );

      await expect(card.connect(owner).createGift(
        1, 0, otherAccount1.address, ethers.utils.parseEther('0.5'),
        Uint8Array.from(Array.from('w'.repeat(32)).map(letter => letter.charCodeAt(0)))
      )).to.be.reverted;
    });
  });
});
