import { bchConnectModal, createConfig } from "bch-connect";

export const currentNetwork = "testnet";

export const config = createConfig({
	projectId: "443a55415de265485a8eeaa18494d7ad",
	network: currentNetwork,
	metadata: {
		name: "BCH Connect usage example",
		description:
			"BCH Connect is a react library to seamlessly integrate BCH wallet connections in your dapps",
		url: import.meta.env.VITE_URL ?? "http://localhost:5173",
		icons: ["https://placehold.co/500x500?text=BCHConnect"],
	},
	debug: true,
	supportLegacyClient: false,
	sessionType: "Wallet Connect V2",
	modal: bchConnectModal({
		// Optional. The config passed here overwrites the defaults
		sessionType: "Wallet Connect V2",
		theme: "dark",
		wallets: [
			{
				id: "cazhonize",
				name: "Cashonize",
				iconUrl: "https://cashonize.com/images/cashonize-icon.png",
				links: {
					web: "https://cashonize.com/?uri={{uri}}",
					fallback: "https://cashonize.com/?uri={{uri}}",
				},
			},
		],
	}),
});
