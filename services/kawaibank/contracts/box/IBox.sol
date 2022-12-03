// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract IBox is
    IERC721MetadataUpgradeable,
    Initializable,
    OwnableUpgradeable
{
    function init(address owner) external virtual;
}

abstract contract IBoxOwner {
    function boxExterminated(uint256 tokenId, bytes calldata) external virtual;

    function boxMaterialized(uint256 tokenId, bytes calldata) external virtual;
}
