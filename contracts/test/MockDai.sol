//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//This a mock version of our Dai/faucet token we'll use for testing in development
contract MockDai is ERC20 {
    constructor() public ERC20("Mock DAI", "DAI") {
        
    }
}