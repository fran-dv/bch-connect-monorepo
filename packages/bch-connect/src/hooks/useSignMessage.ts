import type {
	WcSignMessageRequest,
	WcSignMessageResponse,
} from "@bch-wc2/interfaces";
import { stringify } from "@bitauth/libauth";
import { BCH_METHOD, CAIP_NETWORK_ID } from "@/models/config";
import { useWalletConnectContext } from "../contexts/WalletConnectContext";

export interface UseSignMessageReturnType {
	signMessage: (
		options: WcSignMessageRequest,
	) => Promise<WcSignMessageResponse | undefined>;
}

export const useSignMessage = (): UseSignMessageReturnType => {
	const { signClient, session, config } = useWalletConnectContext();

	const signMessage = async (
		options: WcSignMessageRequest,
	): Promise<WcSignMessageResponse | undefined> => {
		if (!signClient || !session) {
			throw new Error(
				"Error signing messages: Provider or session is not defined",
			);
		}

		try {
			const response = await signClient.request<WcSignMessageResponse>({
				chainId: CAIP_NETWORK_ID[config.network],
				topic: session.topic,
				request: {
					method: BCH_METHOD.signMessage,
					params: JSON.parse(stringify(options)),
				},
			});

			return response;
		} catch (err) {
			throw err as Error & { code: number };
		}
	};

	return {
		signMessage,
	};
};

export default useSignMessage;
