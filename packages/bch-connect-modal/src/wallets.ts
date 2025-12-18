import { ModalWallet } from "./models/modal";

export const DefaultWallets: ModalWallet[] = [
  {
    id: "cazhonize",
    name: "Cashonize",
    iconUrl: "https://cashonize.com/images/cashonize-icon.png",
    links: {
      web: "https://cashonize.com/?uri={{uri}}",
      fallback: "https://cashonize.com/?uri={{uri}}",
    },
  },
  {
    id: "zapit",
    name: "Zapit",
    iconUrl: "https://zapit.io/logo.png",
    links: {
      web: "https://app.zapit.io",
      fallback: "https://zapit.io",
    },
  },
  {
    id: "paytaca",
    name: "Paytaca",
    iconUrl: "https://www.paytaca.com/favicon.png",
    links: {
      native: "paytaca://apps/wallet-connect?uri={{uri}}",
      fallback: "https://www.paytaca.com/applications/wallet",
    },
  },
  // {
  //     id: "selene",
  //     name: "Selene Wallet",
  //     iconUrl: "https://selene.cash/assets/logo-DwnTeMnn.svg",
  //     links: {
  //         web: "https://app.selene.cash",
  //         fallback: "https://selene.cash",
  //     }
  // },
] as const;
