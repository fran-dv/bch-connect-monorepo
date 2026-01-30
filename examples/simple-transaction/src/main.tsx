import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BCHConnectProvider } from "bch-connect";
import App from "./App.tsx";
import { config } from "./bchConnect.ts";

// biome-ignore lint: no null assertion
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BCHConnectProvider config={config}>
			<App />
		</BCHConnectProvider>
	</StrictMode>,
);
