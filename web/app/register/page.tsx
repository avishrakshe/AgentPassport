"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/components/WalletContext";
import { createWalletClient, custom } from "viem";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import { AGENT_REGISTRY_ADDRESS, AGENT_REGISTRY_ABI, monadTestnet } from "@/lib/contracts";

export default function RegisterPage() {
  const { address, walletClient: contextWalletClient, isConnected, connectWallet, switchToMonad, isMonad } = useWallet();

  const [agentId, setAgentId] = useState("agent-defi-arbitrage-v1");
  const [name, setName] = useState("DeFi Arbitrage Specialist");
  const [role, setRole] = useState("defi-arbitrage");
  const [metadataURI, setMetadataURI] = useState("ipfs://bafybeidemoagentmetadata123");
  const [description, setDescription] = useState(
    "Automates flash loans, cross-DEX arbitrage, and optimal routing across Monad testnet pools."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setTxHash(null);
    setIsSubmitting(true);

    try {
      if (!isConnected || !address) {
        await connectWallet();
        throw new Error("Please connect your wallet using the Connect Wallet button above.");
      }

      if (!isMonad) {
        await switchToMonad();
      }

      let activeClient = contextWalletClient;
      if (!activeClient && typeof window !== "undefined" && (window as any).ethereum) {
        activeClient = createWalletClient({
          chain: monadTestnet,
          transport: custom((window as any).ethereum),
          account: address as `0x${string}`
        });
      }

      if (!activeClient) {
        throw new Error("Wallet client not available. Please connect MetaMask.");
      }

      // Convert agentId to bytes32 format
      const agentIdHex = `0x${Buffer.from(agentId).toString("hex").padEnd(64, "0").slice(0, 64)}` as `0x${string}`;

      // Execute on-chain transaction
      const hash = await (activeClient as any).writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: "register",
        args: [agentIdHex, metadataURI],
        chain: monadTestnet
      });

      setTxHash(hash);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.message.includes("Please connect your wallet")) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || "Registration failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAddress = address || "0xYourWalletAddress...1234";

  return (
    <div className="min-h-screen bg-zinc-50/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Agent Directory
        </Link>

        <div className="mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 mb-1 block">
            ON-CHAIN IDENTITY
          </span>
          <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
            Register an AI Agent
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-2xl">
            Create an immutable on-chain identity for your autonomous agent on Monad Testnet.
            Counterparties can discover capabilities and submit ratings linked to this passport.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Connected Wallet Info */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 block uppercase">
                    Agent Wallet Address
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-800">
                    {address || "Not connected"}
                  </span>
                </div>

                {!isConnected ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                )}
              </div>

              {/* Agent ID */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Agent ID (Unique Handle)
                </label>
                <input
                  type="text"
                  required
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="e.g. agent-arbitrage-bot-v1"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Agent Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DeFi Arbitrage Specialist"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Role / Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Specialist Category
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="contract-audit">Smart Contract Auditor</option>
                  <option value="token-risk-score">Token Risk Scorer</option>
                  <option value="gas-timing">Gas & Timing Optimizer</option>
                  <option value="defi-arbitrage">DeFi Arbitrage Agent</option>
                  <option value="data-oracle">Data Oracle Specialist</option>
                </select>
              </div>

              {/* Metadata URI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Metadata URI (IPFS / Arweave)
                </label>
                <input
                  type="text"
                  required
                  value={metadataURI}
                  onChange={(e) => setMetadataURI(e.target.value)}
                  placeholder="ipfs://bafybei..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                  Capabilities & Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your agent's autonomy, execution model, and service terms..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {txHash && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-extrabold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Agent Registered Successfully!
                  </div>
                  <div className="font-mono text-[11px] break-all">
                    Tx Hash: {txHash}
                  </div>
                  <a
                    href={`https://testnet.monadscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-700 hover:underline pt-1"
                  >
                    View on Monadscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Broadcasting to Monad Testnet...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Register Agent on Monad Testnet</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Live Passport Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
              Live Passport Card Preview
            </span>

            <div className="agent-card bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-base text-zinc-900 leading-snug">
                    {name || "Agent Name"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-lg bg-lime-100 text-lime-800 text-[11px] font-bold">
                    #NEW
                  </span>
                </div>

                <div className="text-xs text-zinc-500 font-mono mb-4 flex items-center gap-1.5">
                  <span>{role}</span>
                  <span>·</span>
                  <span className="text-zinc-400">
                    {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4">
                  {description || "Agent capability summary will appear here."}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-zinc-100 text-zinc-800">
                    0.00 / 5.0
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                    Awaiting First Rating
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                <span>0 reviews</span>
                <span className="font-mono text-[10px] truncate max-w-[150px]">
                  {agentId}
                </span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <span className="font-bold block">Autonomous Agent Note:</span>
              <p className="text-purple-700 leading-relaxed text-[11px]">
                Once registered, other agents in the ecosystem can automatically check your trust score using the <code>@agent-passport/sdk</code> before delegating tasks or sending funds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
