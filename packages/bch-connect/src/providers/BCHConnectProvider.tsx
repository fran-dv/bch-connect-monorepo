import { useEffect, useRef, useState } from "react";
import {
  createConfig,
  getNamespaces,
  initializeConnection,
} from "@/config/config";
import { WalletConnectContext } from "@/contexts/WalletConnectContext";
import type {
  OldSessionTypes,
  OldSignClient,
  SessionTypes,
  SignClient,
} from "@/models/config";
import type { Modal } from "@/models/modal";

interface Props {
  children: React.ReactNode;
  config: ReturnType<typeof createConfig>;
}

interface GetClientSessionOpts {
  signClient: SignClient | OldSignClient;
  isOldClient: boolean;
}
const getClientSession = ({
  signClient,
  isOldClient,
}: GetClientSessionOpts): SessionTypes.Struct | OldSessionTypes.Struct => {
  if (isOldClient) {
    const client = signClient as OldSignClient;
    return client.session.getAll()[0] as OldSessionTypes.Struct;
  }

  const client = signClient as SignClient;
  return client.session.getAll()[0] as SessionTypes.Struct;
};

export const BCHConnectProvider: React.FC<Props> = ({
  children,
  config,
}: Props) => {
  const [session, setSession] = useState<
    SessionTypes.Struct | OldSessionTypes.Struct | null
  >(null);
  const [connectError, setConnectError] = useState<Error | null>(null);
  const [disconnectError, setDisconnectError] = useState<Error | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const [signClient, setSignClient] = useState<
    SignClient | OldSignClient | null
  >(null);
  const initializationRef = useRef<boolean>(false);
  const listenersSetupRef = useRef<boolean>(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    (async () => {
      try {
        const { signClient, modal } = await initializeConnection(config);

        setSignClient(signClient);
        setModal(modal);
        if (config.debug) {
          const clientVersion = !config.supportLegacyClient
            ? "LATEST (OPTIONAL NAMESPACES)"
            : "OLDER (REQUIRED NAMESPACES)";
          console.log(
            `SIGN CLIENT AND MODAL INITIALIZED. USING ${clientVersion} SIGN CLIENT `,
          );
        }

        const activeSession = getClientSession({
          signClient,
          isOldClient: !!config.supportLegacyClient,
        });
        if (activeSession) {
          if (config.debug)
            console.log("ACTIVE SESSION FOUND: ", activeSession);
          setSession(activeSession);
        }
      } catch (err) {
        if (config.debug) console.error("INITIALIZATION ERROR: ", err);
        setConnectError(err as Error);
      }
    })();
  }, [config]);

  useEffect(() => {
    if (!signClient || listenersSetupRef.current) return;

    const client = config.supportLegacyClient
      ? (signClient as OldSignClient)
      : (signClient as SignClient);
    listenersSetupRef.current = true;

    const handleSessionProposal = (proposal: unknown) => {
      if (config.debug) console.log("SESSION PROPOSAL EVENT:", proposal);
    };

    const handleSessionEvent = (event: unknown) => {
      if (config.debug) console.log("SESSION EVENT:", event);
    };

    const handleConnect = async (connectInfo: {
      session: SessionTypes.Struct;
    }) => {
      if (!connectInfo.session) return;
      if (config.debug) console.log("CONNECT EVENT: ", connectInfo.session);
      setSession(connectInfo.session);
      setConnectError(null);
    };

    const handleDisconnect = async (event: unknown) => {
      if (config.debug) console.log("DISCONNECT EVENT: ", event);
      setSession(null);
      setDisconnectError(null);
    };

    const handleSessionUpdate = (args: {
      topic: string;
      params: { namespaces: Record<string, unknown> };
    }) => {
      if (config.debug) console.log("SESSION UPDATE EVENT: ", args);
      const session = getClientSession({
        signClient: client,
        isOldClient: !!config.supportLegacyClient,
      });
      if (session.topic === args.topic) {
        setSession(session);
      }
    };

    const handleProposalExpire = (args: unknown) => {
      if (config.debug) console.log("PROPOSAL EXPIRE EVENT: ", args);
      modal?.close();
    };

    client.on("session_proposal", handleSessionProposal);
    client.on("session_event", handleSessionEvent);
    client.on("session_connect", handleConnect);
    client.on("session_delete", handleDisconnect);
    client.on("session_expire", handleDisconnect);
    client.on("session_update", handleSessionUpdate);
    client.on("proposal_expire", handleProposalExpire);

    return () => {
      client.removeListener("session_proposal", handleSessionProposal);
      client.removeListener("session_event", handleSessionEvent);
      client.removeListener("session_connect", handleConnect);
      client.removeListener("session_delete", handleDisconnect);
      client.removeListener("session_update", handleSessionUpdate);
      client.removeListener("proposal_expire", handleProposalExpire);
    };
  }, [
    signClient,
    config.network,
    config.debug,
    config.supportLegacyClient,
    modal,
    session,
  ]);

  useEffect(() => {
    if (!signClient) return;
    const currentSession = getClientSession({
      signClient,
      isOldClient: !!config.supportLegacyClient,
    });

    if (!currentSession) {
      setSession(null);
      return;
    }

    setSession(currentSession);
  }, [signClient, config.supportLegacyClient]);

  const connect = async (): Promise<void> => {
    if (!signClient || !modal) return;

    const client = signClient;

    const namespacesProperty = config.supportLegacyClient
      ? "requiredNamespaces"
      : "optionalNamespaces";

    try {
      const { uri, approval } = await client.connect({
        [namespacesProperty]: getNamespaces(config.network),
      });

      if (!uri) throw new Error("Failed to connect to sign client: No URI");

      if (config.debug) console.log("URI: ", uri);
      modal.open({ uri });

      const newSession = await approval();
      if (!newSession)
        throw new Error("Failed to connect to sign client: No session");
      if (config.debug) console.log("NEW SESSION: ", newSession);
      setSession(newSession);
      modal.close();
    } catch (err) {
      if (config.debug) console.error("ERROR CONNECTING: ", err);
      modal.close();
      setConnectError(err as Error);
    }
  };

  const disconnect = async () => {
    const client = signClient;

    if (!client) {
      if (config.debug)
        console.error("ERROR DISCONNECTING: SignClient not initialized");
      setDisconnectError(new Error("SignClient not initialized"));
      return;
    }

    if (!session || !session.topic) {
      if (config.debug) console.error("ERROR DISCONNECTING: No active session");
      setDisconnectError(new Error("No active session"));
      return;
    }

    try {
      await client.disconnect({
        topic: session.topic,
        reason: {
          code: 6000,
          message: "User disconnected",
        },
      });

      if (config.debug) console.log("DISCONNECTED");
      setSession(null);
    } catch (err) {
      if (config.debug) console.error("ERROR DISCONNECTING: ", err);
      setDisconnectError(err as Error);
    }
  };

  const walletConnectContextVaues: WalletConnectContext = {
    config,
    session,
    signClient,
    connectError,
    disconnectError,
    connect,
    disconnect,
  };

  return (
    <WalletConnectContext.Provider value={walletConnectContextVaues}>
      {children}
    </WalletConnectContext.Provider>
  );
};

export default BCHConnectProvider;
