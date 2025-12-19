# BCH Connect Example

This is a simple (yet beautiful) example demonstrating the library in action.

- In the [`main.tsx`](./src/main.tsx) file, you'll see how the configuration and provider are set up.
- In the [`ConnectButton`](./src/components/ConnectButton/ConnectButton.tsx) component, the library's hook `useWallet` is used to connect and disconnect a wallet.
- In the [`Example`](./src/components/Example/Example.tsx) component, the library's hooks `useWallet` and `useSignTransaction` are used to read wallet data and sign transactions.

![Example screenshot](preview-images/screenshot-1.png)

## Installation

1. Follow the installation instructions in the root [README](../README.md).
2. Navigate to this `examples` folder and run:

```bash
bun run dev
```

- or replace `bun` with the package manager you were using
