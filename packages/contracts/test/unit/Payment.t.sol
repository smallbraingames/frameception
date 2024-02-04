// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import { Collection } from "../../src/Collection.sol";
import { Info } from "../../src/Info.sol";
import { BaseTest } from "../Base.t.sol";

contract PaymentTest is BaseTest {
    function test_AcceptsPayment() public {
        address owner = address(0xcafe);
        string memory tokenURI = "https://example.com/";
        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);

        address creator = address(0xdeaf);
        vm.deal(creator, 1 ether);
        uint256 supply = 10;
        uint256 prevBalance = address(owner).balance;

        vm.prank(creator);
        collection.create{ value: 1 ether }(creator, supply);

        assertEq(address(owner).balance, prevBalance + 1 ether);
    }

    function test_RevertsWhen_NotEnoughPayment() public {
        address owner = address(0xcafe);
        string memory tokenURI = "https://example.com/";
        Collection collection = new Collection(owner, tokenURI, 0.0001 ether);

        address creator = address(0xdeaf);
        vm.deal(creator, 1 ether);
        uint256 supply = 10;

        vm.prank(creator);
        vm.expectRevert(Collection.NotEnoughValue.selector);
        collection.create{ value: 0.0001 ether }(creator, supply);
    }
}
