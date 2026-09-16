"use client";

import React from "react";
import Link from "next/link";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { Sparkles, ExternalLink } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 shadow-sm">
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

        {/* Right: Network status & Connect Wallet */}
        <div className="flex items-center space-x-3">
          {/* Network Pill */}
          <div className="hidden sm:flex items-center space-x-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-zinc-800">Monad 10143</span>
            <span className="text-zinc-400">|</span>
            <span className="text-zinc-600 font-mono">Orchestrator: 0x7991...40c7</span>
          </div>

          {/* Dynamic Connect Wallet Widget */}
          <div className="dynamic-connect-btn">
            <DynamicWidget />
          </div>
        </div>
      </div>
    </header>
  );
}
