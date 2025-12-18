import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import useGetAddresses from "./useGetAddresses";
import { WalletConnectContext } from "@/contexts/WalletConnectContext";
import { BCH_METHOD, CAIP_NETWORK_ID, NETWORK_INDEX } from "@/models/config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createWrapper = (contextOverrides: any = {}) => {
  return ({ children }: { children: React.ReactNode }) => (
    <WalletConnectContext.Provider
      value={
        {
          signClient: { request: vi.fn() },
          session: { topic: "test-topic" },
          config: { network: NETWORK_INDEX.mainnet },
          ...contextOverrides,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }
    >
      {children}
    </WalletConnectContext.Provider>
  );
};

describe("hooks/useGetAddresses", () => {
  const mockRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches addresses and sends the correct request payload (mainnet)", async () => {
    const expectedAddresses = ["bitcoincash:qtestaddress"];
    mockRequest.mockResolvedValue(expectedAddresses);

    const { result } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({
        signClient: { request: mockRequest },
      }),
    });

    const response = await result.current.getAddresses();

    expect(response).toEqual(expectedAddresses);

    expect(mockRequest).toHaveBeenCalledWith({
      chainId: CAIP_NETWORK_ID.mainnet,
      topic: "test-topic",
      request: {
        method: BCH_METHOD.getAddresses,
        params: { token: true },
      },
    });
  });

  it("uses the correct chainId when network is TESTNET", async () => {
    mockRequest.mockResolvedValue(["address"]);

    const { result } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({
        signClient: { request: mockRequest },
        config: { network: NETWORK_INDEX.testnet },
      }),
    });

    await result.current.getAddresses();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: CAIP_NETWORK_ID.testnet,
      }),
    );
  });

  it("uses the correct chainId when network is REGTEST", async () => {
    mockRequest.mockResolvedValue(["address"]);

    const { result } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({
        signClient: { request: mockRequest },
        config: { network: NETWORK_INDEX.regtest },
      }),
    });

    await result.current.getAddresses();

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: CAIP_NETWORK_ID.regtest,
      }),
    );
  });

  it("throws a clear error if signClient or session is missing", async () => {
    const { result: res1 } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({ signClient: null }),
    });

    await expect(res1.current.getAddresses()).rejects.toThrow(
      "Error getting addresses: Provider or session is not defined",
    );

    const { result: res2 } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({ session: null }),
    });

    await expect(res2.current.getAddresses()).rejects.toThrow(
      "Error getting addresses: Provider or session is not defined",
    );

    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("throws a specific error when WalletConnect returns an empty array", async () => {
    mockRequest.mockResolvedValue([]);

    const { result } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({
        signClient: { request: mockRequest },
      }),
    });

    await expect(result.current.getAddresses()).rejects.toThrow(
      "No addresses found calling getAddresses: Received an empty array",
    );
  });

  it("propagates errors thrown by the WalletConnect client", async () => {
    const walletError = new Error("User rejected request");
    mockRequest.mockRejectedValue(walletError);

    const { result } = renderHook(() => useGetAddresses(), {
      wrapper: createWrapper({
        signClient: { request: mockRequest },
      }),
    });

    await expect(result.current.getAddresses()).rejects.toThrow(
      "User rejected request",
    );
  });
});
