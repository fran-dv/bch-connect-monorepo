import type { Configuration, OldSignClient, SignClient } from "@/models/config";
import type { SessionTypes } from "@walletconnect/types";
import { createContext, useContext } from "react";

export type ConnectWalletCallback = () => Promise<void>;
export type DisconnectWalletCallback = () => Promise<void>;

export interface WalletConnectContext {
  config: Configuration;
  session: SessionTypes.Struct | null;
  signClient: SignClient | OldSignClient | null;
  connect: ConnectWalletCallback;
  disconnect: DisconnectWalletCallback;
  connectError: Error | null;
  disconnectError: Error | null;
}

export const WalletConnectContext = createContext<WalletConnectContext | null>(
  null,
);

export const useWalletConnectContext = (): WalletConnectContext => {
  const context = useContext(WalletConnectContext);

  if (!context) {
    throw new Error(
      "useWalletConnectContext must be used within a WalletContextProvider",
    );
  }
  return context;
};
