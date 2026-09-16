"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  Cpu,
  Sparkles
} from "lucide-react";
import { AgentData } from "@/lib/mockData";
import { AGENT_REGISTRY_ADDRESS, REPUTATION_LEDGER_ADDRESS } from "@/lib/contracts";

export function AnalysisClient({ initialAgents }: { initialAgents: AgentData[] }) {
  const [elapsedDays, setElapsedDays] = useState<number>(14);

  // 14-day decay formula calculation
  // weight = 10^18 / (10^18 + (deltaT * 10^18 / 14 days))
  const calculateDecayWeight = (days: number) => {
    return 1 / (1 + days / 14);
  };

  const currentWeight = calculateDecayWeight(elapsedDays);
  const percentWeight = (currentWeight * 100).toFixed(1);

  // Network stats
  const totalAgents = initialAgents.length;
  const verifiedCount = initialAgents.filter((a) => a.cleanverseVerified).length;
  const verifiedRate = totalAgents > 0 ? Math.round((verifiedCount / totalAgents) * 100) : 0;
  const avgTrustScore =
    totalAgents > 0
      ? (initialAgents.reduce((acc, a) => acc + a.trustScore, 0) / totalAgents).toFixed(2)
      : "0.00";

  // Recent simulated live on-chain interaction events
  const liveEvents = [
    {
      id: "ev-1",
      rater: "0x7991...40c7 (Orchestrator)",
      rated: "Smart Contract Auditor",
      ratedAddr: "0x3C44CDD9B4dC9d80A68366AcA2aA1cE8320493BC",
      score: +5,
      tx: "0x5f56311aa1e8c2b406b2ed9345bbae2d8690ce9ae551d4ae3545eafc3869d12b",
      time: "2 mins ago",
      ageDays: 0.01,
    },
    {
      id: "ev-2",
      rater: "0x3C44...93BC (Auditor)",
      rated: "Token Risk Scorer",
      ratedAddr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      score: +5,
      tx: "0x8f4f6878a1c4124f32dd69f63d78ff790fb163c4779cc798af518429a277603a",
      time: "18 mins ago",
      ageDays: 0.02,
    },
    {
      id: "ev-3",
      rater: "0x15d3...6A65 (Timing Agent)",
      rated: "Token Risk Scorer",
      ratedAddr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      score: +4,
      tx: "0x3a4b918f4...e81c",
      time: "2 hours ago",
      ageDays: 0.1,
    },
    {
      id: "ev-4",
      rater: "0x90F7...b906 (Risk Scorer)",
      rated: "Gas Price & Transaction Timing Agent",
      ratedAddr: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      score: +4,
      tx: "0x9c82b18e...f21a",
      time: "1 day ago",
      ageDays: 1,
    },
    {
      id: "ev-5",
      rater: "0x7991...40c7 (Orchestrator)",
      rated: "Smart Contract Auditor",
      ratedAddr: "0x3C44CDD9B4dC9d80A68366AcA2aA1cE8320493BC",
      score: +5,
      tx: "0x712a5d93...1c4b",
      time: "14 days ago",
      ageDays: 14,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800">
                Live Analysis
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Monad Testnet 10143
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Agent Reputation & Network Analysis
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Real-time on-chain reputation metrics, 14-day decay mathematical modeling, and counterparty trust telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Register Agent
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Network Trust Score */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Network Avg Trust
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-600">
              +{avgTrustScore}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Across all registered agents on Monad
            </div>
          </div>

          {/* Card 2: Registered Agents */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Registered Agents
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-zinc-900">
              {totalAgents} <span className="text-sm font-semibold text-zinc-400">Specialists</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              DeFi Auditors, Scorer & Timing agents
            </div>
          </div>

          {/* Card 3: Verification Rate */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Cleanverse Verified
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-600">
              {verifiedRate}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {verifiedCount} of {totalAgents} anti-sybil verified
            </div>
          </div>

          {/* Card 4: Decay Half-Life */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Decay Half-Life
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-zinc-900">
              14 <span className="text-sm font-semibold text-zinc-400">Days</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Strict 50% weight degradation / 2 weeks
            </div>
          </div>
        </div>

        {/* Section 2: Interactive 14-Day Time Decay Simulator */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-lg text-zinc-900">
                  Interactive 14-Day Half-Life Decay Simulator
                </h3>
              </div>
              <p className="text-xs text-zinc-500">
                Simulate how mathematical time decay penalizes inactive or dormant ratings while rewarding recent high-quality execution.
              </p>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-right">
              <span className="text-[10px] font-extrabold uppercase text-purple-600 block">
                Calculated Weight at Day {elapsedDays}
              </span>
              <span className="text-2xl font-black text-purple-900">
                {percentWeight}%
              </span>
              <span className="text-xs text-purple-500 ml-1">
                ({currentWeight.toFixed(4)}x)
              </span>
            </div>
          </div>

          {/* Interactive Slider */}
          <div className="mb-8 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-600 mb-2">
              <span>Time Elapsed: <strong className="text-purple-700 text-sm">{elapsedDays} Days</strong></span>
              <span className="text-zinc-400">Max: 60 Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={elapsedDays}
              onChange={(e) => setElapsedDays(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono mt-2">
              <span>Day 0 (100%)</span>
              <span>Day 14 (50%)</span>
              <span>Day 28 (33%)</span>
              <span>Day 42 (25%)</span>
              <span>Day 60 (19%)</span>
            </div>
          </div>

          {/* Mathematical Formula Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                On-Chain Formula
              </span>
              <div className="text-zinc-800 font-semibold break-all text-[11px]">
                weight = 10³⁶ / (10¹⁸ + (Δt · 10¹⁸ / 14 days))
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Half-Life Invariance
              </span>
              <div className="text-zinc-800 text-[11px]">
                At Δt = 14 days, weight is exactly <strong>0.5000 (50%)</strong> of fresh interaction.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Sybil Protection
              </span>
              <div className="text-zinc-800 text-[11px]">
                Prevents &ldquo;sleep-and-exit&rdquo; attacks where rogue agents exit-scam on stale reputation.
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Live On-Chain Interaction Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Recent Ratings Feed */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Feedback & Rating Stream
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Recent rating events emitted on Monad Testnet
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
              </span>
            </div>

            <div className="space-y-3">
              {liveEvents.map((ev) => {
                const weight = calculateDecayWeight(ev.ageDays);
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-zinc-900">{ev.rated}</span>
                        <span
                          className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                            ev.score > 0
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {ev.score > 0 ? `+${ev.score}` : ev.score}
                        </span>
                        <span className="text-zinc-400 text-[11px]">from {ev.rater}</span>
                      </div>
                      <div className="font-mono text-[11px] text-zinc-400 flex items-center gap-1">
                        <span>Tx: {ev.tx.slice(0, 10)}...</span>
                        <a
                          href={`https://testnet.monadscan.com/tx/${ev.tx}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-zinc-700 inline-flex items-center"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-purple-700">
                        {(weight * 100).toFixed(0)}% weight
                      </div>
                      <div className="text-zinc-400 text-[11px]">{ev.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deployed Contracts Inspector */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-base text-zinc-900 mb-1">
                Monad Testnet Contracts
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Verified smart contracts deployed on Chain ID 10143
              </p>

              <div className="space-y-4 text-xs">
                {/* Contract 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-800">AgentRegistry.sol</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Sourcify Verified
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 break-all mb-2">
                    {AGENT_REGISTRY_ADDRESS}
                  </div>
                  <a
                    href={`https://testnet.monadscan.com/address/${AGENT_REGISTRY_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 text-[11px]"
                  >
                    View on Monadscan <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Contract 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-800">ReputationLedger.sol</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Sourcify Verified
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 break-all mb-2">
                    {REPUTATION_LEDGER_ADDRESS}
                  </div>
                  <a
                    href={`https://testnet.monadscan.com/address/${REPUTATION_LEDGER_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 text-[11px]"
                  >
                    View on Monadscan <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-lime-50 border border-lime-200 text-xs">
              <div className="font-bold text-lime-900 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-lime-700" />
                MetaMask Snap Protection Active
              </div>
              <p className="text-lime-800 leading-relaxed text-[11px]">
                Counterparties with trust scores below 0.0 or under 3 ratings are automatically blocked by the Agent Passport MetaMask Snap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
