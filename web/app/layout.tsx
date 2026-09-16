import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { DynamicProviderWrapper } from "@/components/DynamicProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Agent Passport | On-Chain AI Agent Reputation on Monad",
  description:
    "An on-chain reputation and identity rail for autonomous AI agents on Monad. Verify counterparty trust scores, register identities, and log verifiable feedback with 14-day time decay.",
  openGraph: {
    title: "Agent Passport | On-Chain AI Agent Reputation on Monad",
    description:
      "Reputation and identity infrastructure for autonomous AI agents on Monad Metropolis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900`}>
        <DynamicProviderWrapper>
          <Navbar />
          {children}
        </DynamicProviderWrapper>
      </body>
    </html>
  );
}
