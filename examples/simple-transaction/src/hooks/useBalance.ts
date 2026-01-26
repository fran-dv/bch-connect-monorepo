import { useEffect, useState } from "react";
import useNetworkProviderStore from "@/stores/useNetworkProviderStore";

interface Props {
	address: string | null;
}

export const useBalance = ({ address }: Props) => {
	const { provider } = useNetworkProviderStore();
	const [balance, setBalance] = useState<number | undefined>(undefined);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!address || !provider) return;

		const fetchBalance = async () => {
			try {
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
			}
		};
		fetchBalance();

		const interval = setInterval(fetchBalance, 10000);

		return () => clearInterval(interval);
	}, [address, provider]);
	return {
		balance,
		error,
	};
};

export default useBalance;
