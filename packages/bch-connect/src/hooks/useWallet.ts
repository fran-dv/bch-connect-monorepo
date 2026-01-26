import { decodeCashAddress } from "@bitauth/libauth";
import type { SessionTypes } from "@walletconnect/types";
import { useCallback, useEffect, useState } from "react";
import {
	type ConnectWalletCallback,
	type DisconnectWalletCallback,
	useWalletConnectContext,
} from "@/contexts/WalletConnectContext";
import useGetAddresses from "@/hooks/useGetAddresses";
import { BCH_EVENT } from "@/models/config";
import addressToTokenAddress from "@/utils/addressToTokenAddress";

export interface UseWalletReturnType {
	address: string | null;
	tokenAddress: string | null;
	areAddressesLoading: boolean;
	addressError: Error | null;
	tokenAddressError: Error | null;
	isConnected: boolean;
	session: SessionTypes.Struct | null;
	connectError: Error | null;
	disconnectError: Error | null;
	isError: boolean;
	connect: ConnectWalletCallback;
	disconnect: DisconnectWalletCallback;
	refetchAddresses: () => Promise<void>;
}

export const useWallet = (): UseWalletReturnType => {
	const {
		connect,
		disconnect,
		signClient,
		session,
		config,
		connectError,
		disconnectError,
	} = useWalletConnectContext();
	const { getAddresses } = useGetAddresses();
	const [address, setAddress] = useState<string | null>(null);
	const [areAddressesLoading, setAreAddressesLoading] = useState(false);
	const [addressError, setAddressError] = useState<Error | null>(null);
	const [tokenAddress, setTokenAddress] = useState<string | null>(null);
	const [tokenAddressError, setTokenAddressError] = useState<Error | null>(
		null,
	);
	const isConnected = !!session;
	const isError =
		!!connectError ||
		!!disconnectError ||
		!!addressError ||
		!!tokenAddressError;

	const fetchAddresses = useCallback(async () => {
		setAreAddressesLoading(true);
		try {
			const addresses = await getAddresses();

			if (!addresses) {
				throw new Error("No addresses found calling getAddresses");
			}

			setAddress(addresses[0]);
			setAddressError(null);
		} catch (err) {
			// The previous address remains
			setAddressError(err as Error);
		} finally {
			setAreAddressesLoading(false);
		}
	}, [getAddresses]);

	useEffect(() => {
		if (!session) {
			setAddress(null);
			return;
		}

		const namespaceAddress = session.namespaces.bch.accounts[0];
		if (!namespaceAddress) {
			setAddressError(new Error("No address found in session's namespace"));
			setAddress(null);
			return;
		}

		if (config.debug)
			console.log("NAMESPACE RECEIVED ADDRESS: ", namespaceAddress);
		const prefix = "bch:";
		const cleanAddress = namespaceAddress.replace(prefix, "");

		const decodedAddress = decodeCashAddress(cleanAddress);
		const isValidAdress = typeof decodedAddress !== "string";
		if (!isValidAdress) {
			setAddress(null);
			setAddressError(
				new Error(
					`Invalid namespace received address: ${cleanAddress}. Error decoding it: ${decodedAddress}`,
				),
			);
			return;
		}

		setAddress(cleanAddress);
		setAddressError(null);
	}, [session, config.debug]);

	useEffect(() => {
		if (!signClient) return;

		// biome-ignore lint/suspicious: any
		const addressEvent = BCH_EVENT.addressesChanged as any;
		const handleAddressesChanged = () => fetchAddresses();
		signClient.on(addressEvent, handleAddressesChanged);

		return () => {
			signClient.removeListener(addressEvent, handleAddressesChanged);
		};
	}, [fetchAddresses, signClient]);

	useEffect(() => {
		if (!address) {
			setTokenAddress(null);
			setTokenAddressError(null);
			return;
		}

		try {
			const tokenAddress = addressToTokenAddress({
				address,
				network: config.network,
			});
			setTokenAddress(tokenAddress);
			setTokenAddressError(null);
		} catch (err) {
			setTokenAddress(null);
			setTokenAddressError(err as Error);
		}
	}, [address, config.network]);

	return {
		address,
		tokenAddress,
		areAddressesLoading,
		addressError,
		tokenAddressError,
		isConnected,
		session,
		connectError,
		disconnectError,
		isError,
		connect,
		disconnect,
		refetchAddresses: fetchAddresses,
	};
};

export default useWallet;
