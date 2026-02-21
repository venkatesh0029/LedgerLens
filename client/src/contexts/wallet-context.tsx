import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  WalletState,
  connectWallet,
  getWalletBalance,
  getChainName,
  TARGET_CHAIN_ID
} from "@/lib/web3";

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  chainName: string;
  isCorrectNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBalance = useCallback(async (address: string) => {
    try {
      const balance = await getWalletBalance(address);
      setState(prev => ({ ...prev, balance }));
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { address, chainId } = await connectWallet();
      const balance = await getWalletBalance(address);

      setState({
        isConnected: true,
        address,
        chainId,
        balance,
      });

      localStorage.setItem("wallet_connected", "true");
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
    });
    localStorage.removeItem("wallet_connected");
    setError(null);
  }, []);

  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet_connected") === "true";
    if (wasConnected && window.ethereum) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.address) {
        setState(prev => ({ ...prev, address: accounts[0] }));
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setState(prev => ({ ...prev, chainId: newChainId }));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [state.address, disconnect, updateBalance]);

  const chainName = state.chainId ? getChainName(state.chainId) : "Not Connected";
  const isCorrectNetwork = state.chainId === TARGET_CHAIN_ID;

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        isConnecting,
        error,
        chainName,
        isCorrectNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
