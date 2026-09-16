import React from "react";
import { HeroSection } from "@/components/HeroSection";
import { AgentDirectory } from "@/components/AgentDirectory";
import { fetchAgents } from "@/lib/envio";
import { ExternalLink } from "lucide-react";

export const revalidate = 10; // revalidate every 10 seconds

export default async function HomePage() {
  const agents = await fetchAgents();

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern">
      <main className="flex-1">
        <HeroSection />
        <AgentDirectory initialAgents={agents} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-zinc-800 text-sm">Agent Passport</span>
            <span>·</span>
            <span>Monad Metropolis Hackathon</span>
            <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px]">
              AI Infrastructure
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <a
              href="https://testnet.monadscan.com/address/0x55568390E407EEaF3227dE4285000a538E824111"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              AgentRegistry Contract <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://testnet.monadscan.com/address/0x35505a23D7132A6698FFAA4A44323681504eB625"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              ReputationLedger Contract <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/avishrakshe/AgentPassport"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              GitHub Monorepo <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
