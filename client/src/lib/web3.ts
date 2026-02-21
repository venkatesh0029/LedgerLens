import { BrowserProvider, JsonRpcSigner } from "ethers";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export const TARGET_CHAIN_ID = 1337; // Ganache Local

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  5: "Goerli Testnet",
  1337: "Ganache Local",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  11155111: "Sepolia Testnet",
};

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}

export async function connectWallet(): Promise<{
  address: string;
  chainId: number;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  const provider = new BrowserProvider(window.ethereum);

  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please connect your wallet.");
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return { address, chainId, provider, signer };
}

export async function switchToLocal(): Promise<void> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${TARGET_CHAIN_ID.toString(16)}` }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${TARGET_CHAIN_ID.toString(16)}`,
            chainName: "Ganache Local",
            nativeCurrency: {
              name: "Local ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: ["http://127.0.0.1:8545"],
            blockExplorerUrls: [],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function getWalletBalance(address: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  const formatted = (Number(balance) / 1e18).toFixed(4);
  return formatted;
}

export async function signMessage(message: string): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const signature = await signer.signMessage(message);
  return signature;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
