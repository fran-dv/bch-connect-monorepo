import { ElectrumNetworkProvider } from "cashscript";
import { create } from "zustand";

interface NetworkProviderState {
  provider: ElectrumNetworkProvider | null;
}

interface NetworkProviderActions {
  setProvider: (provider: ElectrumNetworkProvider) => void;
}

export const useNetworkProviderStore = create<
  NetworkProviderState & NetworkProviderActions
>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
}));

export default useNetworkProviderStore;
