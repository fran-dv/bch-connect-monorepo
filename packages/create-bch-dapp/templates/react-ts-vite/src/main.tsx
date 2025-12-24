import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BCHConnectProvider } from "bch-connect";
import { config } from "./bchConnect.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BCHConnectProvider config={config}>
      <App />
    </BCHConnectProvider>
  </StrictMode>,
);
