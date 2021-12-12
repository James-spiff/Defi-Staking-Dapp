from brownie import network, exceptions
from scripts.helpful_scripts import get_account, get_contract, LOCAL_BLOCKCHAIN_ENVIRONMENTS, INITIAL_VALUE
from scripts.deploy import deploy_token_farm_and_dapp_token
import pytest

def test_set_price_feed_contract():
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = get_account(index=1) #get's a seperate account to test actions that are only accessable to owners
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    #Act
    price_feed_address = get_contract("eth_usd_price_feed")
    token_farm.setPriceFeedContract(dapp_token.address, price_feed_address, {"from": account})
    #Assert
    #the mapping created in our smart contract maps a specific price feed address to one of allowed tokens 
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address

    #test to see if a non owner can call this function
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(dapp_token.address, price_feed_address, {"from": non_owner})
        #if this passesit means non owners can't call this function


def test_stake_tokens(amount_staked):
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    #Act
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})
    #Assert
    assert token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked  #checks if our amount staked has been recorded in the stakingBalance mapping of our contract
    assert token_farm.uniqueTokensStaked(account.address) == 1  #since we've only staked one type of token this should pass
    assert token_farm.stakers(0) == account.address #as the 1st staker my address should be the 1st in the stakers list
    return token_farm, dapp_token   #this will allow us to use this test in other tests


def test_issue_tokens(amount_staked):
    #Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address) 
    #Act
    token_farm.issueTokens({"from": account})
    #Assert
    assert dapp_token.balanceOf(account.address) == starting_balance + INITIAL_VALUE