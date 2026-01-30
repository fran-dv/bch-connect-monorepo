import { ExitIcon } from "@radix-ui/react-icons";
import { useWallet } from "bch-connect";
import type { ButtonHTMLAttributes } from "react";
import { Address } from "@/components/Address";
import { BackgroundGradient } from "./components/BackgroundGradient";

export const ConnectButton: React.FC<
	ButtonHTMLAttributes<HTMLButtonElement>
> = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
	const { connect, isConnected, address, disconnect } = useWallet();

	const handleWalletConnect = () => {
		if (isConnected) return;
		connect();
	};
	const handleWalletDisconnect = () => {
		disconnect();
	};

	const buttonClassName =
		"bg-transparent rounded-full px-5 cursor-pointer py-2 hover:translate-y-px transition-transform text-white-bch font-bold text-sm sm:text-base";
	return (
		<div className="flex items-center gap-2 cursor-pointer">
			<BackgroundGradient className="rounded-full cursor-pointer" animate>
				{isConnected && address ? (
					<div className={buttonClassName}>
						<Address address={address} />
					</div>
				) : (
					<button
						{...props}
						type="button"
						className={buttonClassName}
						aria-label="Connect wallet"
						title="Connect Bitcoin Cash wallet"
						onClick={handleWalletConnect}
					>
						Connect Wallet
					</button>
				)}
			</BackgroundGradient>
			{isConnected && (
				<button
					type="button"
					title="Disconnect wallet"
					className="cursor-pointer"
					onClick={handleWalletDisconnect}
				>
					<ExitIcon className="text-white-bch w-4 sm:w-6 h-auto aspect-square" />
				</button>
			)}
		</div>
	);
};

export default ConnectButton;
