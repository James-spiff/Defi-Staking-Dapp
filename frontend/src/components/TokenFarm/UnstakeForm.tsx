import React, { useState, useEffect } from 'react'
import { Button, CircularProgress, Snackbar, makeStyles, ThemeProvider } from "@material-ui/core"
import { Token } from "../Main"
import { useEthers, useNotifications } from '@usedapp/core'
import { useUnStaketokens } from '../../hooks/useUnStaketokens'
import { useStakingBalance } from '../../hooks/useStakingBalance'
import { Alert } from "@material-ui/lab"
import { BalanceMsg } from '../BalanceMsg'
import { formatUnits } from '@ethersproject/units'

interface UnstakeFormProps {
    token: Token
}

const useStyles = makeStyles((theme) => ({
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: theme.spacing(2)
    }
}))


export const UnstakeForm = ({ token }: UnstakeFormProps) => {

    const { image, address: tokenAddress, name } = token 
    const { account } = useEthers()

    const stakedBalance = useStakingBalance(tokenAddress)
    const formattedBalance: number = stakedBalance ? parseFloat(formatUnits(stakedBalance, 18)) : 0
    const { notifications } = useNotifications()

    const { send: unStakeSend, state: unStakeState } = useUnStaketokens(tokenAddress)

    const handleSubmit = () => {
        return unStakeSend(tokenAddress)
    }

    const [showUnStakeSuccess, setShowUnStakeSuccess] = useState(false)

    const handleClosedSnack = () => {
        setShowUnStakeSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) => 
                notification.type === "transactionSucceed" && notification.transactionName === "Unstake tokens").length > 0
        ) {
            !showUnStakeSuccess && setShowUnStakeSuccess(true)
        }
    }, [notifications, showUnStakeSuccess])

    const isMining = unStakeState.status === "Mining"
    const classes = useStyles()

    return (
        <>
            <>
                <BalanceMsg 
                    label={`Your stacked ${name} balance`}
                    tokenImgSrc={image}
                    amount={formattedBalance}
                />

                <Button
                    onClick={handleSubmit}
                    color="primary"
                    size="large"
                    disabled={isMining}
                    variant="contained"
                >
                    { isMining ? <CircularProgress size={26} /> : `Unstake all ${name}?` }
                </Button>
            </>
            <Snackbar
                open={showUnStakeSuccess}
                autoHideDuration={5000}
                onClose={handleClosedSnack}
            >
                <Alert onClose={handleClosedSnack} severity="success">
                    Tokens unstaked successfully!
                </Alert>
            </Snackbar>
        </>
    )
}
