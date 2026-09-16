"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShieldCheck, Star, ArrowUpRight } from "lucide-react";
import { AgentData } from "@/lib/mockData";

export function AgentDirectory({ initialAgents }: { initialAgents: AgentData[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "reviews" | "recent">("score");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = initialAgents
    .filter((agent) => {
      const matchSearch =
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.wallet.toLowerCase().includes(search.toLowerCase()) ||
        agent.role.toLowerCase().includes(search.toLowerCase());

      const matchVerified = !verifiedOnly || agent.cleanverseVerified;

      return matchSearch && matchVerified;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.trustScore - a.trustScore;
      if (sortBy === "reviews") return b.ratingCount - a.ratingCount;
      return b.registeredAt - a.registeredAt;
    });

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <section id="registry" className="py-12 border-t border-zinc-200/80 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching user screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 block mb-1">
              ONCHAIN REGISTRY
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Agent Registry
            </h2>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm font-semibold text-zinc-500">
              {filtered.length} {filtered.length === 1 ? "DeFi agent" : "DeFi agents"}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by agent name, capability, or wallet address (0x...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-zinc-200 text-xs font-semibold px-3 py-2.5 rounded-xl text-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
            >
              <option value="score">Sort by Trust Score</option>
              <option value="reviews">Sort by Most Reviews</option>
              <option value="recent">Sort by Recently Registered</option>
            </select>

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shadow-sm ${
                verifiedOnly
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Cleanverse Only
            </button>
          </div>
        </div>

        {/* Agent Cards Grid matching reference image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              className="agent-card bg-white rounded-3xl p-6 border border-zinc-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:border-zinc-300"
            >
              <div>
                {/* Top card header: Name + Number badge (#1, #2, #3) */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-base text-zinc-900 leading-snug">
                    {agent.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-lg bg-lime-100 text-lime-800 text-[11px] font-bold">
                    #{agent.index}
                  </span>
                </div>

                {/* Subtitle: role · short address */}
                <div className="text-xs text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
                  <span>{agent.role}</span>
                  <span>·</span>
                  <span className="text-zinc-400">{formatAddress(agent.wallet)}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-4">
                  {agent.description}
                </p>

                {/* Badges & Scores */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Trust Score badge */}
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      agent.trustScore >= 4.0
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : agent.trustScore >= 0.0
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span>
                      {agent.trustScore > 0 ? "+" : ""}
                      {agent.trustScore.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-normal text-zinc-400">/ 5.0</span>
                  </div>

                  {/* Cleanverse verification badge */}
                  {agent.cleanverseVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Cleanverse Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Review status + View Profile Link */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  {agent.ratingCount > 0 ? `${agent.ratingCount} reviews` : "No reviews yet"}
                </span>

                <Link
                  href={`/agents/${agent.wallet}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-800 hover:text-purple-600 transition-colors"
                >
                  View Details
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
