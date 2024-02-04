// SPDX-License-Identifier: MIT
pragma solidity >=0.8.23;

import { Info } from "./Info.sol";
import { Owned } from "solmate/auth/Owned.sol";
import { ERC1155 } from "solmate/tokens/ERC1155.sol";
import { LibString } from "solmate/utils/LibString.sol";

contract Collection is ERC1155, Owned {
    // ======= EVENTS ========
    event Created(address indexed creator, uint256 indexed id, uint256 supply);

    // ======= ERRORS ========

    error NotCreated();
    error AlreadyCreated();
    error ZeroAddressCreator();
    error ZeroSupply();
    error MintedOut();
    error NotEnoughValue();
    error SupplyLessThanTen();

    // ======= STATE ========

    string public baseURI;
    mapping(uint256 => Info) public infoOf;
    uint256 public lastId = 0;
    uint256 pricePerSupply;

    constructor(address owner, string memory _baseURI, uint256 _pricePerSupply) Owned(owner) {
        baseURI = _baseURI;
        pricePerSupply = _pricePerSupply;
    }

    // ======= PUBLIC FUNCTIONS ========

    function uri(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, LibString.toString(id)));
    }

    function create(address creator, uint256 supply) public payable returns (uint256) {
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
        if (supply < 10) {
            revert SupplyLessThanTen();
        }
        if (msg.value < (supply * pricePerSupply)) {
            revert NotEnoughValue();
        }

        info.creator = creator;
        info.supply = supply;
        info.minted = 1;
        lastId = id;

        _mint(creator, id, 1, bytes(""));
        payable(owner).transfer(msg.value);

        emit Created(creator, id, supply);
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
