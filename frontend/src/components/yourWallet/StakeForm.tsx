import React, { useState, useEffect } from 'react'  //useEffect calls a function during a state change
import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { Button, Input, CircularProgress, Snackbar } from '@material-ui/core' //Snackbar is used for notifications or alerts
import { Alert } from '@material-ui/lab'
import { useStakeTokens } from "../../hooks/useStakeTokens"
import { utils } from "ethers"

interface StakeFormProps {
    token: Token 
}

export const StakeForm = ({ token }: StakeFormProps) => {
    
    const { address: tokenAddress, name } = token 
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formatedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
    const { notifications } = useNotifications()

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0) //we want to keep track of the amounts we have and it's changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value) //this if event.target.value is empty (i.e "") set it to empty (i.e "") else make it an integer
        setAmount(newAmount) 
        console.log(newAmount)
    }

    const {approveAndStake, state: approveAndStakeErc20State} = useStakeTokens(tokenAddress)
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }   //This function triggers our approve function and connects us with metamask whit we click on the Stake button

    const isMining = approveAndStakeErc20State.status === "Mining"

    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showStakeTokenSuccess, setShowStakeTokenSuccess] = useState(false)

    const handleClosedSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setShowStakeTokenSuccess(false)
    }   //set's the states back to their default value after they have ran successfully

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" && notification.transactionName === "Approve ERC20 transfer").length > 0) {
                    setShowErc20ApprovalSuccess(true)
                    setShowStakeTokenSuccess(false)
                }
        if (notifications.filter(
            (notification) => 
                notification.type === "transactionSucceed" && notification.transactionName === "Stake Tokens").length > 0) {
                    setShowErc20ApprovalSuccess(false)
                    setShowStakeTokenSuccess(true)
                }
    }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess]) //This notifies the user when he approves and stakes his token

    return (
        <>
            <>
                <Input onChange={handleInputChange} />
                <Button
                    onClick={handleStakeSubmit}
                    color="primary"
                    size="large"
                    disabled={isMining}
                    variant="contained"
                >
                    { isMining ? <CircularProgress size={26} /> : "STAKE!" }
                </Button>
            </>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleClosedSnack}
            >
                <Alert onClose={handleClosedSnack} severity="success">
                    ERC-20 token transfer approved! Waiting on the 2nd transaction
                </Alert>
            </Snackbar>

            <Snackbar
                open={showStakeTokenSuccess}
                autoHideDuration={5000}
                onClose={handleClosedSnack}
            >
                <Alert onClose={handleClosedSnack} severity="success">
                    Tokens Staked!
                </Alert>
            </Snackbar>
        </>
    )
}
