import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BCHConnectProvider } from "bch-connect";
import App from "./App.tsx";
import { config } from "./bchConnect.ts";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
	<StrictMode>
		<BCHConnectProvider config={config}>
			<App />
		</BCHConnectProvider>
	</StrictMode>,
);
