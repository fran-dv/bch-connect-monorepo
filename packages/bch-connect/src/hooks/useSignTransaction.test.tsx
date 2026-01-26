import type {
	WcSignTransactionRequest,
	WcSignTransactionResponse,
} from "@bch-wc2/interfaces";
import { stringify } from "@bitauth/libauth";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WalletConnectContext } from "@/contexts/WalletConnectContext";
import { BCH_METHOD, CAIP_NETWORK_ID, NETWORK_INDEX } from "@/models/config";
import useSignTransaction from "./useSignTransaction";

// --- MOCKS ---
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
					config: { network: NETWORK_INDEX.mainnet, debug: false },
					...contextOverrides,
					// biome-ignore lint/suspicious: any
				} as any
			}
		>
			{children}
		</WalletConnectContext.Provider>
	);
};

describe("hooks/useSignTransaction", () => {
	const mockRequest = vi.fn();

	const mockTxRequest = {
		some: "data",
		value: 1000,
	} as unknown as WcSignTransactionRequest;

	beforeEach(() => {
		vi.clearAllMocks();
		// Default libauth behavior
		(stringify as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
			'{"serialized":"data"}',
		);
	});

	it("successfully signs a transaction with properly serialized parameters", async () => {
		const expectedResponse: WcSignTransactionResponse = {
			signedTransactionHash: "abcd",
		} as WcSignTransactionResponse;

		mockRequest.mockResolvedValue(expectedResponse);

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({ signClient: { request: mockRequest } }),
		});

		const response = await result.current.signTransaction({
			txRequest: mockTxRequest,
		});

		expect(response).toEqual(expectedResponse);

		// Verify Serialization
		expect(stringify).toHaveBeenCalledWith(mockTxRequest);

		// Verify SignClient Request
		expect(mockRequest).toHaveBeenCalledWith({
			chainId: CAIP_NETWORK_ID.mainnet,
			topic: "test-topic",
			request: {
				method: BCH_METHOD.signTransaction,
				params: { serialized: "data" },
			},
			expiry: 300,
		});
	});

	it("uses the provided requestExpirySeconds instead of the default", async () => {
		mockRequest.mockResolvedValue({});

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({ signClient: { request: mockRequest } }),
		});

		await result.current.signTransaction({
			txRequest: mockTxRequest,
			requestExpirySeconds: 600,
		});

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				expiry: 600,
			}),
		);
	});

	it("uses the correct chainId when network is TESTNET", async () => {
		mockRequest.mockResolvedValue({});

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({
				signClient: { request: mockRequest },
				config: { network: NETWORK_INDEX.testnet, debug: false },
			}),
		});

		await result.current.signTransaction({ txRequest: mockTxRequest });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				chainId: CAIP_NETWORK_ID.testnet,
			}),
		);
	});

	it("uses the correct chainId when network is REGTEST", async () => {
		mockRequest.mockResolvedValue({});

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({
				signClient: { request: mockRequest },
				config: { network: NETWORK_INDEX.regtest, debug: false },
			}),
		});

		await result.current.signTransaction({ txRequest: mockTxRequest });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				chainId: CAIP_NETWORK_ID.regtest,
			}),
		);
	});

	it("throws a clear error if signClient or session is missing", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// Wrapper with NO client/session
		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({
				signClient: null,
				session: null,
				config: { debug: true },
			}),
		});

		await expect(
			result.current.signTransaction({ txRequest: mockTxRequest }),
		).rejects.toThrow(
			"Error signing transactions: Provider or session is not defined",
		);

		expect(mockRequest).not.toHaveBeenCalled();
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Provider or session is not defined",
		);

		consoleErrorSpy.mockRestore();
	});

	it("propagates genuine errors thrown by the WalletConnect client", async () => {
		const walletError = new Error("User rejected transaction");
		mockRequest.mockRejectedValue(walletError);

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({ signClient: { request: mockRequest } }),
		});

		await expect(
			result.current.signTransaction({ txRequest: mockTxRequest }),
		).rejects.toThrow("User rejected transaction");
	});

	it("handles the `{}` bug by returning null instead of throwing", async () => {
		// 1. Simulate the bug: Wallet returns empty object error
		mockRequest.mockRejectedValue({});

		// 2. Setup Spies
		const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => {});

		const { result } = renderHook(() => useSignTransaction(), {
			wrapper: createWrapper({
				signClient: { request: mockRequest },
				config: { network: NETWORK_INDEX.mainnet, debug: true },
			}),
		});

		const response = await result.current.signTransaction({
			txRequest: mockTxRequest,
		});

		expect(response).toBeNull();

		expect(consoleLogSpy).toHaveBeenCalledWith(
			expect.stringContaining("WRONG RESPONSE RECEIVED"),
		);
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			expect.stringContaining("[bch-connect/useSignTransaction]"),
		);

		consoleLogSpy.mockRestore();
		consoleWarnSpy.mockRestore();
	});
});
