"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createWalletClient, custom, WalletClient } from "viem";
import { monadTestnet } from "@/lib/contracts";

export const MONAD_CHAIN_ID = 10143;
export const MONAD_CHAIN_ID_HEX = "0x279f"; // 10143 in hex

export const MONAD_NETWORK_PARAMS = {
  chainId: MONAD_CHAIN_ID_HEX,
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  blockExplorerUrls: ["https://testnet.monadscan.com"],
};

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isMonad: boolean;
  isConnecting: boolean;
  walletClient: WalletClient | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToMonad: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  isMonad: false,
  isConnecting: false,
  walletClient: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchToMonad: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const isMonad = chainId === MONAD_CHAIN_ID;
  const isConnected = !!address;

  // Switch to Monad Testnet by default
  const switchToMonad = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask.");
    }
    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CHAIN_ID_HEX }],
      });
    } catch (switchError: any) {
      // Error code 4902 means the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_NETWORK_PARAMS],
        });
      } else {
        throw switchError;
      }
    }
  };

  // Connect Wallet handler
  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No Ethereum wallet detected! Please install MetaMask or another Web3 wallet.");
      return;
    }

    const ethereum = (window as any).ethereum;
    setIsConnecting(true);

    try {
      // 1. Request accounts
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);

        // 2. Check and enforce Monad Testnet
        const currentChainIdHex = await ethereum.request({ method: "eth_chainId" });
        const currentChainId = parseInt(currentChainIdHex, 16);
        setChainId(currentChainId);

        if (currentChainId !== MONAD_CHAIN_ID) {
          try {
            await switchToMonad();
            setChainId(MONAD_CHAIN_ID);
          } catch (netErr) {
            console.warn("Could not auto-switch to Monad Testnet:", netErr);
          }
        }

        // 3. Create Viem WalletClient
        const client = createWalletClient({
          chain: monadTestnet,
          transport: custom(ethereum),
          account: userAddress as `0x${string}`,
        });
        setWalletClient(client);
      }
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setWalletClient(null);
  };

  // Listen to network and account changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;

    // Check if already authorized
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          ethereum.request({ method: "eth_chainId" }).then((chainHex: string) => {
            const currentChain = parseInt(chainHex, 16);
            setChainId(currentChain);
            const client = createWalletClient({
              chain: monadTestnet,
              transport: custom(ethereum),
              account: accounts[0] as `0x${string}`,
            });
            setWalletClient(client);
          });
        }
      })
      .catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAddress(accounts[0]);
        const client = createWalletClient({
          chain: monadTestnet,
          transport: custom(ethereum),
          account: accounts[0] as `0x${string}`,
        });
        setWalletClient(client);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected,
        isMonad,
        isConnecting,
        walletClient,
        connectWallet,
        disconnectWallet,
        switchToMonad,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
