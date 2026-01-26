import {
	type NetworkProvider,
	placeholderP2PKHUnlocker,
	TransactionBuilder,
	type WcTransactionObject,
} from "cashscript";

export interface GetSimpleTransactionParams {
	provider: NetworkProvider;
	amount: number;
	recipient: string;
	sender: string;
}

export const getSimpleTransaction = async ({
	provider,
	amount,
	recipient,
	sender,
}: GetSimpleTransactionParams): Promise<WcTransactionObject> => {
	const connectedWalletUTXOs = await provider.getUtxos(sender);
	const placeHolderUnlocker = placeholderP2PKHUnlocker(sender);
	const outputAmount = BigInt(amount);
	const changeAmount =
		connectedWalletUTXOs.reduce((acc, utxo) => acc + utxo.satoshis, 0n) -
		outputAmount -
		1000n;
	const transactionBuilder = new TransactionBuilder({ provider });
	transactionBuilder.addInputs(connectedWalletUTXOs, placeHolderUnlocker);
	transactionBuilder.addOutput({
		to: recipient,
		amount: outputAmount,
	});
	if (changeAmount > 550n) {
		transactionBuilder.addOutput({
			to: sender,
			amount: changeAmount,
		});
	}

	const wcTransactionObj = transactionBuilder.generateWcTransactionObject({
		broadcast: true,
		userPrompt: `Transfer ${amount} sats to ${recipient.replace("bchtest:", "").slice(0, 6)}...${recipient.replace("bchtest:", "").slice(-6)} on the testnet`,
	});

	return wcTransactionObj;
};
