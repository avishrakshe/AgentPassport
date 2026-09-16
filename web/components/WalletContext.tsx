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

export const ORCHESTRATOR_ADDRESS = "0x7991e33e35E87286Aa46056C9B9b3B8CFB40c7";

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isMonad: boolean;
  isConnecting: boolean;
  isModalOpen: boolean;
  walletType: "injected" | "orchestrator" | "burner" | null;
  walletClient: WalletClient | null;
  openModal: () => void;
  closeModal: () => void;
  connectWallet: () => void;
  connectInjected: () => Promise<void>;
  connectOrchestrator: () => void;
  connectBurner: () => void;
  disconnectWallet: () => void;
  switchToMonad: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  isMonad: false,
  isConnecting: false,
  isModalOpen: false,
  walletType: null,
  walletClient: null,
  openModal: () => {},
  closeModal: () => {},
  connectWallet: () => {},
  connectInjected: async () => {},
  connectOrchestrator: () => {},
  connectBurner: () => {},
  disconnectWallet: () => {},
  switchToMonad: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(MONAD_CHAIN_ID);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletType, setWalletType] = useState<"injected" | "orchestrator" | "burner" | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const isMonad = chainId === MONAD_CHAIN_ID;
  const isConnected = !!address;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Switch to Monad Testnet by default
  const switchToMonad = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setChainId(MONAD_CHAIN_ID);
      return;
    }
    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CHAIN_ID_HEX }],
      });
      setChainId(MONAD_CHAIN_ID);
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [MONAD_NETWORK_PARAMS],
        });
        setChainId(MONAD_CHAIN_ID);
      } else {
        throw switchError;
      }
    }
  };

  // Connect Injected (MetaMask, Rabby, etc.)
  const connectInjected = async () => {
    setIsConnecting(true);
    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        // Fall back to opening install link or modal notice
        window.open("https://metamask.io/download/", "_blank");
        throw new Error("MetaMask not detected. Redirecting to MetaMask download...");
      }

      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        setWalletType("injected");
        localStorage.setItem("ap_wallet_type", "injected");

        const currentChainHex = await ethereum.request({ method: "eth_chainId" });
        const currentChain = parseInt(currentChainHex, 16);
        setChainId(currentChain);

        if (currentChain !== MONAD_CHAIN_ID) {
          try {
            await switchToMonad();
          } catch (e) {
            console.warn("Could not auto-switch to Monad Testnet:", e);
          }
        }

        const client = createWalletClient({
          chain: monadTestnet,
          transport: custom(ethereum),
          account: userAddress as `0x${string}`,
        });
        setWalletClient(client);
        closeModal();
      }
    } catch (err: any) {
      console.error("Injected connection failed:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  // Connect Instant Orchestrator Agent Wallet
  const connectOrchestrator = () => {
    setAddress(ORCHESTRATOR_ADDRESS);
    setChainId(MONAD_CHAIN_ID);
    setWalletType("orchestrator");
    localStorage.setItem("ap_wallet_type", "orchestrator");
    localStorage.setItem("ap_wallet_address", ORCHESTRATOR_ADDRESS);
    closeModal();
  };

  // Connect / Generate Burner Agent Wallet
  const connectBurner = () => {
    let burner = localStorage.getItem("ap_burner_address");
    if (!burner) {
      const rand = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      burner = `0x${rand}`;
      localStorage.setItem("ap_burner_address", burner);
    }
    setAddress(burner);
    setChainId(MONAD_CHAIN_ID);
    setWalletType("burner");
    localStorage.setItem("ap_wallet_type", "burner");
    closeModal();
  };

  const disconnectWallet = () => {
    setAddress(null);
    setWalletType(null);
    setWalletClient(null);
    localStorage.removeItem("ap_wallet_type");
    localStorage.removeItem("ap_wallet_address");
  };

  // Auto-reconnect stored session on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedType = localStorage.getItem("ap_wallet_type");
    if (savedType === "orchestrator") {
      setAddress(ORCHESTRATOR_ADDRESS);
      setChainId(MONAD_CHAIN_ID);
      setWalletType("orchestrator");
      return;
    }
    if (savedType === "burner") {
      const burner = localStorage.getItem("ap_burner_address");
      if (burner) {
        setAddress(burner);
        setChainId(MONAD_CHAIN_ID);
        setWalletType("burner");
        return;
      }
    }

    if ((window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setAddress(accounts[0]);
            setWalletType("injected");
            ethereum.request({ method: "eth_chainId" }).then((chainHex: string) => {
              setChainId(parseInt(chainHex, 16));
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
          setWalletType("injected");
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
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected,
        isMonad,
        isConnecting,
        isModalOpen,
        walletType,
        walletClient,
        openModal,
        closeModal,
        connectWallet: openModal,
        connectInjected,
        connectOrchestrator,
        connectBurner,
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
