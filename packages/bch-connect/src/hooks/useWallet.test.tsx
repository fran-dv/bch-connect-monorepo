import { act, renderHook, waitFor } from "@testing-library/react";
import type { SessionTypes } from "@walletconnect/types";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { WalletConnectContext } from "@/contexts/WalletConnectContext";
import { NETWORK_INDEX } from "@/models/config";
import useWallet from "./useWallet";

// --- MOCKS ---
vi.mock("@bitauth/libauth", () => ({
	decodeCashAddress: vi.fn(),
}));

import { decodeCashAddress } from "@bitauth/libauth";

vi.mock("@/utils/addressToTokenAddress", () => ({
	default: vi.fn(),
}));

import addressToTokenAddress from "@/utils/addressToTokenAddress";

const mockGetAddresses = vi.fn();
vi.mock("@/hooks/useGetAddresses", () => ({
	default: () => ({
		getAddresses: mockGetAddresses,
	}),
}));

const createMockSession = (address: string): SessionTypes.Struct =>
	({
		topic: "test-topic",
		namespaces: {
			bch: { accounts: [`bch:${address}`] },
		},
	}) as unknown as SessionTypes.Struct;

const createWrapper = (
	contextOverrides: Partial<WalletConnectContext> = {},
) => {
	const defaultContext: WalletConnectContext = {
		config: {
			projectId: "test",
			network: NETWORK_INDEX.mainnet,
			metadata: { name: "", description: "", url: "", icons: [] },
			debug: false,
		},
		session: null,
		signClient: {
			on: vi.fn(),
			removeListener: vi.fn(),
			connect: vi.fn(),
			disconnect: vi.fn(),
			// biome-ignore lint/suspicious: any
		} as any,
		connect: vi.fn(),
		disconnect: vi.fn(),
		connectError: null,
		disconnectError: null,
		...contextOverrides,
	};

	return ({ children }: { children: React.ReactNode }) => (
		<WalletConnectContext.Provider value={defaultContext}>
			{children}
		</WalletConnectContext.Provider>
	);
};

