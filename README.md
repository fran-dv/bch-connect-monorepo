# BCH Connect

[![npm version](https://img.shields.io/npm/v/bch-connect.svg?style=flat-square)](https://www.npmjs.com/package/bch-connect)
[![License](https://img.shields.io/github/license/fran-dv/bch-connect?style=flat-square)](./LICENSE)

A React library to seamlessly integrate Bitcoin Cash wallet connections in your dApps. 🚀

**_🚧 Actively working on online docs..._**

## Table of contents

- [⚡ Getting started](#getting-started)
- [💡 Example](#example)
- [🧩 API reference](#api-reference)
- [🧑‍💻 Local development](#local-development)
- [🤝 Contribute](#contribute)

## <a name="getting-started"></a> ⚡ Getting started

### Quick Start

The easiest way to build a BCH dApp is using our scaffolding tool. It sets up **React + Vite** or **Next.js** with TypeScript and BCH Connect pre-configured and ready to use.

Just run:

```bash
bun create bch-dapp
# Or use your preferred package manager.
```

### Manual installation

If you already have a project and want to add **bch-connect**, follow these steps:

**1. Install the package:**

```bash
npm install bch-connect
```

Or replace `npm` with your preferred package manager.

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
  debug: true,
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

const ConnectButton = () => {
  const { connect } = useWallet();

  return <button onClick={connect}>Connect Wallet</button>;
};
```

## <a name="example"></a> 💡 Example

Visit the example [**live demo here**](https://bch-connect-example.netlify.app/).

Below are some code snippets from the example app. To view the full code or run it locally, check the [simple-transaction example](examples/simple-transaction/) folder in this repository.

### Connect button:

```tsx
// other imports...
import { useWallet } from "bch-connect";

// styles and UI code are omitted here
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
    <div>
      <button {...props} onClick={handleWalletConnect}>
        {isConnected && address ? (
          <Address address={address} />
        ) : (
          "Connect Wallet"
        )}
      </button>

      {isConnected && (
        <button onClick={handleWalletDisconnect}>
          <ExitIcon />
        </button>
      )}
    </div>
  );
};

export default ConnectButton;
```

### Sending a transaction using bch-connect and cashscript SDK, with recipient and amount entered through a form:

```tsx
// other imports...
import { useSignTransaction, useWallet } from "bch-connect";

export const Example: React.FC = () => {
  // bch-connect hooks
  const { address, tokenAddress, isConnected } = useWallet();
  const { signTransaction } = useSignTransaction();
  // -----------------

  // other hooks from the example app
  const { showSuccess, showError, showMessage } = useUserMessages();
  const { provider } = useNetworkProviderStore(); // Cashscript's NetworkProvider
  const { balance, error: balanceError } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(false);

  const proposeTransactionToWallet = async (values: TransferFormValues) => {
    if (!isConnected || !address || !provider) return;

    setIsLoading(true);

    // helper function to create a transaction object
    const wcTransactionObj = await getSimpleTransaction({
      provider,
      sender: address,
      amount: values.satoshis,
      recipient: values.recipient,
    });

    showMessage("Please sign the transaction in your wallet...");

    // Request signature of the generated transaction to the wallet
    try {
      const response = await signTransaction({ txRequest: wcTransactionObj });

      // Defensive checking for malformed response received from wallet
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

  // Below, TransferCard has the form, which call proposeTransactionToWallet on submit
  // and WalletInfoCard just shows addresses and balance
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

export default Example;
```

## <a name="api-reference"></a> 🧩 API Reference

### `createConfig(options: Configuration): CreatedConfig`

Creates the configuration object required by `BCHConnectProvider`, applying defaults for you.

**Parameters:**

- `options`: `Configuration` object.

```ts
export interface Configuration {
  projectId: string;
  network: NETWORK_INDEX | keyof typeof NETWORK_INDEX; // "mainnet" | "testnet" | "regtest"
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
  sessionType?: SessionType;
  modal?: Modal | ModalFactory; // defaults to bchConnectModal()
  supportLegacyClient?: boolean; // defaults to true. It ensures working with required namespaces
  debug?: boolean; // defaults to false
}
```

**Returns:**

- `CreatedConfig` – branded configuration to pass to the provider.

### `bchConnectModal(config?: BCHConnectModalConfig): Modal`

[bch-connect-modal](/packages/bch-connect-modal/) factory function. Default modal adapter used when you don’t pass a `modal` to `createConfig`. Wraps the `bch-connect-modal` package and accepts the same configuration (with `sessionType` defaulting to `"Wallet Connect V2"`).

**Parameters:**

- `config` (optional): `BCHConnectModalConfig`

```ts
interface BCHConnectModalConfig {
  sessionType: SessionType; // "Wallet Connect V2"
  wallets?: {
    id: string;
    name: string;
    iconUrl: string;
    links: {
      fallback: string;
      native?: string;
      universal?: string;
      web?: string;
    };
  }[]; // optional curated wallet list
  theme?: "light" | "dark" | "system"; // modal theme
}
```

**Returns:**

- `Modal` – object with `open({ uri })` and `close()` methods used internally by BCH Connect.

### `reownModal(options): ModalFactory`

Factory to use Reown AppKit’s modal. Pass the returned function as `modal` in `createConfig`. Accepts all `createAppKit` options except `projectId`, `metadata`, `manualWCControl`, and `networks` (BCH Connect injects those for you).

**Parameters:**

- `options`: `Omit<CreateAppKit, "projectId" | "metadata" | "manualWCControl" | "networks">`

**Returns:**

- `ModalFactory` – async factory that BCH Connect will call with `{ projectId, network, sessionType }` to build the modal.

### `<BCHConnectProvider config={config}>`

Provides the React context for BCH Connect, enabling wallet connections throughout your app.
This should wrap your root component (e.g. `App.tsx`).

**Props:**

- `config`: `CreatedConfig` – the object returned by [`createConfig`](#createconfigoptions-configuration-createdconfig).
- `children`: `React.ReactNode` – your application components.

### `useWallet()`

React hook to access the current wallet connection state and perform connect/disconnect actions.
Must be used within a [`<BCHConnectProvider>`](#bchconnectprovider-configconfig) context.

**Returns:**

- `address` – the currently connected wallet address. It is automatically refetched when an `addressesChanged` event is emitted by the wallet.
- `tokenAddress` – the [CashTokens](https://cashtokens.org/) aware address of the wallet, derived from `address`. It is automatically refetched when `address` changes.
- `session` – the active WalletConnect session (`SessionTypes.Struct`) or `null` when disconnected.
- `isConnected` – boolean indicating whether a wallet is currently connected.
- `connect()` – initiates a wallet connection.
- `disconnect()` – disconnects the current wallet session.
- `refetchAddresses()` – programmatically refetches `address`, updating both `address` and `tokenAddress` states.
- `areAddressesLoading` – boolean indicating whether the addresses are currently being loaded.
- `addressError` – error object if an error occurred while fetching the address.
- `tokenAddressError` – error object if an error occurred while converting address to token address.
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
  session: SessionTypes.Struct | null;
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
It works within [`<BCHConnectProvider>`](#bchconnectprovider-configconfig) context and when a wallet session is active.

**Returns:**

```ts
interface UseSignTransactionReturnType {
  signTransaction: (
    options: SignTransactionOpts,
  ) => Promise<WcSignTransactionResponse | null>;
}

interface SignTransactionOpts {
  txRequest: WcSignTransactionRequest;
  requestExpirySeconds?: number; // defaults to 300 seconds
}
```

`WcSignTransactionRequest` and `WcSignTransactionResponse` are interfaces from [`@bch-wc2/interfaces`](https://github.com/mainnet-pat/bch-wc2) package, which are also re-exported by `bch-connect` for convenience.

**`signTransaction` parameters:**

- `options.txRequest`: `WcSignTransactionRequest`
- `options.requestExpirySeconds`: optional expiration for the WalletConnect request in seconds (defaults to 300).

```ts
interface WcSignTransactionRequest {
  transaction: Transaction | string;
  sourceOutputs: WcSourceOutput[];
  broadcast?: boolean;
  userPrompt?: string;
}
```

You’ll commonly pass a `WcTransactionObject` from `cashscript` as the parameter to this function, which is fully compatible. This is shown in the [simple-transaction example](/examples/simple-transaction)

**`signTransaction` returns:**

- `Promise<WcSignTransactionResponse | null>` – resolves with the signed transaction response. Returns `null` when the wallet returns an invalid empty-object response, allowing you to show a neutral “status unknown” message. Throws if the WalletConnect client/session is missing or the wallet rejects/returns an error.
  It should be used within a try / catch block.

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
    options: WcSignMessageRequest,
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

- `Promise<WcSignMessageResponse | undefined>` – resolves with the message signature as a string. Throws if the WalletConnect client/session is missing or the wallet rejects/returns an error.
  It should be used within a try / catch block.

```ts
type WcSignMessageResponse = string;
```

## <a name="local-development"></a> 🧑‍💻 Local Development (for contributors)

This is a Bun-powered monorepo (`packages/*`, `examples/*`, `docs`). After cloning, install everything once from the root:

```bash
git clone https://github.com/fran-dv/bch-connect-monorepo.git
cd bch-connect-monorepo
bun install
```

### Library (`packages/bch-connect`)

Development (tsup watch writes to `dist/`):

```bash
cd packages/bch-connect
bun dev
```

Tests and tooling:

```bash
bun test            # or: bun test:coverage
bun run lint
bun run format
```

### Modal (`packages/bch-connect-modal`)

Playground (watch + serve `src/index.html` with the built global bundle):

```bash
cd packages/bch-connect-modal
bun run dev:playground  # serves at http://localhost:4173
```

The playground needs manual reload on the browser to see changes.

Bundle without serving:

```bash
bun dev            # watch build
bun run build      # without minification
bun run build:prod # with minification
```

Tests:

```bash
bun test
bun test:coverage
```

### Example app (`examples/simple-transaction`)

Run the demo:

```bash
cd examples/simple-transaction
bun dev
```

Build and preview:

```bash
bun run build
bun run preview
```

### Docs site (`docs`)

Preview locally (Next.js):

```bash
cd docs
bun run dev
```

Production build and type/MDX checks:

```bash
bun run build
bun run types:check
```

## <a name="contribute"></a> 🤝 Contribute

This project is open source and contributions are more than welcome!

Licensed under MIT – feel free to copy, modify, and use the code in your own projects.

---

Built with 💚 by [fran-dv](https://github.com/fran-dv)
