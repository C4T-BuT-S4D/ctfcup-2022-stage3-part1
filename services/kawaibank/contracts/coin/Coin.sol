// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

import "./ICoin.sol";

contract Coin is ICoin {
    string private _name;
    address private owner;
    address private shareholder;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => bool) gotCoins;
    uint256 private _totalSupply;

    struct Item {
        address owner;
        uint256 cost;
        string content;
        bool used;
    }

    mapping(uint256 => Item) private items;
    mapping(uint256 => mapping(address => bool)) viewers;

    constructor() {
        _disableInitializers();
    }

    function init(address _owner) external override initializer {
        owner = msg.sender;
        mint(_owner, 1e18);
        owner = _owner;
        shareholder = _owner;
        _name = "KawaiCoin";
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _name;
    }

    function decimals() external pure returns (uint8) {
        return 18;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function setOwner(address _owner) external {
        require(msg.sender == owner);
        owner = _owner;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balances[msg.sender] >= amount);
        unchecked {
            balances[msg.sender] -= amount;
            balances[to] += amount;
        }
        return true;
    }

    function allowance(address _owner, address spender)
        external
        view
        returns (uint256)
    {
        return allowances[_owner][spender];
    }

    function setShareholder(address _shareholder) external {
        require(msg.sender == _shareholder);
        shareholder = _shareholder;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowances[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        uint256 _allowance = allowances[from][msg.sender];
        if (_allowance != type(uint256).max) {
            require(_allowance >= amount);
            unchecked {
                allowances[from][msg.sender] -= amount;
            }
        }

        require(balances[from] >= amount);
        unchecked {
            balances[from] -= amount;
            balances[to] += amount;
        }

        return true;
    }

    function mint(address account, uint256 amount) public {
        require(msg.sender == owner);
        _totalSupply += amount;
        unchecked {
            balances[account] += amount;
        }
    }

    function getCoins(uint256 coins) external {
        require(coins <= (msg.sender == shareholder ? 1e18 : 1));
        require(!gotCoins[msg.sender]);
        gotCoins[msg.sender] = true;
        _totalSupply += coins;
        unchecked {
            balances[msg.sender] += coins;
        }
    }

    function sellItem(
        uint256 id,
        string memory content,
        uint256 cost
    ) external {
        require(!items[id].used);
        items[id] = Item(msg.sender, cost, content, true);
        viewers[id][msg.sender] = true;
    }

    function buyItem(uint256 id) external {
        require(items[id].used);
        transferFrom(msg.sender, items[id].owner, items[id].cost);
        viewers[id][msg.sender] = true;
    }

    function viewItem(uint256 id) external view returns (string memory) {
        require(items[id].used);
        require(viewers[id][msg.sender]);
        return items[id].content;
    }
}
