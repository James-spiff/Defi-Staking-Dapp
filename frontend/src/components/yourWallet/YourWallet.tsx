import React, { useState } from "react"
import { Token } from "../Main"
import { Box, Tab, makeStyles } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { WalletBalance } from "./WalletBalance"
import { StakeForm } from "./StakeForm"
import { useEthers } from "@usedapp/core"
import { ConnectionRequiredMsg } from "../ConnectionRequiredMsg"

interface YourWalletProps {
    supportedTokens: Array<Token>
}

const useStyles = makeStyles((theme) => ({
    tabContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(4)
    },
    box: {
        backgroundColor: "white",
        borderRadius: "25px",
    },
    header: {
        color: "white"
    }
}))

export const YourWallet = ({ supportedTokens }: YourWalletProps) => {
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    } //this handles the change in state of our tabs depending on which token we select

    const classes = useStyles()
    
    const { account } = useEthers()
    const isConnected = account !== undefined 

    return (
        <Box>
            <h1 className={classes.header}>Your Wallet!</h1>
            <Box className={classes.box}>
                <div>
                    { isConnected ? (
                        <TabContext value={selectedTokenIndex.toString()}>
                            <TabList onChange={handleChange} aria-label="stake form tabs">
                                {supportedTokens.map((token, index)=> {
                                    return (
                                        <Tab 
                                            label={token.name}
                                            value={index.toString()}
                                            key={index}
                                        />
                                    )
                                })}
                            </TabList>
                            {supportedTokens.map((token, index) => {
                                return (
                                    <TabPanel value={index.toString()} key={index}>
                                        <div className={classes.tabContent}>
                                            {/* in here we display 2 things: our wallet balance and a stake button */}
                                            <WalletBalance token={supportedTokens[selectedTokenIndex]} />
                                            <StakeForm token={supportedTokens[selectedTokenIndex]} /> 

                                        </div>
                                    </TabPanel>
                                )
                            })}
                        </TabContext>
                    ) : (
                        <ConnectionRequiredMsg />
                    )}
                </div>
            </Box>
        </Box>
    )
}
