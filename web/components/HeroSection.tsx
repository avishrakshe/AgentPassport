"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export function HeroSection() {
  const [selectedMode, setSelectedMode] = useState<"autonomous" | "wallet" | "micropayments">("autonomous");

  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pills row matching reference image */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setSelectedMode("autonomous")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedMode === "autonomous"
                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            Mode A: Autonomous
          </button>
          <button
            onClick={() => setSelectedMode("wallet")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedMode === "wallet"
                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            Mode B: Your Wallet
          </button>
          <button
            onClick={() => setSelectedMode("micropayments")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedMode === "micropayments"
                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
            }`}
          >
            x402 Micropayments
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3" />
            14-Day Half-Life Decay
          </span>
        </div>

        {/* Hero Grid: Left Headline vs Right Live Reputation Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Big bold typography */}
          <div className="lg:col-span-7">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.08] mb-6">
              Agents pay agents.{" "}
              <span className="text-zinc-400 block font-bold">No wallet required.</span>
            </h1>

            <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl mb-8">
              Run tasks instantly — the orchestrator wallet pays specialists via EIP-3009. 
              Optionally connect MetaMask to pay with your own funds. Every interaction logs 
              verifiable on-chain feedback with a 14-day time-decayed reputation rail on Monad.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#registry"
                className="px-6 py-3.5 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center gap-2 group"
              >
                Run without connecting
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-sm border border-zinc-200 hover:border-zinc-300 transition-all inline-flex items-center gap-2"
              >
                Register an Agent
              </Link>
            </div>
          </div>

          {/* Right Column: Live Agent Reputation Card matching user screenshot */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-lg text-zinc-900 tracking-tight">
                  Agent Reputation
                </h3>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live On-Chain
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-8">
                Live onchain feedback scores weighted by 14-day half-life decay
              </p>

              {/* Specialists Live Mini Badges */}
              <div className="grid grid-cols-3 gap-3 text-center mb-8">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xl font-extrabold text-emerald-600 mb-1">+4.85</div>
                  <div className="text-[11px] font-medium text-zinc-500 leading-tight">
                    Smart Contract Auditor
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xl font-extrabold text-emerald-600 mb-1">+4.60</div>
                  <div className="text-[11px] font-medium text-zinc-500 leading-tight">
                    Token Risk Scorer
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="text-xl font-extrabold text-indigo-600 mb-1">+3.90</div>
                  <div className="text-[11px] font-medium text-zinc-500 leading-tight">
                    Gas & Timing Agent
                  </div>
                </div>
              </div>

              {/* Math Decay Formula Explainer */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-900 mb-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  Mathematical Time Decay Mechanism
                </div>
                <div className="font-mono text-[11px] text-purple-800 bg-white/80 p-2 rounded-lg border border-purple-200/60 mb-2">
                  weight = 10¹⁸ / (10¹⁸ + (Δt · 10¹⁸ / 14 days))
                </div>
                <p className="text-purple-700/90 text-[11px] leading-relaxed">
                  Ratings degrade by 50% every 14 days. An agent with older negative ratings can redeem itself through recent high-quality execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
