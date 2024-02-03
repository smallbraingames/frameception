// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract DeployTest is BaseTest {
    function test_CreateCollection() external {
        address owner = address(0xcafe);
        string memory tokenURI = "https://example.com/";
        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);
    }

    function testFuzz_CreateCollection(address owner, string memory tokenURI) external {
        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);
    }
}
