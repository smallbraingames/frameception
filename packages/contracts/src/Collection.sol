// SPDX-License-Identifier: MIT
pragma solidity >=0.8.23;

import { Info } from "./Info.sol";
import { Owned } from "solmate/auth/Owned.sol";
import { ERC1155 } from "solmate/tokens/ERC1155.sol";
import { LibString } from "solmate/utils/LibString.sol";

contract Collection is ERC1155, Owned {
    // ======= ERRORS ========

    error NotCreated();
    error AlreadyCreated();
    error ZeroAddressCreator();
    error ZeroSupply();
    error MintedOut();

    // ======= STATE ========

    string public baseURI;
    mapping(uint256 => Info) public infoOf;
    uint256 public lastId = 0;

    constructor(address owner, string memory tokenURI) Owned(owner) {
        baseURI = tokenURI;
    }

    // ======= PUBLIC FUNCTIONS ========

    function uri(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, LibString.toString(id)));
    }

    function create(address creator, uint256 supply) public onlyOwner returns (uint256) {
        uint256 id = lastId + 1;
        Info storage info = infoOf[id];
        if (info.supply != 0 || info.minted != 0 || info.creator != address(0)) {
            revert AlreadyCreated();
        }
        if (creator == address(0)) {
            revert ZeroAddressCreator();
        }
        if (supply == 0) {
            revert ZeroSupply();
        }
        infoOf[id].creator = creator;
        infoOf[id].supply = supply;
        mint(creator, id);
        lastId = id;
        return id;
    }

    function mint(address account, uint256 id) public onlyOwner {
        Info storage info = infoOf[id];
        if (info.creator == address(0)) {
            revert NotCreated();
        }
        if (info.minted >= info.supply) {
            revert MintedOut();
        }
        info.minted += 1;
        _mint(account, id, 1, bytes(""));
    }
}
