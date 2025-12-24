// REMOVE ALL THIS STUFF TO START BUILDING YOUR DAPP
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import bchLogo from "./assets/bch.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useSignMessage, useWallet } from "bch-connect";

function shortAddress(address: string): string {
  const addr = address.replace(/^bitcoincash:/, "");
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`;
}

export default function App() {
  const {
    connect,
    disconnect,
    isConnected,
    address,
    isError,
    connectError,
    disconnectError,
    addressError,
    tokenAddressError,
  } = useWallet();
  const { signMessage } = useSignMessage();

  const [signature, setSignature] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signError, setSignError] = useState<string | null>(null);

  const statusText =
    isConnected && address ? shortAddress(address) : "Not connected";

  function handleConnect() {
    setSignError(null);
    setSignature(null);

    void connect();
  }

  function handleDisconnect() {
    setSignError(null);
    setSignature(null);

    void disconnect();
  }

  async function handleSignMessage() {
    setIsSigning(true);
    setSignError(null);
    setSignature(null);

    try {
      const sig = await signMessage({
        message: "Bitcoin is cash!",
        userPrompt: "Sign demo message",
      });

      if (!sig) throw new Error("No signature returned.");
      setSignature(sig);
    } catch (e) {
      const details = e instanceof Error ? e.message : JSON.stringify(e);
      setSignError(`Failed to sign: ${details}`);
    } finally {
      setIsSigning(false);
    }
  }

  return (
    <>
      <div className="brand-logos">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://bchconnect.dev" target="_blank" rel="noreferrer">
          <img src={bchLogo} className="logo bch" alt="BCH Connect logo" />
        </a>
      </div>

      <h1 className="title">BCH Connect Starter</h1>

      <div className="card">
        <div className="bchc-card">
          {!isConnected ? (
            <button
              className="bchc-primary"
              onClick={handleConnect}
              disabled={isSigning}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bchc-actions">
              <button onClick={handleSignMessage} disabled={isSigning}>
                {isSigning ? "Sign in your wallet..." : "Sign Message"}
              </button>

              <button onClick={handleDisconnect} disabled={isSigning}>
                Disconnect Wallet
              </button>
            </div>
          )}

          <div
            className="bchc-status"
            data-connected={isConnected ? "true" : "false"}
          >
            <span className="bchc-dot" aria-hidden="true" />
            <span className="bchc-statusText">{statusText}</span>
          </div>

          {signError ? (
            <div className="bchc-panel bchc-panel--error">
              <div className="bchc-panelTitle">Error</div>
              <div className="bchc-panelBody">{signError}</div>
            </div>
          ) : null}

          {isError && (
            <div className="bchc-panel bchc-panel--error">
              <div className="bchc-panelTitle">An error occurred</div>
              <div className="bchc-panelBody">
                {connectError?.message ??
                  disconnectError?.message ??
                  addressError?.message ??
                  tokenAddressError?.message}
              </div>
            </div>
          )}

          {signature ? (
            <div className="bchc-panel">
              <div className="bchc-panelTitle">Message signature</div>
              <code className="bchc-code">{signature}</code>
            </div>
          ) : null}

          <p className="bchc-footer">
            Edit <code>src/App.tsx</code>.{" "}
            <a href="https://bchconnect.dev" target="_blank" rel="noreferrer">
              BCH Connect Docs
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
