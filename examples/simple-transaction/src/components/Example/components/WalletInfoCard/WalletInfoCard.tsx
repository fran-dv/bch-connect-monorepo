import { Address } from "@/components/Address";

interface Props {
  isConnected: boolean;
  address: string | null;
  tokenAddress: string | null;
  balance: number | undefined;
  balanceError: string | null;
}
export const WalletInfoCard: React.FC<Props> = ({
  address,
  tokenAddress,
  balance,
  balanceError,
  isConnected,
}) => {
  if (!isConnected || !address || !tokenAddress) return null;

  return (
    <div className="flex flex-col w-full gap-4 items-start p-6 md:p-10 bg-black-bch/75 z-10 rounded-3xl shadow-xl backdrop-blur-xs text-white-bch ">
      <p className="inline-flex items-center">
        <span className="mr-1 font-bold text-base sm:text-lg ">Address:</span>{" "}
        <Address address={address} />
      </p>
      <p className="inline-flex items-center">
        <span className="mr-1 font-bold text-base sm:text-lg ">
          Token Address:
        </span>{" "}
        <Address address={tokenAddress} />
      </p>
      <p className="inline-flex items-center">
        <span className="mr-1 font-bold text-base sm:text-lg ">
          Balance in sats:
        </span>{" "}
        {balanceError
          ? `${balanceError}. Please reload the page`
          : (balance ?? "Loading balance...")}
      </p>
    </div>
  );
};
