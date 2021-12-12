from brownie import accounts, network, config, MockV3Aggregator, interface, Contract, MockDai, MockWeth

FORKED_LOCAL_ENVIRONMENTS = ["mainnet-fork", "mainnet-fork-dev"]    #a forked environment is a copy of a live blockchain on a mainnet that runs locally and can be interacted with the same way as a live mainnet blockchain
LOCAL_BLOCKCHAIN_ENVIRONMENTS = ["development", "ganache-local"]


def get_account(index=None, id=None):
    if index:
        return accounts[index]

    if id:
        return accounts.load(id)

    #below is the default accounts settings if none of the above are passed
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS or network.show_active() in FORKED_LOCAL_ENVIRONMENTS:
        return accounts[0]
    return accounts.add(config["wallets"]["from_key"])


contract_to_mock = {
    "eth_usd_price_feed": MockV3Aggregator,
    "dai_usd_price_feed": MockV3Aggregator, 
    "fau_token": MockDai,
    "weth_token": MockWeth
}



def get_contract(contract_name):
    """This function will grab the contract addresses from the brownie config if defined otherwise,
    it will deploy a mock version of the contract and return the mock contract.
        Args:
            contract_name (string)
        returns:
            The most recently deployed version of this contract.
    
    """

    contract_type = contract_to_mock[contract_name]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        if len(contract_type) <= 0: #if we don't have any deployed Mocks then deploy our Mocks
            deploy_mocks()
        contract = contract_type[-1]
    else:
        contract_address = config["networks"][network.show_active()][contract_name] #deploying the mock on a real network
        contract = Contract.from_abi(contract_type._name, contract_address, contract_type.abi)
    return contract

DECIMALS = 18
INITIAL_VALUE = 2000000000000000000

def deploy_mocks(decimals=DECIMALS, initial_value=INITIAL_VALUE):
    account = get_account()
    print(f"The active network is {network.show_active()}")
    print("Deploying Mocks...")
    mock_price_feed = MockV3Aggregator.deploy(decimals, initial_value, {"from": account})
    print(f"Deployed to {mock_price_feed.address}")

    print("Deploying Mock Dai")
    dai_token = MockDai.deploy({"from": account})
    print(f"Deployed to {dai_token.address}")
    print("Deploying Mock WETH")
    weth_token = MockWeth.deploy({"from": account})
    print(f"Deployed to {weth_token.address}")
    print("Deployed!")

def fund_with_link(contract_address, account=None, link_token=None, amount=100000000000000000): #0.1LINK token
    account = account if account else get_account() #returns account if account is true (in this case account is true if it is None) else calls the get_account function if the default is False
    link_token = link_token if link_token else get_contract("link_token")
    tx = link_token.transfer(contract_address, amount, {"from": account}) #this uses LinkToken contract in contracts/test
    #another way of performing the above transaction is by using interfaces 
    # link_token_contract = interface.LinkTokenInterface(config["networks"][network.show_active()]["link_token"])
    # tx = link_token_contract.transfer(contract_address, amount, {"from": account})
    tx.wait(1)
    print("Contract funded with LINK")
    return tx

    

        