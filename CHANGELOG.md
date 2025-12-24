# CHANGELOG

## 0.2.0

### Added

**bch-connect:**

- Support for `@walletconnect/sign-client` v2.20 (enabling legacy requiredNamespaces compatibility).  
  This feature is optional, but enabled by default.
- Election between bch-connect-modal, reown's modal or a 100% custom modal.
- Test coverage for critical parts:
  - `addressToTokenAddress`
  - `config.ts`
  - `BCHConnectProvider`
  - `useGetAddresses.ts`
  - `useSignMessage.ts`
  - `useSignTransaction.ts`
  - `useWallet.ts`

**bch-connect-modal:**

- New framework-agnostic, lightweight modal for Bitcoin Cash dApps

**create-bch-dapp:**

- New CLI to scaffold BCH dApps preconfigured with `bch-connect`

### Changed

- Migrated from walletconnect's Universal connector to Sign Client only.
- `useSignTransaction` now receives `{ txRequest, requestExpirySeconds? }` and returns `null` if wallets reply with an empty object.
- WalletConnect context now exposes the WalletConnect sign client (replacing the Universal Connector/provider) and uses the new `modal` config shape.
- Walletconnect's sign client and reown modal are now lazy imported, only if they are used
