import type {
	WcSignMessageRequest,
	WcSignMessageResponse,
} from "@bch-wc2/interfaces";
import { stringify } from "@bitauth/libauth";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalletConnectContext } from "@/contexts/WalletConnectContext";
import { BCH_METHOD, CAIP_NETWORK_ID, NETWORK_INDEX } from "@/models/config";
import useSignMessage from "./useSignMessage";

vi.mock("@bitauth/libauth", () => ({
	stringify: vi.fn(),
}));

// biome-ignore lint/suspicious: any
const createWrapper = (contextOverrides: any = {}) => {
	return ({ children }: { children: React.ReactNode }) => (
		<WalletConnectContext.Provider
			value={
				{
					signClient: { request: vi.fn() },
					session: { topic: "test-topic" },
					config: { network: NETWORK_INDEX.mainnet },
					...contextOverrides,
					// biome-ignore lint/suspicious: any
				} as any
			}
		>
			{children}
		</WalletConnectContext.Provider>
	);
};

describe("hooks/useSignMessage", () => {
	const mockRequest = vi.fn();

	const mockMessageOptions = {
		address: "bitcoincash:q...",
		message: "Hello World",
		hash: new Uint8Array([1, 2, 3]),
	} as unknown as WcSignMessageRequest;

	beforeEach(() => {
		vi.clearAllMocks();
		// Return valid JSON string because the hook calls JSON.parse(stringify(...))
		(stringify as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			'{"serialized":"msg-data"}',
		);
	});

	it("successfully signs a message with properly serialized parameters", async () => {
		const expectedResponse: WcSignMessageResponse = "base64sig";
		mockRequest.mockResolvedValue(expectedResponse);

		const { result } = renderHook(() => useSignMessage(), {
			wrapper: createWrapper({ signClient: { request: mockRequest } }),
		});

		const response = await result.current.signMessage(mockMessageOptions);

		expect(response).toEqual(expectedResponse);
		expect(stringify).toHaveBeenCalledWith(mockMessageOptions);

		expect(mockRequest).toHaveBeenCalledWith({
			chainId: CAIP_NETWORK_ID.mainnet,
			topic: "test-topic",
			request: {
				method: BCH_METHOD.signMessage,
				params: { serialized: "msg-data" },
			},
		});
	});

	it("uses the correct chainId when network is TESTNET", async () => {
		mockRequest.mockResolvedValue("sig");

		const { result } = renderHook(() => useSignMessage(), {
			wrapper: createWrapper({
				signClient: { request: mockRequest },
				config: { network: NETWORK_INDEX.testnet },
			}),
		});

		await result.current.signMessage(mockMessageOptions);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				chainId: CAIP_NETWORK_ID.testnet,
			}),
		);
	});

	it("uses the correct chainId when network is REGTEST", async () => {
		mockRequest.mockResolvedValue("sig");

		const { result } = renderHook(() => useSignMessage(), {
			wrapper: createWrapper({
				signClient: { request: mockRequest },
				config: { network: NETWORK_INDEX.regtest },
			}),
		});

		await result.current.signMessage(mockMessageOptions);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				chainId: CAIP_NETWORK_ID.regtest,
			}),
		);
	});

	it("throws a clear error if signClient or session is missing", async () => {
		// Wrapper with NO client/session
		const { result } = renderHook(() => useSignMessage(), {
			wrapper: createWrapper({ signClient: null, session: null }),
		});

		await expect(
			result.current.signMessage(mockMessageOptions),
		).rejects.toThrow(
			"Error signing messages: Provider or session is not defined",
		);

		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("propagates errors thrown by the WalletConnect client", async () => {
		const walletError = {
			message: "User rejected message signing",
			code: 4001,
		};
		mockRequest.mockRejectedValue(walletError);

		const { result } = renderHook(() => useSignMessage(), {
			wrapper: createWrapper({ signClient: { request: mockRequest } }),
		});

		await expect(
			result.current.signMessage(mockMessageOptions),
		).rejects.toEqual(walletError);
	});
});
