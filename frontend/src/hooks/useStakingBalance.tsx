//This displays the amount we have staked
import { useContractCall, useEthers } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import { utils, BigNumber, constants } from "ethers"
import networkMapping from "../chain-info/deployments/map.json"



export const useStakingBalance = (address: string): BigNumber | undefined => {

    const { account, chainId } = useEthers()

    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero

    const tokenFarmInterface = new utils.Interface(abi)

    const [stakingBalance] = useContractCall({
        abi: tokenFarmInterface,
        address: tokenFarmAddress,
        method: "stakingBalance",
        args: [address, account],
    }) ?? []    //The ?? [] removed an error for some reason

    return stakingBalance
}
