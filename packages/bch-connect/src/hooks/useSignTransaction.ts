import type {
  WcSignTransactionRequest,
  WcSignTransactionResponse,
} from "@bch-wc2/interfaces";
import { useWalletConnectContext } from "@/contexts/WalletConnectContext";
import { stringify } from "@bitauth/libauth";
import { isEmptyObject } from "@/utils/isEmptyObject";
import { BCH_METHOD, CAIP_NETWORK_ID } from "@/models/config";

export interface SignTransactionOpts {
  txRequest: WcSignTransactionRequest;
  requestExpirySeconds?: number;
}

export interface UseSignTransactionReturnType {
  signTransaction: (
    options: SignTransactionOpts,
  ) => Promise<WcSignTransactionResponse | null>;
}

export const useSignTransaction = (): UseSignTransactionReturnType => {
  const { signClient, session, config } = useWalletConnectContext();

  const signTransaction = async ({
    txRequest,
    requestExpirySeconds = 300,
  }: SignTransactionOpts): Promise<WcSignTransactionResponse | null> => {
    if (!signClient || !session) {
      if (config.debug) console.error("Provider or session is not defined");
      throw new Error(
        "Error signing transactions: Provider or session is not defined",
      );
    }

    try {
      const params = JSON.parse(stringify(txRequest));
      const response = await signClient.request<WcSignTransactionResponse>({
        chainId: CAIP_NETWORK_ID[config.network],
        topic: session.topic,
        request: {
          method: BCH_METHOD.signTransaction,
          params,
        },
        expiry: requestExpirySeconds,
      });
      if (config.debug) console.log("TRANSACTION SIGNING RESPONSE: ", response);
      return response;
    } catch (err) {
      if (config.debug) console.error("ERROR CAUGHT SIGNING TRANSACTION:", err);

      // NOTE:
      // Paytaca <= 0.22.11 sometimes responds to `bch_signTransaction`
      // with a bare `{}` instead of a valid response.
      // WalletConnect treats this as an error and throws it, sometimes even when
      // the transaction was actually signed and broadcast successfully. If we
      // rethrow this value, dApps will report a potentially successful payment
      // as a failure.
      // To handle this bug, we return `null` so the caller can show a neutral
      // “tx status unknown, please verify in your wallet” message instead of an
      // incorrect error.
      // This behavior is documented here: https://bchconnect.dev/docs/empty-object-response-bug
      if (isEmptyObject(err)) {
        if (config.debug) {
          console.log(
            "❗WRONG RESPONSE RECEIVED FROM WALLET (RECEIVED EMPTY OBJECT: `{}`)\n",
          );
        }
        console.warn(
          "[bch-connect/useSignTransaction] Wallet returned an invalid" +
            "WalletConnect response (empty object). This is a known issue with" +
            "Paytaca <= 0.22.11. The transaction may still be signed or rejected" +
            "by the user, so `null` is returned instead of throwing, allowing" +
            "you to show a neutral “tx status unknown, please verify in your" +
            "wallet message. See the docs for details: https://bchconnect.dev/docs/empty-object-response-bug",
        );

        return null;
      }

      throw err;
    }
  };

  return {
    signTransaction,
  };
};

export default useSignTransaction;
