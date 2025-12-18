// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BCHConnectModal, createBCHConnectModal } from "../index"; // Adjust filename if needed
import { DefaultWallets } from "../wallets";

const mockSetSessionType = vi.fn();
const mockSetWallets = vi.fn();
const mockSetTheme = vi.fn();
const mockSetUri = vi.fn();
const mockOpen = vi.fn();
const mockClose = vi.fn();
const mockUnmount = vi.fn();

vi.mock("../dom", () => {
  return {
    ModalDOM: class {
      setSessionType = mockSetSessionType;
      setWallets = mockSetWallets;
      setTheme = mockSetTheme;
      setUri = mockSetUri;
      open = mockOpen;
      close = mockClose;
      unmount = mockUnmount;
    },
  };
});

describe("BCHConnectModal (Wrapper)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize ModalDOM with correct config", () => {
    new BCHConnectModal({
      sessionType: "Connect",
      theme: "dark",
    });

    expect(mockSetSessionType).toHaveBeenCalledWith("Connect");
    expect(mockSetWallets).toHaveBeenCalledWith(DefaultWallets);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should use custom wallets if provided", () => {
    // eslint-disable-next-line
    const customWallets: any[] = [{ id: "custom" }];
    new BCHConnectModal({
      sessionType: "Connect",
      wallets: customWallets,
    });

    expect(mockSetWallets).toHaveBeenCalledWith(customWallets);
  });

  it("should open the modal with URI", () => {
    const modal = new BCHConnectModal({ sessionType: "Connect" });
    modal.open({ uri: "wc:test-uri" });

    expect(mockSetUri).toHaveBeenCalledWith("wc:test-uri");
    expect(mockOpen).toHaveBeenCalled();
  });

  it("should close the modal", () => {
    const modal = new BCHConnectModal({ sessionType: "Connect" });
    modal.close();
    expect(mockClose).toHaveBeenCalled();
  });

  it("should update the theme", () => {
    const modal = new BCHConnectModal({ sessionType: "Connect" });
    modal.setTheme("light");
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should destroy/unmount the modal", () => {
    const modal = new BCHConnectModal({ sessionType: "Connect" });
    modal.destroy();
    expect(mockUnmount).toHaveBeenCalled();
  });

  it("createBCHConnectModal helper should return a new instance", () => {
    const instance = createBCHConnectModal({ sessionType: "Connect" });
    expect(instance).toBeInstanceOf(BCHConnectModal);
  });
});
