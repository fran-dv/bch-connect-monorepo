import { useEffect, useRef, useState } from "react";
import useNetworkProviderStore from "@/stores/useNetworkProviderStore";

interface Props {
	address: string | null;
}

export const useBalance = ({ address }: Props) => {
	const { provider } = useNetworkProviderStore();
	const [balance, setBalance] = useState<number | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);
	const isFetchingRef = useRef<boolean>(false);

	useEffect(() => {
		if (!address || !provider) return;

		let current = true;
		const fetchBalance = async () => {
			if (isFetchingRef.current) return;

			isFetchingRef.current = true;
			try {
				if (!current) return;

				const utxos = await provider.getUtxos(address);
				const balanceInSats = utxos.reduce(
					(acc, utxo) => acc + utxo.satoshis,
					0n,
				);
				setBalance(Number(balanceInSats));
				setError(null);
			} catch (error) {
				console.error("Error fetching balance:", error);
				setError("Error fetching balance");
			} finally {
				isFetchingRef.current = false;
			}
		};
		fetchBalance();

		const interval = setInterval(fetchBalance, 10000);

		return () => {
			current = false;
			clearInterval(interval);
		};
	}, [address, provider]);
	return {
		balance,
		error,
	};
};

export default useBalance;
