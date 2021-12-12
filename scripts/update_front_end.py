from scripts.deploy import update_front_end

#helps us to run the update_front_end function only in deploy.py without deploying the smart contracts
def main():
    update_front_end()