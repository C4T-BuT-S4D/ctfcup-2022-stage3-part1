// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../box/IBox.sol";
import "../coin/ICoin.sol";
import "../card/ICard.sol";

contract KawaiBank is Ownable {
    TransparentUpgradeableProxy public box;
    TransparentUpgradeableProxy public coin;
    TransparentUpgradeableProxy public card;

    constructor(
        IBox _box,
        ICoin _coin,
        ICard _card
    ) {
        box = new TransparentUpgradeableProxy(
            address(_box),
            address(this),
            abi.encodeWithSelector(IBox.init.selector, msg.sender)
        );

        coin = new TransparentUpgradeableProxy(
            address(_coin),
            address(this),
            abi.encodeWithSelector(ICoin.init.selector, msg.sender)
        );

        card = new TransparentUpgradeableProxy(
            address(_card),
            address(this),
            abi.encodeWithSelector(ICard.init.selector, msg.sender)
        );
    }

    function upgradeBox(IBox _box) external onlyOwner {
        box.upgradeTo(address(_box));
    }

    function upgradeCoin(ICoin _coin) external onlyOwner {
        coin.upgradeTo(address(_coin));
    }

    function upgradeCard(ICard _card) external onlyOwner {
        card.upgradeTo(address(_card));
    }
}
