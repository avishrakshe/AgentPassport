import React from "react";
import { AnalysisClient } from "./AnalysisClient";
import { fetchAgents } from "@/lib/envio";
import { Metadata } from "next";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Live Analysis & Network Metrics | Agent Passport",
  description:
    "Real-time reputation metrics, 14-day half-life decay simulation, and counterparty trust analytics on Monad Testnet.",
};

export default async function AnalysisPage() {
  const agents = await fetchAgents();

  return <AnalysisClient initialAgents={agents} />;
}
