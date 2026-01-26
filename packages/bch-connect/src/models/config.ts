import type { CustomCaipNetwork } from "@reown/appkit-common";
import type SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import type OldSignClient from "sign-client-v2-20";
import type { SessionTypes as OldSessionTypes } from "walletconnect-types-v2-20";
import type { Modal, ModalFactory } from "@/models/modal";

export type { OldSignClient, SignClient };
export type { SessionTypes, OldSessionTypes };

export enum NETWORK_INDEX {
	mainnet = "mainnet",
	testnet = "testnet",
	regtest = "regtest",
}

export enum CAIP_NETWORK_ID {
	mainnet = "bch:bitcoincash",
	testnet = "bch:bchtest",
	regtest = "bch:bchreg",
}

export enum BCH_METHOD {
	getAddresses = "bch_getAddresses",
	signTransaction = "bch_signTransaction",
	signMessage = "bch_signMessage",
}

export enum BCH_EVENT {
	addressesChanged = "addressesChanged",
}

export enum BCH_NETWORK_DATA {
	chainNamespace = "bch",
	currencyName = "Bitcoin Cash",
	currencySymbol = "BCH",
	currencyDecimals = 8,
}

export type SessionType = "Wallet Connect V2";

export const SESSION_TYPE: Record<string, SessionType> = {
	walletConnectV2: "Wallet Connect V2",
} as const;

export type BCHCaipNetwork = CustomCaipNetwork<"bch">;

export interface CaipNetworksConstant {
	readonly mainnet: BCHCaipNetwork;
	readonly testnet: BCHCaipNetwork;
	readonly regtest: BCHCaipNetwork;
}

export interface Configuration {
	projectId: string;
	network: NETWORK_INDEX | keyof typeof NETWORK_INDEX;
	metadata: {
		name: string;
		description: string;
		url: string;
		icons: string[];
	};
	sessionType?: SessionType;
	modal?: Modal | ModalFactory;
	supportLegacyClient?: boolean;
	debug?: boolean;
}

export interface InitializeConnectionReturnType {
	signClient: SignClient | OldSignClient;
	modal: Modal;
}
