import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAgentDetail } from "@/lib/envio";
import { AgentDetailClient } from "./AgentDetailClient";
import { ChevronLeft } from "lucide-react";

export default async function AgentDetailPage({
  params
}: {
  params: { address: string };
}) {
  const agent = await fetchAgentDetail(params.address);

  if (!agent) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Agent Directory
        </Link>

        <AgentDetailClient initialAgent={agent} />
      </div>
    </div>
  );
}
