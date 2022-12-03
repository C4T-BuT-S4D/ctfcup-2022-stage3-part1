// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "./IBox.sol";

contract BoxOwner is IBoxOwner {
    string[] public statuses;

    function boxExterminated(uint256, bytes calldata) external override {
        statuses.push("exterminated");
    }

    function boxMaterialized(uint256, bytes calldata) external override {
        statuses.push("materialized");
    }

    function doSafeTransferFrom(
        IBox box,
        address _from,
        address _to,
        uint256 _tokenId
    ) external {
        box.safeTransferFrom(_from, _to, _tokenId);
    }
}
