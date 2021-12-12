//SPDX-License-Identifier: MIT
//This is the token given to users that stake on our platform
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DappToken is ERC20 {
    constructor() public ERC20("Drank Token", "DRANK") {
        _mint(msg.sender, 1000000000000000000000000);    //reps the initial balance which is one million of our token
    }
}