// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract URITest is BaseTest {
    function test_URI() external {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        vm.prank(owner);
        uint256 id = collection.create(owner, 10);
        assertEq(collection.uri(id), "https://example.com/1");
    }
}
