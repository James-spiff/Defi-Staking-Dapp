import React, { useState, useEffect } from 'react'
import { useEthers, useContractFunction } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"  //chain-info directory was created and exported using our update_front_end.py script
import ERC20 from "../chain-info/contracts/MockERC20.json"
import networkMapping from "../chain-info/deployments/map.json"
import { Contract } from "@ethersproject/contracts"
import { constants, utils } from "ethers"

export const useStakeTokens = (tokenAddress: string) => {

    //here we call some function from our smart contract which are:
    //approve which will need the address, abi, chainId
    //stakeTokens
    const { chainId } = useEthers()

    //Retrieving our TokenFarm Contract
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)

    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)
    //now we have access to our contract and we can start calling functions from it

    //Retrieving our ERC20 Contract
    const erc20ABI = ERC20.abi
    const erc20Interface = new utils.Interface(erc20ABI)
    const erc20Contract = new Contract(tokenAddress, erc20Interface) //This get's it's token address from our wallet

    const { send: approveErc20Send, state: approveAndStakeErc20State } = useContractFunction(erc20Contract, "approve", {transactionName: "Approve ERC20 transfer"})
    //we call functions on contracts with react using the useContractFunction hook it takes in the contract, the function we want to call as a string and a transaction name 
    // the above hook has 2 states the "send" state which is a function that reps the action we'll use to send the transtaction and "state" which is the current state of our hook
    const approveAndStake = (amount: string) => {
        setAmountToStake(amount)
        return approveErc20Send(tokenFarmAddress, amount)
    } // the approve function above calls the approveErc20Send function with the necessary parameters needed

    const { send: stakeSend, state: stakeState } = useContractFunction(tokenFarmContract, "stakeTokens", {transactionName: "Stake Tokens"})

    const [amountToStake, setAmountToStake] = useState("0")

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            stakeSend(amountToStake, tokenAddress)  //This stakes the amount you've inputed
        }
    }, [approveAndStakeErc20State, amountToStake, tokenAddress])   //This tracks the state of the approveErc20Send variable or any variable within the [] brackets and if it changes it triggers the function

    const [state, setState] = useState(approveAndStakeErc20State)

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveAndStakeErc20State)
        }
    }, [approveAndStakeErc20State, stakeState])

    return { approveAndStake, state }

}
