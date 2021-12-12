import React from 'react'
import { Token } from "../Main"
import { useEthers, useTokenBalance } from '@usedapp/core'
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from '../BalanceMsg'

export interface WallentBalanceProps {
    token: Token
}

export const WalletBalance = ({token}: WallentBalanceProps) => {

    const { image, address, name } = token
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(address, account)
    //console.log(tokenBalance?.toString())
    const formatedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0   //converts our balance from wei

    return (
        <BalanceMsg
            label={`Your un-stacked ${name} balance`}
            tokenImgSrc={image}
            amount={formatedTokenBalance} />
    )
}
