"use client";
// REMOVE ALL THIS STUFF TO START BUILDING YOUR DAPP
import { useState } from "react";
import Image from "next/image";
import { useSignMessage, useWallet } from "bch-connect";

function shortAddress(address: string): string {
  const addr = address.replace(/^bitcoincash:/, "");
  if (addr.length <= 18) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`;
}

export default function Home() {
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
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);

  const statusText =
    isConnected && address ? shortAddress(address) : "Not connected";

  const walletError =
    connectError?.message ??
    disconnectError?.message ??
    addressError?.message ??
    tokenAddressError?.message;

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
    <div className="container">
      <div className="brand-logos">
        <a href="https://nextjs.org" target="_blank" rel="noreferrer">
          <Image
            className="logo"
            src="/next.svg"
            alt="Next.js logo"
            width={96}
            height={20}
            priority
          />
        </a>

        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <Image
            className="logo react"
            src="/react.svg"
            alt="React logo"
            width={56}
            height={56}
            priority
          />
        </a>

        <a href="https://bchconnect.dev" target="_blank" rel="noreferrer">
          <Image
            className="logo bch"
            src="/bch.svg"
            alt="BCH Connect logo"
            width={56}
            height={56}
            priority
          />
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
              Connect wallet
            </button>
          ) : (
            <div className="bchc-actions">
              <button onClick={handleSignMessage} disabled={isSigning}>
                {isSigning ? "Sign in your wallet…" : "Sign a message"}
              </button>

              <button onClick={handleDisconnect} disabled={isSigning}>
                Disconnect
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

          {isError && walletError ? (
            <div className="bchc-panel bchc-panel--error">
              <div className="bchc-panelTitle">Wallet error</div>
              <div className="bchc-panelBody">{walletError}</div>
            </div>
          ) : null}

          {signature ? (
            <div className="bchc-panel">
              <div className="bchc-panelTitle">Message signature</div>
              <code className="bchc-code">{signature}</code>
            </div>
          ) : null}

          <p className="bchc-footer">
            Edit <code>app/page.tsx</code>.{" "}
            <a href="https://bchconnect.dev" target="_blank" rel="noreferrer">
              BCH Connect Docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
