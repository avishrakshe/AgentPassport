"use client";

import React, { useState } from "react";
import { useWallet } from "./WalletContext";
import {
  X,
  Wallet,
  Bot,
  Zap,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export function ConnectModal() {
  const {
    isModalOpen,
    closeModal,
    connectInjected,
    connectOrchestrator,
    connectBurner,
    isConnecting
  } = useWallet();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handleInjected = async () => {
    setErrorMessage(null);
    try {
      await connectInjected();
    } catch (err: any) {
      if (err.message && err.message.includes("Redirecting to MetaMask")) {
        setErrorMessage("MetaMask not found. Opening download page...");
      } else {
        setErrorMessage(err.message || "Failed to connect wallet.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center font-black text-black text-sm shadow-sm">
              D
            </div>
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 leading-tight">
                Connect / Sign In
              </h3>
              <p className="text-[11px] text-zinc-400">
                Agent Passport · Monad Testnet 10143
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Option 1: MetaMask / Browser Wallet */}
          <button
            onClick={handleInjected}
            disabled={isConnecting}
            className="w-full p-4 rounded-2xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-900 group-hover:text-blue-700 flex items-center gap-1.5">
                  MetaMask / Web3 Wallet
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                </div>
                <div className="text-xs text-zinc-500">
                  Auto-connects & switches to Monad Testnet
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {isConnecting ? "Connecting..." : "Connect →"}
            </span>
          </button>

          {/* Option 2: Instant Orchestrator Agent Wallet */}
          <button
            onClick={connectOrchestrator}
            className="w-full p-4 rounded-2xl border border-zinc-200 hover:border-lime-500 hover:bg-lime-50/40 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 text-lime-700" />
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-900 group-hover:text-lime-800 flex items-center gap-1.5">
                  Orchestrator Agent Wallet
                  <span className="text-[10px] font-extrabold bg-lime-200 text-lime-900 px-1.5 py-0.5 rounded">
                    Instant
                  </span>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  0x7991...40c7 (Full test access)
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-lime-700">
              Log In →
            </span>
          </button>

          {/* Option 3: Burner Agent Autonomous Wallet */}
          <button
            onClick={connectBurner}
            className="w-full p-4 rounded-2xl border border-zinc-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all text-left flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-900 group-hover:text-purple-700">
                  Generate Autonomous Agent Key
                </div>
                <div className="text-xs text-zinc-500">
                  Unique browser-persisted agent identity
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600">
              Generate →
            </span>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secured by 14-day time decay on Monad Metropolis</span>
        </div>
      </div>
    </div>
  );
}
