# BCH Connect

[![npm version](https://img.shields.io/npm/v/bch-connect.svg?style=flat-square)](https://www.npmjs.com/package/bch-connect)
[![License](https://img.shields.io/github/license/fran-dv/bch-connect?style=flat-square)](./LICENSE)

A React library to seamlessly integrate Bitcoin Cash wallet connections in your dApps. 🚀

It abstracts the implementation of [wc2-bch-bcr](https://github.com/mainnet-pat/wc2-bch-bcr) and [Reown AppKit](https://docs.reown.com/appkit/javascript/core/installation#others-networks-appkit-core-3), providing simple React hooks to connect and use Bitcoin Cash wallets.

> ⚠️ This library is at its early stages, so expect changes and bugs, and use it at your own risk.

**Supported wallets:**

- [Cashonize](https://cashonize.com) (Mainnet and Testnet)
- [Zapit](https://zapit.io/) (Mainnet only)

> Other wallets which implement wc2-bch-bcr may work, but I haven't tested them. [Paytaca](https://www.paytaca.com/) hasn't worked for me. If you know how to make it work, please consider contributing!

## Table of contents

- [⚡ Getting started](#getting-started)
- [💡 Example](#example)
- [🌱 Roadmap](#roadmap)
- [🧩 API reference](#api-reference)
- [🧑‍💻 Local development](#local-development)
- [🤝 Contribute](#contribute)

## <a name="getting-started"></a> ⚡ Getting started

Installing and using **bch-connect** is straightforward. Just follow these steps:

**1. Install the package:**

```bash
npm install bch-connect
# or
bun add bch-connect
# or
yarn add bch-connect
```

**2. Set up your configuration**

You'll need a Reown project ID. Get it from [Reown dashboard](https://dashboard.reown.com). Then, in your `main.tsx`, `App`, or in a specific `config.ts` file:

```tsx
import { createConfig } from "bch-connect";

export const config = createConfig({
  projectId: "your-reown-project-id", // Get it from https://dashboard.reown.com
  network: "testnet", // or "mainnet"
  metadata: {
    name: "Your dApp name",
    description: "Your dApp description",
    url: "https://your-dapp.com",
    icons: ["https://placehold.co/600x400?text=YourDApp"],
  },
});
```

**3. Wrap your app with the provider**

In your `main.tsx` or `App`:

```tsx
// App.tsx
import { config } from "./your-config-file";
import { BCHConnectProvider } from "bch-connect";

function App() {
  return (
    <BCHConnectProvider config={config}>
      <RestOfYourApp />
    </BCHConnectProvider>
  );
}
```

**4. Start using it!**

```tsx
import { useWallet } from "bch-connect";

function ConnectButton() {
  const { connect } = useWallet();

  return <button onClick={connect}>Connect Wallet</button>;
}
```

If you have any doubts, here's a minimal setup example:

```tsx
// App.tsx
import { createConfig, BCHConnectProvider } from "bch-connect";

const config = createConfig({
  projectId: "your-reown-project-id", // Get it from https://dashboard.reown.com
  network: "testnet", // or "mainnet"
  metadata: {
    name: "Your dApp name",
    description: "Your dApp description",
    url: "https://your-dapp.com",
    icons: ["https://placehold.co/600x400?text=YourDApp"],
  },
});

function App() {
  return (
    <BCHConnectProvider config={config}>
      {/* Rest of your app */}
    </BCHConnectProvider>
  );
}
```

See the [Example](#example) section for a working demo.

## <a name="example"></a> 💡 Example

Visit the example [**live demo here**](https://bch-connect-example.netlify.app/).

Below are some code snippets from the example app. To view the full source code or run it locally, check the [example](examples) folder in this repository.

### Connect button:

```tsx
// other imports...
import { useWallet } from "bch-connect";

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

  return (
    <>
      {/* ... other UI code ... */}
      <button {...props} onClick={handleWalletConnect}>
        {isConnected && address ? (
          <Address address={address} />
        ) : (
          "Connect Wallet"
        )}
      </button>

      {isConnected && (
        <button title="Disconnect wallet" onClick={handleWalletDisconnect}>
          <ExitIcon />
        </button>
      )}
    </>
  );
};

export default ConnectButton;
```

### Sending transactions with recipient and amount entered through a form:

```tsx
// other imports...
import type { WcTransactionObject } from "cashscript";
import { useSignTransaction, useWallet } from "bch-connect";

export const Example: React.FC = () => {
  // bch-connect hooks
  const { address, tokenAddress, isConnected } = useWallet();
  const { signTransaction } = useSignTransaction();
  // -----------------

  // other hooks from the example project
  const { showSuccess, showError, showMessage } = useUserMessages();
  const { provider } = useNetworkProviderStore();
  const { balance, error: balanceError } = useBalance({ address: address });
  const [isLoading, setIsLoading] = useState(false);

  const proposeTransactionToWallet = async (values: TransferFormValues) => {
    if (!address || !provider) return;

    setIsLoading(true);

    // helper function which creates a transaction object using CashScript
    const wcTransactionObj: WcTransactionObject = await getSimpleTransaction({
      provider,
      sender: address,
      amount: values.satoshis,
      recipient: values.recipient,
    });

    showMessage("Please sign the transaction in your wallet...");

    // Request signature of the generated transaction to the wallet
    // showing feedback to the user
    try {
      await signTransaction(wcTransactionObj);
      showSuccess("Transaction signed successfully");
    } catch (error) {
      const errorMsg = (error as { message: string }).message;
      showError("Failed to sign transaction: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Below, TransferCard has the form, which call proposeTransactionToWallet on submit
  // WalletInfoCard just shows addresses and balance
  return (
    <section>
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
```

## <a name="roadmap"></a> 🌱 Roadmap

**Current focus**

- Compatibilize with all wallets out of the box
- Write automated tests
- Build a custom UI
- Create a good online documentation

**Next tasks**

- Engage with the community and promote the library
- Iterate and improve based on feedback

### Future possibilities

- Expand the library beyond React (Vue, vanila JS, etc.)
- Add support for CashConnect specification which is currently in pre-alpha

## <a name="api-reference"></a> 🧩 API Reference

### `createConfig(options: Configuration): Configuration`

Creates the configuration object required by `BCHConnectProvider`.

**Parameters:**

- `options`: `Configuration` object.

```ts
interface Configuration {
  projectId: string;
  network: "mainnet" | "testnet" | "regtest";
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  modalConfig?: Omit<
    CreateAppKit,
    | "projectId"
    | "metadata"
    | "manualWCControl"
    | "networks"
    | "universalProvider"
  >;
}
```

**Returns:**

- Same `Configuration` object.

### `<BCHConnectProvider config={config}>`

Provides the React context for BCH Connect, enabling wallet connections throughout your app.  
This should wrap your root component (e.g. `App.tsx`).

**Props:**

- `config`: `Configuration` – the object returned by [`createConfig`](#createconfigoptions-configuration-configuration).
- `children`: `React.ReactNode` – your application components.

### `useWallet()`

React hook to access the current wallet connection state and perform connect/disconnect actions.  
Must be used within a `<BCHConnectProvider>` context.

**Returns:**

- `address` – the currently connected wallet address. It is automatically refetched when an `addressesChanged` event is emitted by the wallet.
- `tokenAddress` – the [CashTokens](https://cashtokens.org/) aware address of the wallet, derived from `address`. It is automatically refetched when `address` changes.
- `refetchAddresses()` – programmatically refetches `address`, updating both `address` and `tokenAddress` states.
- `areAddressesLoading` – boolean indicating whether the addresses are currently being loaded.
- `addressError` – error object if an error occurred while fetching the address.
- `tokenAddressError` – error object if an error occurred while fetching the token address.
- `isConnected` – boolean indicating whether a wallet is currently connected.
- `connectError` – error object if an error occurred while connecting to a wallet.
- `disconnectError` – error object if an error occurred while disconnecting from a wallet.
- `isError` – boolean indicating whether an error occurred.

```ts
interface UseWalletReturnType {
  address: string | null;
  tokenAddress: string | null;
  areAddressesLoading: boolean;
  addressError: Error | null;
  tokenAddressError: Error | null;
  isConnected: boolean;
  connectError: Error | null;
  disconnectError: Error | null;
  isError: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refetchAddresses: () => Promise<void>;
}
```

### `useSignTransaction()`

React hook to sign Bitcoin Cash transactions with the connected wallet.  
It works when your app is wrapped with `<BCHConnectProvider>` and when a wallet session is active.

**Returns:**

```ts
interface UseSignTransactionReturnType {
  signTransaction: (
    options: WcSignTransactionRequest
  ) => Promise<WcSignTransactionResponse | undefined>;
}
```

`WcSignTransactionRequest` and `WcSignTransactionResponse` are interfaces from [`@bch-wc2/interfaces`](https://github.com/mainnet-pat/bch-wc2), which are also re-exported by `bch-connect` for convenience.

**`signTransaction` parameters:**

- `options`: `WcSignTransactionRequest`

```ts
interface WcSignTransactionRequest {
  transaction: Transaction | string;
  sourceOutputs: WcSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}
```

You’ll commonly pass a `WcTransactionObject` from `cashscript` as the parameter to this function, which is fully supported

**`signTransaction` returns:**

- `Promise<WcSignTransactionResponse | undefined>` – resolves with the signed transaction response, or undefined if signing failed.

```ts
interface WcSignTransactionResponse {
  signedTransaction: string;
  signedTransactionHash: string;
}
```

### `useSignMessage()`

React hook to sign arbitrary messages with the connected wallet.  
It works when your app is wrapped with `<BCHConnectProvider>` and when a wallet session is active.

**Returns:**

```ts
interface UseSignMessageReturnType {
  signMessage: (
    options: WcSignMessageRequest
  ) => Promise<WcSignMessageResponse | undefined>;
}
```

`WcSignMessageRequest` and `WcSignMessageResponse` are interfaces from [`@bch-wc2/interfaces`](https://github.com/mainnet-pat/bch-wc2), which are also re-exported by `bch-connect` for convenience.

**`signMessage` parameters:**

- `options`: `WcSignMessageRequest`

```ts
interface WcSignMessageRequest {
  message: string;
  userPrompt?: string;
}
```

**`signMessage` returns:**

- `Promise<WcSignMessageResponse | undefined>` – resolves with the message signature as a string, or undefined if signing failed.

```ts
type WcSignMessageResponse = string;
```

## <a name="local-development"></a> 🧑‍💻 Local Development

To run this repository locally for development, follow these steps:

1. Clone the repository

```bash
git clone https://github.com/fran-dv/bch-connect.git
```

2. Install dependencies

From the root of the repository:

```bash
bun install
```

This will install dependencies for both the library (packages/bch-connect) and the example app (examples).

3. Run the library in development mode

To test the library live while developing, first link it in the example app’s package.json:

```jsonc
"dependencies": {
  // ...
  "bch-connect": "workspaces:*"
}
```

Then, start the development server for the library:

```bash
cd packages/bch-connect
bun dev #or the equivalent command for your package manager
```

4. Run the example app

In a separate terminal:

```bash
cd examples
bun dev #or the equivalent command for your package manager
```

> **Note:** The example project runs its scripts with Bun. If you prefer Node.js, you can update the scripts in `examples/package.json` accordingly.

## <a name="contribute"></a> 🤝 Contribute

This project is open source and contributions are more than welcome!

Licensed under MIT – feel free to copy, modify, and use the code in your own projects.

---

Built with 💚 by [fran-dv](https://github.com/fran-dv)
