// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract OwnedTest is BaseTest {
    function test_TransferOwnership() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        address secondOwner = address(0xacef);
        vm.expectRevert("UNAUTHORIZED");
        collection.transferOwnership(secondOwner);

        vm.prank(owner);
        collection.transferOwnership(secondOwner);

        assertEq(collection.owner(), secondOwner);
    }

    function testFuzz_TransferOwnership(
        address owner,
        address nonOwner,
        address secondOwner,
        string memory tokenURI
    )
        external
    {
        vm.assume(owner != nonOwner);
        vm.assume(owner != secondOwner);

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        vm.prank(nonOwner);
        vm.expectRevert("UNAUTHORIZED");
        collection.transferOwnership(secondOwner);

        vm.prank(owner);
        collection.transferOwnership(secondOwner);

        assertEq(collection.owner(), secondOwner);
    }

    function test_OnlyOwnerCreates() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        address creator = address(0xdead);
        uint256 supply = 10;
        vm.expectRevert("UNAUTHORIZED");
        collection.create(creator, supply);

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);
        assertEq(cCreator, creator);
        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
    }

    function testFuzz_OnlyOwnerCreates(
        address owner,
        address nonOwner,
        address creator,
        uint256 supply,
        string memory tokenURI
    )
        external
    {
        assumeValidPayableAddress(owner);
        assumeValidPayableAddress(nonOwner);
        assumeValidPayableAddress(creator);
        vm.assume(owner != nonOwner);
        vm.assume(owner != creator);
        vm.assume(creator != address(0));
        vm.assume(supply > 0);

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        vm.prank(nonOwner);
        vm.expectRevert("UNAUTHORIZED");
        collection.create(creator, supply);

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);
        assertEq(cCreator, creator);
        assertEq(cSupply, supply);
        assertEq(cMinted, 1);
    }

    function test_OnlyOwnerMints() public {
        address owner = address(0xface);
        string memory tokenURI = "https://example.com/";

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        address creator = address(0xbeef);
        uint256 supply = 10;

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        address minter = address(0xdead);
        vm.expectRevert("UNAUTHORIZED");
        collection.mint(minter, id);

        vm.prank(owner);
        collection.mint(minter, id);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);
        assertEq(cCreator, creator);
        assertEq(cSupply, supply);
        assertEq(cMinted, 2);
        assertEq(collection.balanceOf(minter, id), 1);
        assertEq(collection.balanceOf(creator, id), 1);
    }

    function testFuzz_OnlyOwnerMints(
        address owner,
        address nonOwner,
        address creator,
        address minter,
        uint256 supply,
        string memory tokenURI
    )
        external
    {
        assumeValidPayableAddress(owner);
        assumeValidPayableAddress(nonOwner);
        assumeValidPayableAddress(creator);
        assumeValidPayableAddress(minter);
        vm.assume(owner != nonOwner);
        vm.assume(owner != creator);
        vm.assume(owner != minter);
        vm.assume(creator != address(0));
        vm.assume(minter != address(0));
        vm.assume(supply > 1);

        Collection collection = new Collection(owner, tokenURI);
        assertEq(collection.owner(), owner);

        vm.prank(owner);
        uint256 id = collection.create(creator, supply);

        vm.prank(nonOwner);
        vm.expectRevert("UNAUTHORIZED");
        collection.mint(minter, id);

        vm.prank(owner);
        collection.mint(minter, id);

        (uint256 cSupply, uint256 cMinted, address cCreator) = collection.infoOf(id);
        assertEq(cCreator, creator);
        assertEq(cSupply, supply);
        assertEq(cMinted, 2);
        assertEq(collection.balanceOf(minter, id), 1);
        assertEq(collection.balanceOf(creator, id), 1);
    }
}