describe("hooks/useWallet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default mocks to valid states
		(decodeCashAddress as Mock).mockReturnValue({});
		(addressToTokenAddress as Mock).mockReturnValue("z-token-address");
	});

	describe("Initialization", () => {
		it("should return disconnected state when no session exists", () => {
			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({ session: null }),
			});

			expect(result.current.isConnected).toBe(false);
			expect(result.current.address).toBeNull();
			expect(result.current.isError).toBe(false);
		});

		it("should bubble up connect/disconnect errors to isError", () => {
			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({ connectError: new Error("Init Failed") }),
			});

			expect(result.current.isError).toBe(true);
			expect(result.current.connectError).toEqual(new Error("Init Failed"));
		});
	});

	describe("Address Parsing", () => {
		it("should extract and validate address from session on mount", async () => {
			const validAddress = "qtestaddress123";

			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({
					session: createMockSession(validAddress),
				}),
			});

			await waitFor(() => {
				expect(result.current.address).toBe(validAddress);
				expect(result.current.addressError).toBeNull();
				expect(result.current.isConnected).toBe(true);
			});
		});

		it("should handle validation failure (LibAuth returns error string)", async () => {
			(decodeCashAddress as Mock).mockReturnValue("Checksum mismatch");

			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({
					session: createMockSession("bad-address"),
				}),
			});

			await waitFor(() => {
				expect(result.current.address).toBeNull();
				expect(result.current.addressError).toBeDefined();
				expect(result.current.addressError?.message).toContain(
					"Error decoding it",
				);
				expect(result.current.isError).toBe(true);
			});
		});

		it("should handle missing namespace/accounts in session", async () => {
			const emptySession = {
				topic: "t",
				namespaces: { bch: { accounts: [] } },
			} as unknown as SessionTypes.Struct;

			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({ session: emptySession }),
			});

			await waitFor(() => {
				expect(result.current.address).toBeNull();
				expect(result.current.addressError?.message).toContain(
					"No address found in session",
				);
			});
		});
	});

	describe("Token Address Derivation", () => {
		it("should derive token address when cash address is valid", async () => {
			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({ session: createMockSession("qvalid") }),
			});

			await waitFor(() => {
				expect(result.current.address).toBe("qvalid");
				expect(result.current.tokenAddress).toBe("z-token-address");
				expect(addressToTokenAddress).toHaveBeenCalledWith({
					address: "qvalid",
					network: NETWORK_INDEX.mainnet,
				});
			});
		});

		it("should handle token derivation errors (e.g. invalid network params)", async () => {
			(addressToTokenAddress as Mock).mockImplementation(() => {
				throw new Error("Conversion failed");
			});

			const { result } = renderHook(() => useWallet(), {
				wrapper: createWrapper({ session: createMockSession("qvalid") }),
			});

			await waitFor(() => {
				expect(result.current.tokenAddress).toBeNull();
				expect(result.current.tokenAddressError).toEqual(
					new Error("Conversion failed"),
				);
				expect(result.current.isError).toBe(true);
			});
		});

		it("should reset token address if main address becomes null", async () => {
			const defaultContext: WalletConnectContext = {
				config: {
					projectId: "test",
					network: NETWORK_INDEX.mainnet,
					metadata: { name: "", description: "", url: "", icons: [] },
					debug: false,
				},
				session: null,
				// biome-ignore lint/suspicious: any
				signClient: { on: vi.fn(), removeListener: vi.fn() } as any,
				connect: vi.fn(),
				disconnect: vi.fn(),
				connectError: null,
				disconnectError: null,
			};

			let currentSession: SessionTypes.Struct | null =
				createMockSession("qvalid");

			const MutableWrapper = ({ children }: { children: React.ReactNode }) => (
				<WalletConnectContext.Provider
					value={{ ...defaultContext, session: currentSession }}
				>
					{children}
				</WalletConnectContext.Provider>
			);

			const { result, rerender } = renderHook(() => useWallet(), {
				wrapper: MutableWrapper,
			});

			await waitFor(() =>
				expect(result.current.tokenAddress).toBe("z-token-address"),
			);

			currentSession = null;

			rerender();

			await waitFor(() => {
				expect(result.current.address).toBeNull();
				expect(result.current.tokenAddress).toBeNull();
				expect(result.current.tokenAddressError).toBeNull();
			});
		});

		describe("Refetching & Loading", () => {
			it("should refetch addresses manually and update state", async () => {
				let resolveFetch: (val: string[]) => void = () => {};
				const fetchPromise = new Promise<string[]>((r) => {
					resolveFetch = r;
				});

				mockGetAddresses.mockReturnValue(fetchPromise);

				const { result } = renderHook(() => useWallet(), {
					wrapper: createWrapper({ session: createMockSession("old") }),
				});

				let promise: Promise<void>;
				await act(async () => {
					promise = result.current.refetchAddresses();
				});

				expect(result.current.areAddressesLoading).toBe(true);

				await act(async () => {
					resolveFetch(["newaddress"]);
					if (!promise) return;
					await promise;
				});

				expect(result.current.areAddressesLoading).toBe(false);
				expect(result.current.address).toBe("newaddress");
			});

			it("should preserve existing address if refetch fails (Reliability Check)", async () => {
				const { result } = renderHook(() => useWallet(), {
					wrapper: createWrapper({
						session: createMockSession("safe-address"),
					}),
				});

				await waitFor(() =>
					expect(result.current.address).toBe("safe-address"),
				);

				mockGetAddresses.mockRejectedValue(new Error("Network Error"));

				await act(async () => {
					await result.current.refetchAddresses();
				});

				expect(result.current.addressError).toEqual(new Error("Network Error"));
				expect(result.current.address).toBe("safe-address");
				expect(result.current.areAddressesLoading).toBe(false);
			});
		});

		describe("Event Listeners", () => {
			it("should listen for addressesChanged and trigger refetch", async () => {
				const mockOn = vi.fn();
				const mockRemove = vi.fn();

				const { result, unmount } = renderHook(() => useWallet(), {
					wrapper: createWrapper({
						session: createMockSession("qvalid"),
						// biome-ignore lint/suspicious: any
						signClient: { on: mockOn, removeListener: mockRemove } as any,
					}),
				});

				expect(mockOn).toHaveBeenCalledWith(
					"addressesChanged",
					expect.any(Function),
				);

				const callback = mockOn.mock.calls[0][1];
				mockGetAddresses.mockResolvedValue(["event-address"]);

				await act(async () => {
					callback();
				});

				expect(mockGetAddresses).toHaveBeenCalled();
				expect(result.current.address).toBe("event-address");

				unmount();
				expect(mockRemove).toHaveBeenCalledWith(
					"addressesChanged",
					expect.any(Function),
				);
			});
		});

		describe("Debugging", () => {
			it("should log namespace info if debug is true", async () => {
				const logSpy = vi.spyOn(console, "log");

				renderHook(() => useWallet(), {
					wrapper: createWrapper({
						session: createMockSession("qdebug"),
						config: {
							projectId: "t",
							network: "mainnet",
							// biome-ignore lint/suspicious: any
							metadata: {} as any,
							debug: true,
						},
					}),
				});

				await waitFor(() => {
					expect(logSpy).toHaveBeenCalledWith(
						"NAMESPACE RECEIVED ADDRESS: ",
						"bch:qdebug",
					);
				});
			});
		});
	});
});
