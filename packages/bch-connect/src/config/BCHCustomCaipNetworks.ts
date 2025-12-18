import type { BCHCaipNetwork, CaipNetworksConstant } from "@/models/config";
import { BCH_NETWORK_DATA, CAIP_NETWORK_ID } from "@/models/config";

export const getBCHCustomCaipNetworks = (): CaipNetworksConstant => {
  const name = BCH_NETWORK_DATA.currencyName;
  const symbol = BCH_NETWORK_DATA.currencySymbol;
  const decimals = BCH_NETWORK_DATA.currencyDecimals;
  const mainnet: BCHCaipNetwork = {
    id: "bch-mainnet",
    chainNamespace: "bch",
    caipNetworkId: CAIP_NETWORK_ID.mainnet,
    name: "Bitcoin Cash",
    nativeCurrency: { name, symbol, decimals },
    rpcUrls: { default: { http: [] } },
    testnet: false,
    blockExplorers: {
      default: {
        name: "Bitcoin Cash Explorer",
        url: "https://explorer.bch.ninja/",
      },
    },
  } as const;

  const testnet: BCHCaipNetwork = {
    id: "bch-testnet",
    chainNamespace: "bch",
    caipNetworkId: CAIP_NETWORK_ID.testnet,
    name: "Bitcoin Cash (Testnet)",
    nativeCurrency: { name, symbol, decimals },
    rpcUrls: { default: { http: [] } },
    testnet: true,
  } as const;

  const regtest: BCHCaipNetwork = {
    id: "bch-regtest",
    chainNamespace: "bch",
    caipNetworkId: CAIP_NETWORK_ID.regtest,
    name: "Bitcoin Cash (Regtest)",
    nativeCurrency: { name: "Bitcoin Cash", symbol, decimals },
    rpcUrls: { default: { http: [] } },
    testnet: true,
  } as const;

  return {
    mainnet,
    testnet,
    regtest,
  };
};

export const Networks: CaipNetworksConstant = getBCHCustomCaipNetworks();
export default Networks;
