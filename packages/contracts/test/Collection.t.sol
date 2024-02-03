// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Test } from "forge-std/Test.sol";

import { Collection } from "../src/Collection.sol";
import { Info } from "../src/Info.sol";

contract CollectionTest is Test {
    function test_CreateContract() external {
        address owner = address(0xcafe);
        string memory tokenURI = "https://example.com/";
        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);
    }
}
