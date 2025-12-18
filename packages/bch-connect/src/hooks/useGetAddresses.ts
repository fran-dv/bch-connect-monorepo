import { useWalletConnectContext } from "@/contexts/WalletConnectContext";
import { BCH_METHOD, CAIP_NETWORK_ID } from "@/models/config";

export interface UseGetAddressesReturnType {
  getAddresses: () => Promise<string[] | undefined>;
}

export const useGetAddresses = (): UseGetAddressesReturnType => {
  const { signClient, session, config } = useWalletConnectContext();

  const getAddresses = async (): Promise<string[] | undefined> => {
    if (!signClient || !session) {
      throw new Error(
        "Error getting addresses: Provider or session is not defined",
      );
    }

    try {
      const addresses = await signClient.request<string[]>({
        chainId: CAIP_NETWORK_ID[config.network],
        topic: session.topic,
        request: {
          method: BCH_METHOD.getAddresses,
          params: { token: true },
        },
      });

      if (addresses.length === 0) {
        throw new Error(
          "No addresses found calling getAddresses: Received an empty array",
        );
      }

      return addresses;
    } catch (err) {
      throw err as Error & { code: number };
    }
  };

  return {
    getAddresses,
  };
};

export default useGetAddresses;
