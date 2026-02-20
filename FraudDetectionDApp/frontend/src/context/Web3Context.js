import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import TransactionRegistryABI from '../contracts/TransactionRegistry.json';
import TrustScoreABI from '../contracts/TrustScore.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

// Use environment variables for contract addresses deployed to Ganache
const REGISTRY_ADDRESS = process.env.REACT_APP_REGISTRY_ADDRESS;
const TRUST_SCORE_ADDRESS = process.env.REACT_APP_TRUST_SCORE_ADDRESS;

export const Web3Provider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [registryContract, setRegistryContract] = useState(null);
    const [trustScoreContract, setTrustScoreContract] = useState(null);
    const [provider, setProvider] = useState(null);

    useEffect(() => {
        checkWalletIsConnected();
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
        } else {
            setCurrentAccount("");
            setRegistryContract(null);
            setTrustScoreContract(null);
        }
    };

    const checkWalletIsConnected = async () => {
        if (!window.ethereum) return;
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
                initializeContracts();
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            initializeContracts();
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    const initializeContracts = async () => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            const signer = await provider.getSigner();

            const registry = new ethers.Contract(REGISTRY_ADDRESS, TransactionRegistryABI.abi, signer);
            setRegistryContract(registry);

            const trustScore = new ethers.Contract(TRUST_SCORE_ADDRESS, TrustScoreABI.abi, signer);
            setTrustScoreContract(trustScore);

            console.log("Contracts initialized");
        } catch (error) {
            console.error("Error initializing contracts:", error);
        }
    };

    return (
        <Web3Context.Provider value={{
            connectWallet,
            currentAccount,
            registryContract,
            trustScoreContract
        }}>
            {children}
        </Web3Context.Provider>
    );
};
