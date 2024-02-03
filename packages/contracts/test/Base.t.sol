// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { Test } from "forge-std/Test.sol";

contract BaseTest is Test {
    function assumeValidPayableAddress(address addr) internal {
        vm.assume(
            addr != address(0xCe71065D4017F316EC606Fe4422e11eB2c47c246)
                && addr != address(0x4e59b44847b379578588920cA78FbF26c0B4956C)
                && addr != address(0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84)
                && addr != address(0x185a4dc360CE69bDCceE33b3784B0282f7961aea)
                && addr != address(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D) && addr > address(0x9)
        );
        assumePayable(addr);
    }
}
