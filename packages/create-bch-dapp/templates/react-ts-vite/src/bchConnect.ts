import { createConfig } from "bch-connect";

export const config = createConfig({
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID, // Demo project ID (local development only). Get your own id at https://dashboard.reown.com/
  network: import.meta.env.VITE_BCH_NETWORK as "mainnet" | "testnet",
  metadata: {
    name: "BCH Connect Starter",
    description: "You can change this metadata in the src/bchConnect.ts file.",
    url: "http://localhost:5173",
    icons: ["https://bitcoincash.org/img/green/bitcoin-cash-circle.svg"],
  },
  debug: true,
});
