//SPDX-License-Identifier: MIT
//We want this contrack to be able to:
//- stake tokens, unStake tokens, issue tokens(which is a reward given to users for using our platform), added allowed tokens, get value of tokens in the platform
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    address[] public allowedTokens;
    //A mapping is created to map the token address to another mapping which maps -> staker(user) address to -> amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    address[] public stakers; //list of users
    mapping(address => uint256) public uniqueTokensStaked; //let's us know how many different tokens each user has
    IERC20 public dappToken;
    mapping(address => address) public tokenPriceFeedMapping; //maps the token address to it's associated price feed address
    
    constructor(address _dappTokenAddress) public {
        dappToken = IERC20(_dappTokenAddress);
    } //Our constructor get's the address of the dapp token we deployed


    //function to set our price feed
    function setPriceFeedContract(address _token, address _priceFeed) public onlyOwner {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }


    function stakeTokens(uint256 _amount, address _token) public {
        //what tokens can we stake?
        //how much can be staked?
        require(_amount > 0, "Amount must be more than 0"); //minimum amount that can be staked
        require(tokenIsAllowed(_token), "Token is currently not supported");
        //Call the transferFrom function on the ERC20
        //transferFrom is used when we want a user that is not us to transfer tokens if we are doing it directly from our wallet then we only need the transfer function
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);    //This means we are transfering from the user calls this function (i.e msg.sender) to the our TokenFarm Contract (i.e address(this))
        updateUniqueTokensStaked(msg.sender, _token);   
        stakingBalance[_token][msg.sender] = stakingBalance[_token][msg.sender] + _amount;
        if (uniqueTokensStaked[msg.sender] == 1) {
            stakers.push(msg.sender);
        } //this is how we add new users into the stakers list
    }


    //*It is more cost/gas effective to use air drops to issue tokens than doing it directly from our contract 
    function issueTokens() public onlyOwner {
        //Issue tokens to all stakers
        for (uint256 stakersIndex=0; stakersIndex < stakers.length; stakersIndex++) {
            address recipient = stakers[stakersIndex];
            //we send each user a token reward based on their total value locked
            uint256 userTotalValue = getUserTotalValue(recipient);
            dappToken.transfer(recipient, userTotalValue);  //transfers the token as a reward for using our platform going at the rate of 1 DRANK per 1 token staked by the user
        }
    }


    function getUserTotalValue(address _user) public view returns (uint256){
        uint256 totalValue = 0;
        require(uniqueTokensStaked[_user] > 0, "No tokens staked!");
        for (uint256 allowedTokensIndex=0; allowedTokensIndex < allowedTokens.length; allowedTokensIndex++) {
            totalValue = totalValue + getUserSingleTokenValue(_user, allowedTokens[allowedTokensIndex]);
        }
        return totalValue;
    }


    //function to get the value of a single token for a user
    function getUserSingleTokenValue(address _user, address _token) public view returns (uint256) {
        //the value would be returned in dai/dollars
        if (uniqueTokensStaked[_user] <=0) {
            return 0;
        }
        //we need to get the price of the token and * it by the stakingBalance[_token][user]
        (uint256 price, uint256 decimals) = getTokenValue(_token);
        return (stakingBalance[_token][_user] * price / 10**decimals);
    }


    //function to get the value of a token in dai
    function getTokenValue(address _token) public view returns (uint256, uint256) {
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
        (,int256 price,,,) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    //This function gives us the amount of unique tokens a user has
    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    } 


    function addAllowedTokens(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    function tokenIsAllowed(address _token) public returns (bool) {
        for ( uint256 allowedTokensIndex=0; allowedTokensIndex < allowedTokens.length; allowedTokensIndex++) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }
        return false;
    }

    //function to unstake our tokens
    function unstakeTokens(address _token) public {
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "You don't have any tokens staked");
        IERC20(_token).transfer(msg.sender, balance);
        stakingBalance[_token][msg.sender] = 0;
        //Check if this is vulnerable to REentrancy attacks
        uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;
        //remove stakers from the stakers list if they've unstaked all their balance
    }
}