// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract ICard is Initializable {
    function init(address owner) external virtual;
}
