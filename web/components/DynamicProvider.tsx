"use client";

import React, { ReactNode } from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const DYNAMIC_ENV_ID =
  process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
  "2750a318-3fcb-4ba8-a531-f3770fa666ae"; // Fallback demo environment ID

export function DynamicProviderWrapper({ children }: { children: ReactNode }) {
  // If no dynamic env configured in build or dummy string, wrap gracefully
  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
