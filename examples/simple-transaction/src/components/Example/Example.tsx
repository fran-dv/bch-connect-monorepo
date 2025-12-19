import {
  TransferCard,
  type TransferFormValues,
} from "./components/TransferCard";
import { WalletInfoCard } from "./components/WalletInfoCard";
import { useUserMessages } from "@/hooks/useUserMessages";
import useBalance from "@/hooks/useBalance";
import useNetworkProviderStore from "@/stores/useNetworkProviderStore";
import { getSimpleTransaction } from "@/utils/getSimpleTransaction";
import { useState } from "react";
import { useSignTransaction, useWallet } from "bch-connect";

export const Example: React.FC = () => {
  // bch-connect hooks
  const { address, tokenAddress, isConnected } = useWallet();
  const { signTransaction } = useSignTransaction();
  // -----------------
  const { showSuccess, showError, showMessage } = useUserMessages();
  const { provider } = useNetworkProviderStore();
  const { balance, error: balanceError } = useBalance({ address: address });
  const [isLoading, setIsLoading] = useState(false);

  const proposeTransactionToWallet = async (values: TransferFormValues) => {
    if (!isConnected || !address || !provider) return;

    setIsLoading(true);

    const wcTransactionObj = await getSimpleTransaction({
      provider,
      sender: address,
      amount: values.satoshis,
      recipient: values.recipient,
    });

    showMessage("Please sign the transaction in your wallet...");
    try {
      const response = await signTransaction({ txRequest: wcTransactionObj });
      if (!response) {
        showMessage(
          "Transaction status couldn’t be tracked. Please check your wallet to see if it was sent or rejected.",
        );
        return;
      }
      showSuccess(
        `Tx signed successfully. Hash: ${response.signedTransactionHash}`,
      );
    } catch (error) {
      const errorMsg = (error as Error).message;
      showError("Failed to sign transaction: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 pt-12 max-w-[800px] m-auto">
      <TransferCard
        isConnected={isConnected}
        onFormSubmit={proposeTransactionToWallet}
        balance={balance}
        isLoading={isLoading}
      />
      <WalletInfoCard
        isConnected={isConnected}
        address={address}
        tokenAddress={tokenAddress}
        balance={balance}
        balanceError={balanceError}
      />
    </section>
  );
};

export default Example;
