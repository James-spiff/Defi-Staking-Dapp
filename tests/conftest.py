import pytest
from web3 import Web3 

#pytest runs this whenever we run a test so there is no need to import this
@pytest.fixture
def amount_staked():
    return Web3.toWei(1, 'ether')