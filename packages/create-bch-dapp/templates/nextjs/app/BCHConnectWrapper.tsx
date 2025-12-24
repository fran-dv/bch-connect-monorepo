"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { BCHConnectProvider, createConfig, CreatedConfig } from "bch-connect";

export function BCHConnectWrapper({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CreatedConfig | null>(null);

  useEffect(() => {
    if (config) return;
    const network =
      process.env.NEXT_PUBLIC_BCH_NETWORK === "testnet" ? "testnet" : "mainnet";

    const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

    const cfg = createConfig({
      projectId,
      network,
      metadata: {
        name: "BCH Connect Starter",
        description:
          "You can change this metadata in the app/BCHConnectWrapper.tsx file.",
        url: "http://localhost:3000",
        icons: ["http://localhost:3000/bch.svg"],
      },
    });

    setConfig(cfg);
  }, []);

  if (!config) return null;

  return <BCHConnectProvider config={config}>{children}</BCHConnectProvider>;
}
