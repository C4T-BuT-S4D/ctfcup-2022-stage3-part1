// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "./ICard.sol";

contract Card is ICard {
    constructor() {
        _disableInitializers();
    }

    function init(address) external override initializer {}

    mapping(uint256 => address) private owners;
    mapping(uint256 => uint256) public balances;
    mapping(uint256 => bytes32) private names;
    mapping(uint256 => mapping(uint256 => bytes32)) public signs;

    struct Gift {
        address to;
        uint256 size;
        bytes32 key;
    }

    mapping(uint256 => mapping(uint256 => Gift)) private gifts;

    function create(uint256 id, bytes32 name) external payable {
        assembly {
            mstore(0x00, id)
            mstore(0x20, 1)
            let k := keccak256(0x00, 0x40)
            if sload(k) {
                revert(0, 0)
            }
            sstore(k, caller())
            mstore(0x00, id)
            mstore(0x20, 2)
            sstore(keccak256(0x00, 0x40), callvalue())
            mstore(0x00, id)
            mstore(0x20, 3)
            sstore(keccak256(0x00, 0x40), name)
        }
    }

    function deposit(uint256 id) external payable {
        assembly {
            mstore(0x00, id)
            mstore(0x20, 1)
            if iszero(sload(keccak256(0x00, 0x40))) {
                revert(0, 0)
            }
            mstore(0x00, id)
            mstore(0x20, 2)
            let k := keccak256(0x00, 0x40)
            let b := sload(k)
            if lt(add(b, callvalue()), b) {
                revert(0, 0)
            }
            sstore(k, add(b, callvalue()))
        }
    }

    function withdraw(uint256 id, uint256 amount) external {
        assembly {
            mstore(0x00, id)
            mstore(0x20, 1)
            if iszero(eq(sload(keccak256(0x00, 0x40)), caller())) {
                revert(0, 0)
            }
            mstore(0x00, id)
            mstore(0x20, 2)
            let k := keccak256(0x00, 0x40)
            let b := sload(k)
            if gt(sub(b, callvalue()), b) {
                revert(0, 0)
            }
            sstore(k, sub(b, callvalue()))
            if iszero(call(0, caller(), amount, 0, 0, 0, 0)) {
                revert(0, 0)
            }
        }
    }

    function createGift(
        uint256 gift_id,
        uint256 from_id,
        address to,
        uint256 amount,
        bytes32 key
    ) external {
        assembly {
            mstore(0x00, from_id)
            mstore(0x20, 1)
            if iszero(eq(sload(keccak256(0x00, 0x40)), caller())) {
                revert(0, 0)
            }
            mstore(0x00, from_id)
            mstore(0x20, 2)
            let k := keccak256(0x00, 0x40)
            let b := sload(k)
            if gt(sub(b, callvalue()), b) {
                revert(0, 0)
            }
            sstore(k, sub(b, callvalue()))
            mstore(0x00, from_id)
            mstore(0x20, 5)
            k := keccak256(0x00, 0x40)
            mstore(0x00, gift_id)
            mstore(0x20, k)
            let x := keccak256(0x00, 0x40)
            if iszero(iszero(sload(x))) {
                revert(0, 0)
            }
            sstore(x, to)
            sstore(add(x, 1), amount)
            sstore(add(x, 2), key)
        }
    }

    function spendGift(
        uint256 from_id,
        uint256 gift_id,
        uint256 amount,
        uint256 to_id,
        uint256 sign_id
    ) external {
        assembly {
            mstore(0x40, 0xf0)
        }

        assembly {
            mstore(0x00, from_id)
            mstore(0x20, 5)
            let k := keccak256(0x00, 0x40)
            mstore(0x00, gift_id)
            mstore(0x20, k)
            mstore(0x80, sload(add(keccak256(0x00, 0x40), 2)))
        }

        assembly {
            mstore(0x00, to_id)
            mstore(0x20, 1)
            if iszero(eq(sload(keccak256(0x00, 0x40)), caller())) {
                revert(0, 0)
            }
            mstore(0x00, from_id)
            mstore(0x20, 5)
            let k := keccak256(0x00, 0x40)
            mstore(0x00, gift_id)
            mstore(0x20, k)
            let x := keccak256(0x00, 0x40)
            if iszero(eq(sload(x), caller())) {
                revert(0, 0)
            }
            let g := sload(add(x, 1))
            if iszero(g) {
                revert(0, 0)
            }
            if gt(sub(g, amount), g) {
                revert(0, 0)
            }
            sstore(add(x, 1), sub(g, amount))
            mstore(0x00, to_id)
            mstore(0x20, 2)
            let b := sload(keccak256(0x00, 0x40))
            if lt(add(b, amount), b) {
                revert(0, 0)
            }
            sstore(keccak256(0x00, 0x40), add(b, amount))
        }

        signs[to_id][sign_id] = sign(
            gifts[from_id][gift_id],
            block.number,
            names[from_id]
        );
    }

    function sign(
        Gift memory gift,
        uint256 blk,
        bytes32 name
    ) public pure returns (bytes32 res) {
        uint256 to = uint256(uint160(gift.to));
        assembly {
            let key := mload(0x80)
            mstore(0x00, blk)
            res := xor(key, xor(keccak256(0x00, 0x20), xor(name, to)))
        }
    }
}
