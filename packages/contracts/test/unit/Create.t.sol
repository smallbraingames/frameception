// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract CreateTest is BaseTest {
    function test_CreateToken() public {
        address owner = address(0xface);
        vm.deal(owner, 1 ether);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 20;

        vm.prank(owner);
        uint256 id = collection.create{ value: 1 ether }(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);

        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
        assertEq(cCreator, creator);
    }

    function test_URI() public {
        address owner = address(0xface);
        vm.deal(owner, 1 ether);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 20;

        vm.prank(owner);
        uint256 id = collection.create{ value: 1 ether }(creator, supply);

        assertEq(collection.uri(id), "https://example.com/1");
        assertEq(collection.uri(1), "https://example.com/1");
        assertEq(collection.uri(2), "https://example.com/2");
        assertEq(collection.uri(3), "https://example.com/3");
        assertEq(collection.uri(4), "https://example.com/4");
        assertEq(collection.uri(1_001_010), "https://example.com/1001010");
    }

    function testFuzz_CreateToken(address owner, string memory tokenURI, address creator, uint256 supply) external {
        assumeValidPayableAddress(owner);
        assumeValidPayableAddress(creator);
        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        vm.assume(creator != address(collection));
        vm.assume(creator != owner);

        supply = bound(supply, 20, 10_000);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        vm.deal(owner, 1 ether);
        vm.prank(owner);
        uint256 id = collection.create{ value: 1 ether }(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);

        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
        assertEq(cCreator, creator);
    }

    function test_RevertsWhen_ZeroSupply() public {
        address owner = address(0xface);
        vm.deal(owner, 1 ether);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 0;

        vm.prank(owner);
        vm.expectRevert(Collection.ZeroSupply.selector);
        collection.create{ value: 1 ether }(creator, supply);
    }

    function test_RevertsWhen_ZeroAddressCreator() public {
        address owner = address(0xface);
        vm.deal(owner, 1 ether);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0);
        uint256 supply = 10;

        vm.prank(owner);
        vm.expectRevert(Collection.ZeroAddressCreator.selector);
        collection.create{ value: 1 ether }(creator, supply);
    }

    function test_IncrementsIds() public {
        address owner = address(0xface);
        vm.deal(owner, 1 ether);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 10;

        vm.prank(owner);
        uint256 id = collection.create{ value: 1 ether }(creator, supply);
        assertEq(id, 1);

        vm.prank(owner);
        id = collection.create{ value: 1 ether }(creator, supply);
        assertEq(id, 2);

        vm.prank(owner);
        id = collection.create{ value: 1 ether }(creator, supply);
        assertEq(id, 3);

        vm.prank(owner);
        id = collection.create{ value: 1 ether }(creator, supply);
        assertEq(id, 4);
    }
}
