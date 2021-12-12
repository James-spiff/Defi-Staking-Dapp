import React, { useState } from 'react'
import { Token } from "../Main"
import { Tab, Box, makeStyles } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { useEthers } from "@usedapp/core"
import { UnstakeForm } from './UnstakeForm'
import { ConnectionRequiredMsg } from "../ConnectionRequiredMsg"

interface TokenFarmProps {
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
        borderRadius: "25px"
    },

    header: {
        color: "white"
    }
}))

export const TokenFarm = ({ supportedTokens }: TokenFarmProps) => {

    const classes = useStyles()
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)
    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }

    const { account } = useEthers()
    const isConnected = account !== undefined 

    return (
        <Box>
            <h1 className={classes.header}>Staked Token</h1>
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
                                            <UnstakeForm token={token} /> 
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
