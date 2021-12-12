from brownie import TokenFarm, DappToken, config, network
from scripts.helpful_scripts import get_account, get_contract
from web3 import Web3
import yaml
import json
import os, shutil

KEPT_BALANCE = Web3.toWei(100, "ether")

def deploy_token_farm_and_dapp_token(front_end_update=False):
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(dapp_token.address, {"from": account}, publish_source=config["networks"][network.show_active()].get("verify", False))
    #transfer most of our available DRANK tokens to the TokenFarm contract
    tx = dapp_token.transfer(
        token_farm.address, 
        dapp_token.totalSupply() - KEPT_BALANCE, 
        {"from": account}
        )
    tx.wait(1)
    #for now the tokens we'll allow are:
    #dapp_token, weth_token, fau_token (faucet token a token similar to dai for testing)
    weth_token = get_contract("weth_token") #get's the contract directly from our config or mocks and deploys it
    fau_token = get_contract("fau_token")
    dict_of_allowed_tokens = {
        dapp_token: get_contract("dai_usd_price_feed"),
        fau_token: get_contract("dai_usd_price_feed"),
        weth_token: get_contract("eth_usd_price_feed")
    }
    add_allowed_tokens(token_farm, dict_of_allowed_tokens, account)
    if front_end_update:
        update_front_end()
    return token_farm, dapp_token


def add_allowed_tokens(token_farm, dict_of_allowed_tokens, account):
    for token in dict_of_allowed_tokens:
        add_tx = token_farm.addAllowedTokens(token.address, {"from": account})
        add_tx.wait(1)
        set_price_tx = token_farm.setPriceFeedContract(token.address, dict_of_allowed_tokens[token], {"from": account})
        set_price_tx.wait(1)
    return token_farm


def update_front_end():
    #to access our config.yaml file in the frontend(react) we need to convert it to JSON and send it to our frontend/src folder
    copy_folders_to_front_end("./build", "./frontend/src/chain-info")
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
        with open("./frontend/src/brownie-config.json", "w") as brownie_config_json: 
            json.dump(config_dict, brownie_config_json)
    print("Frontend updated!")


def copy_folders_to_front_end(src, dest):
    #the statement below deletes a folder if the path already exsists and copies a the same folder from it's source over to the destination
    #in this case we are copying our buld folder over
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def main():
    deploy_token_farm_and_dapp_token(front_end_update=True)