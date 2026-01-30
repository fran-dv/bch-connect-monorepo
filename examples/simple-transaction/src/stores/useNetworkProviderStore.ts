import { ElectrumNetworkProvider } from "cashscript";
import { create } from "zustand";
import { currentNetwork } from "@/bchConnect";

const network = currentNetwork === "testnet" ? "chipnet" : "mainnet";
const defaultProvider = new ElectrumNetworkProvider(network);

interface NetworkProviderState {
	provider: ElectrumNetworkProvider;
}

interface NetworkProviderActions {
	setProvider: (provider: ElectrumNetworkProvider) => void;
}

export const useNetworkProviderStore = create<
	NetworkProviderState & NetworkProviderActions
>((set) => ({
	provider: defaultProvider,
	setProvider: (provider) => set({ provider }),
}));

export default useNetworkProviderStore;
