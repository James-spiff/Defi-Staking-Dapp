import { useEthers } from "@usedapp/core"
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json" //this file contains a mapping that has our dappToken address
import { constants } from "ethers"
import brownieConfig from "../brownie-config.json"
import drank from "../drankToken1.png"
import eth from "../eth.png"
import dai from "../dai.png"
import { YourWallet } from "./yourWallet"
import { makeStyles } from "@material-ui/core"
import { TokenFarm } from "./TokenFarm"

export type Token = {
    image: string
    address: string
    name: string
}

const useStyles = makeStyles((theme) => ({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4)
    }
}))

export function Main() {
    //Show token values from the wallet
    //Get the address of the different tokens
    //get the balance of the users wallet
    //send the brownie-config to our src folder
    //send the build folder to our src folder

    //everything mentioned above was done in our update_front_end.py script

    const classes = useStyles()
    
    const { chainId } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"
    const dappTokenAddress = chainId ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero  //constants.AddressZero is a default address gotten from the package ethers.js
    const wethTokenAddress = chainId ? brownieConfig["networks"][networkName]["weth_token"] : constants.AddressZero
    const fauTokenAddress = chainId ? brownieConfig["networks"][networkName]["fau_token"] : constants.AddressZero

    const supportedTokens: Array<Token> = [
        {
            image: drank,
            address: dappTokenAddress,
            name: "DRANK"
        },
        {
            image: eth,
            address: wethTokenAddress,
            name: "WETH"
        },
        {
            image: dai,
            address: fauTokenAddress,
            name: "DAI"
        }
    ]
    return (
        <>
            <h2 className={classes.title}>Token Farm App</h2>
            <YourWallet supportedTokens={supportedTokens} />
            <TokenFarm supportedTokens={supportedTokens} />
        </>
    )
}


