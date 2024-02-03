// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract CreateTest is BaseTest {
    function test_CreateToken() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 10;

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);

        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
        assertEq(cCreator, creator);
    }

    function testFuzz_CreateToken(address owner, string memory tokenURI, address creator, uint256 supply) external {
        assumeValidPayableAddress(owner);
        assumeValidPayableAddress(creator);
        vm.assume(supply > 0);
        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);

        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
        assertEq(cCreator, creator);
    }

    function test_RevertsWhen_ZeroSupply() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 0;

        vm.prank(owner);
        vm.expectRevert(Collection.ZeroSupply.selector);
        collection.create(creator, supply);
    }

    function test_RevertsWhen_ZeroAddressCreator() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0);
        uint256 supply = 10;

        vm.prank(owner);
        vm.expectRevert(Collection.ZeroAddressCreator.selector);
        collection.create(creator, supply);
    }

    function test_IncrementsIds() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 10;

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);
        assertEq(id, 1);

        vm.prank(owner);
        id = collection.create(creator, supply);
        assertEq(id, 2);

        vm.prank(owner);
        id = collection.create(creator, supply);
        assertEq(id, 3);

        vm.prank(owner);
        id = collection.create(creator, supply);
        assertEq(id, 4);
    }
}
