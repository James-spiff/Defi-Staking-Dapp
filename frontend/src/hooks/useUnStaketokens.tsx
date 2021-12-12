import React from 'react'
import { useEthers, useContractFunction } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
import { Contract } from "@ethersproject/contracts"
import { constants, utils } from "ethers"

export const useUnStaketokens = (tokenAddress: string) => {

    const { chainId } = useEthers()

    //Retrieving our TokenFarm Contract
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)

    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    // const { send: unStakeSend } = useContractFunction(tokenFarmContract, "unstakeTokens", {transactionName: "Unstake Tokens"})

    // return unStakeSend(tokenAddress)
    return useContractFunction(tokenFarmContract, "unstakeTokens", {transactionName: "Unstake tokens"})
    
}
