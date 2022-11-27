// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../box/IBox.sol";

contract KawaiBank is Ownable {
    TransparentUpgradeableProxy public box;

    constructor(IBox _box) {
        box = new TransparentUpgradeableProxy(
            address(_box),
            address(this),
            abi.encodeWithSelector(IBox.init.selector)
        );
    }

    function upgradeBox(IBox _box) external onlyOwner {
        box.upgradeTo(address(_box));
    }
}
