import * as Toast from "@radix-ui/react-toast";
import { ElectrumNetworkProvider } from "cashscript";
import { useEffect } from "react";
import { Background } from "@/components/Background";
import { Example } from "@/components/Example";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ToastMessages } from "@/components/ToastMessages";
import useNetworkProviderStore from "@/stores/useNetworkProviderStore";
import { currentNetwork } from "./main";

function App() {
	const { setProvider } = useNetworkProviderStore();
	const network = currentNetwork === "testnet" ? "chipnet" : "mainnet";

	useEffect(() => {
		setProvider(new ElectrumNetworkProvider(network));
	}, [setProvider, network]);

	return (
		<Toast.Provider swipeDirection="left">
			<Background />
			<Navbar />

			<main className={"p-3 sm:p-4 md:p-6 lg:p-8 w-full"}>
				<Example />
			</main>

			<Footer />
			<ToastMessages />
		</Toast.Provider>
	);
}

export default App;
