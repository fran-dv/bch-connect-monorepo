import { createConfig } from "bch-connect";

export const config = createConfig({
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID, // Demo project ID (local development only). Get your own id at https://dashboard.reown.com/
  network: import.meta.env.VITE_BCH_NETWORK as "mainnet" | "testnet",
  metadata: {
    name: "BCH Connect Starter",
    description: "You can change this metadata in the src/bchConnect.ts file.",
    url: window.location.origin,
    icons: [`${window.location.origin}/bch.svg`],
  },
  debug: true,
});
