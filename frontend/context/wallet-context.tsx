"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

interface WalletContextType {
    walletConnected: boolean
    walletAddress: string
    isConnecting: boolean
    error: string
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [walletConnected, setWalletConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState("")

    const checkConnection = useCallback(async () => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            try {
                const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
                if (accounts.length > 0) {
                    setWalletConnected(true)
                    setWalletAddress(accounts[0])
                }
            } catch (err) {
                console.error("Connection check failed", err)
            }
        }
    }, [])

    useEffect(() => {
        checkConnection()

        if (typeof window !== "undefined" && (window as any).ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0])
                    setWalletConnected(true)
                } else {
                    setWalletAddress("")
                    setWalletConnected(false)
                }
            }

            const handleChainChanged = () => {
                window.location.reload()
            }

            (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
            (window as any).ethereum.on("chainChanged", handleChainChanged);

            return () => {
                (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
                (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
            }
        }
    }, [checkConnection])

    const connectWallet = async () => {
        if (typeof window === "undefined" || !(window as any).ethereum) {
            setError("Please install MetaMask")
            return
        }

        setIsConnecting(true)
        setError("")
        try {
            const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
            setWalletConnected(true)
            setWalletAddress(accounts[0])
        } catch (err: any) {
            console.error("Connect failed", err)
            setError(err.message || "Failed to connect")
        } finally {
            setIsConnecting(false)
        }
    }

    const disconnectWallet = () => {
        setWalletConnected(false)
        setWalletAddress("")
    }

    return (
        <WalletContext.Provider value={{ walletConnected, walletAddress, isConnecting, error, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider")
    }
    return context
}
