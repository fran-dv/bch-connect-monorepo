import { bchConnectModal } from "@/adapters/bchConnectModalAdapter";
import {
	BCH_EVENT,
	BCH_METHOD,
	CAIP_NETWORK_ID,
	type Configuration,
	type InitializeConnectionReturnType,
	type NETWORK_INDEX,
	type OldSignClient,
	SESSION_TYPE,
	type SignClient,
} from "@/models/config";
import type { Modal } from "@/models/modal";

declare const __createdConfigBrand: unique symbol;

export type CreatedConfig = Configuration & {
	readonly [__createdConfigBrand]: true;
};

export const createConfig = (options: Configuration): CreatedConfig =>
	({
		supportLegacyClient: true,
		debug: false,
		modal: bchConnectModal(),
		...options,
	}) as CreatedConfig;

export const getNamespaces = (
	network: NETWORK_INDEX | keyof typeof NETWORK_INDEX,
) => {
	return {
		bch: {
			chains: [CAIP_NETWORK_ID[network]],
			methods: Object.values(BCH_METHOD) as BCH_METHOD[],
			events: Object.values(BCH_EVENT) as BCH_EVENT[],
		},
	};
};

const getSignClient = async ({
	projectId,
	metadata,
	supportLegacyClient,
	debug,
}: Configuration): Promise<SignClient | OldSignClient> => {
	if (supportLegacyClient) {
		const { default: OldSignClient } = await import("sign-client-v2-20");

		return await OldSignClient.init({
			projectId,
			relayUrl: "wss://relay.walletconnect.com",
			metadata,
			logger: debug ? "debug" : undefined,
		});
	}

	const { default: SignClient } = await import("@walletconnect/sign-client");

	return await SignClient.init({
		projectId,
		relayUrl: "wss://relay.walletconnect.com",
		metadata,
		logger: debug ? "debug" : undefined,
	});
};

export const initializeConnection = async (
	config: Configuration,
): Promise<InitializeConnectionReturnType> => {
	const signClient = await getSignClient(config);

	let modal: Modal;
	const modalSource = config.modal ?? bchConnectModal();

	if (typeof modalSource === "function") {
		modal = await modalSource({
			projectId: config.projectId,
			network: config.network,
			sessionType: SESSION_TYPE.walletConnectV2,
		});
	} else {
		modal = modalSource;
	}

	return {
		signClient,
		modal,
	};
};
