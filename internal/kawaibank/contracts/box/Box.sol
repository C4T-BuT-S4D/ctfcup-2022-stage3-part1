// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./IBox.sol";

contract Box is IBox {
    string private _name;

    constructor() {
        _disableInitializers();
    }

    function init() external override initializer {
        OwnableUpgradeable.__Ownable_init();
        _name = "KawaiBox";
    }

    function _stringsEquals(string memory s1, string memory s2)
        private
        pure
        returns (bool)
    {
        bytes memory b1 = bytes(s1);
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i = 0; i < l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    function supportsInterface(bytes4 interfaceId)
        external
        pure
        returns (bool)
    {
        return
            interfaceId == type(IERC721Upgradeable).interfaceId ||
            interfaceId == type(IERC721MetadataUpgradeable).interfaceId ||
            interfaceId == type(IERC165Upgradeable).interfaceId;
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _name;
    }

    mapping(uint256 => string) private datas;
    mapping(uint256 => string) private keys;
    mapping(address => uint256) private balances;
    mapping(uint256 => address) private owners;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;

    function allowed(uint256 _tokenId, address who)
        private
        view
        returns (bool)
    {
        return
            owners[_tokenId] == who ||
            operatorApprovals[owners[_tokenId]][who] ||
            tokenApprovals[_tokenId] == who;
    }

    event Exterminated(uint256 tokenId);

    function exterminateBox(uint256 _tokenId, bytes memory data) private {
        address boxOwner = owners[_tokenId];
        delete owners[_tokenId];
        balances[boxOwner] -= 1;
        delete tokenApprovals[_tokenId];
        (bool success, ) = msg.sender.call(
            abi.encodeWithSelector(
                IBoxOwner.boxExterminated.selector,
                _tokenId,
                data
            )
        );
        if (success) {
            emit Exterminated(_tokenId);
        }
    }

    event Materialized(uint256 tokenId);

    function materializeBox(
        uint256 _tokenId,
        address _owner,
        string memory _data,
        string memory _key,
        bytes memory data
    ) private {
        owners[_tokenId] = _owner;
        datas[_tokenId] = _data;
        keys[_tokenId] = _key;
        balances[_owner] += 1;
        (bool success, ) = msg.sender.call(
            abi.encodeWithSelector(
                IBoxOwner.boxMaterialized.selector,
                _tokenId,
                data
            )
        );
        if (success) {
            emit Materialized(_tokenId);
        }
    }

    function mint(
        uint256 _tokenId,
        string memory _data,
        string memory _key
    ) external {
        require(owners[_tokenId] == address(0));
        materializeBox(_tokenId, msg.sender, _data, _key, "");
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(allowed(tokenId, msg.sender));
        return datas[tokenId];
    }

    function tokenURI(uint256 tokenId, string calldata key)
        external
        view
        returns (string memory)
    {
        require(
            allowed(tokenId, msg.sender) || _stringsEquals(keys[tokenId], key)
        );
        return datas[tokenId];
    }

    function balanceOf(address owner) external view returns (uint256 balance) {
        return balances[owner];
    }

    function ownerOf(uint256 tokenId) external view returns (address owner) {
        return owners[tokenId];
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        bytes memory _data
    ) public {
        require(owners[_tokenId] == _from);
        require(_from == _to || allowed(_tokenId, msg.sender));
        string memory data = datas[_tokenId];
        string memory key = keys[_tokenId];
        exterminateBox(_tokenId, _data);
        materializeBox(_tokenId, _to, data, key, _data);
    }

    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        safeTransferFrom(from, to, tokenId);
    }

    function approve(address to, uint256 tokenId) external {
        require(
            owners[tokenId] == msg.sender ||
                operatorApprovals[owners[tokenId]][msg.sender]
        );
        tokenApprovals[tokenId] = to;
    }

    function setApprovalForAll(address operator, bool _approved) external {
        operatorApprovals[msg.sender][operator] = _approved;
    }

    function getApproved(uint256 tokenId)
        external
        view
        returns (address operator)
    {
        return tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator)
        external
        view
        returns (bool)
    {
        return operatorApprovals[owner][operator];
    }
}
