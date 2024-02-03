// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract DeployTest is BaseTest {
    function test_Mint() public {
        address owner = address(0xcafe);
        string memory tokenURI = "https://example.com/";
        Collection collection = new Collection(owner, tokenURI);

        vm.prank(owner);
        uint256 id = collection.create(owner, 10);

        vm.prank(owner);
        collection.mint(owner, id);

        (, uint256 cMinted,) = collection.infoOf(id);

        assertEq(cMinted, 2);

        assertEq(collection.balanceOf(owner, id), 2);
    }

    function test_RevertsWhen_MintsPastSupply() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        address creator = address(0xdead);
        uint256 supply = 1;

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        vm.prank(owner);
        vm.expectRevert(Collection.MintedOut.selector);
        collection.mint(creator, id);
    }

    function testFuzz_RevertsWhen_MintsPastSupply(
        address owner,
        string memory tokenURI,
        address creator,
        uint256 supply
    )
        external
    {
        assumeValidPayableAddress(owner);
        assumeValidPayableAddress(creator);
        supply = bound(supply, 1, 400);
        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);
        assertEq(collection.baseURI(), tokenURI);

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        for (uint256 i = 0; i < supply - 1; i++) {
            vm.prank(owner);
            collection.mint(creator, id);
        }

        vm.prank(owner);
        vm.expectRevert(Collection.MintedOut.selector);
        collection.mint(creator, id);
    }
}
