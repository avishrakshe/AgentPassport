"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, Wallet, LogOut, AlertTriangle, Check, Copy } from "lucide-react";
import { useWallet } from "./WalletContext";

export function Navbar() {
  const { address, isConnected, isMonad, isConnecting, connectWallet, disconnectWallet, switchToMonad } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formatAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-full bg-lime-400 flex items-center justify-center font-black text-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-zinc-900 flex items-center gap-1.5">
                DeFi Agents
                <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                  Passport
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-600">
            <Link href="/#registry" className="hover:text-black transition-colors">
              Registry
            </Link>
            <Link href="/register" className="hover:text-black transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Register Agent
            </Link>
            <a
              href="https://testnet.monadscan.com/address/0x55568390E407EEaF3227dE4285000a538E824111"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800"
            >
              Contracts <ExternalLink className="w-3 h-3" />
            </a>
          </nav>
        </div>

        {/* Right: Network status, Orchestrator info & Connect Wallet */}
        <div className="flex items-center space-x-3">
          {/* Network & Orchestrator Pill matching screenshot */}
          <div className="hidden lg:flex items-center space-x-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-800">Monad 10143</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-500 text-[11px]">
              Orchestrator: <span className="font-mono text-zinc-700 font-medium">0x7991...40c7</span>
            </span>
          </div>

          {/* Connection Status Label matching screenshot */}
          <div className="hidden sm:flex flex-col text-right text-xs leading-tight">
            <span className="font-semibold text-zinc-800">
              {isConnected ? "Mode B Active" : "Not connected"}
            </span>
            <span className="text-[11px] text-zinc-400">
              {isConnected ? (isMonad ? "Monad Testnet" : "Wrong Network") : "Connect for Mode B"}
            </span>
          </div>

          {/* Connect / Network Button */}
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : !isMonad ? (
            <button
              onClick={switchToMonad}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1.5 animate-bounce"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Switch to Monad Testnet
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-xs font-semibold border border-zinc-200 transition-all inline-flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {formatAddress(address)}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-zinc-100 text-zinc-500">
                    <span className="block text-[10px] uppercase font-bold text-zinc-400">Connected Wallet</span>
                    <span className="font-mono text-zinc-800 break-all text-[11px]">{address}</span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full mt-1 px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50 rounded-xl flex items-center justify-between"
                  >
                    <span>Copy Address</span>
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                  </button>

                  <a
                    href={`https://testnet.monadscan.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50 rounded-xl flex items-center justify-between"
                  >
                    <span>View on Monadscan</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>

                  <button
                    onClick={() => {
                      disconnectWallet();
                      setShowDropdown(false);
                    }}
                    className="w-full mt-1 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-between font-semibold"
                  >
                    <span>Disconnect</span>
                    <LogOut className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
