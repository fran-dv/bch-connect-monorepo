# bch-connect-modal

A framework-agnostic, lightweight modal UI for BCH Wallet connections in the browser.

**Visit the [documentation](https://bchconnect.dev)**

## Install

```bash
npm install bch-connect-modal
# or
bun add bch-connect-modal
# or
yarn add bch-connect-modal
```

## Usage

```ts
import { createBCHConnectModal } from "bch-connect-modal";

const modal = createBCHConnectModal({
  sessionType: "Wallet Connect V2",
  theme: "dark",
});

const connectionURI = "wc:...";

modal.open({ uri: connectionURI });

// modal.close();
```

## API

- `createBCHConnectModal(config)` creates a modal instance.
- `modal.open({ uri })` opens the modal.
- `modal.close()` closes it.
- `modal.setTheme(theme)` switches theme.
- `modal.destroy()` unmounts the modal from the DOM.
