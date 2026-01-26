// @vitest-environment jsdom
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type Mock,
	vi,
} from "vitest";
import { ModalDOM } from "../dom";
import type { ModalWallet } from "../models/modal";
import { isMobileDevice } from "../utils";

const mockSetUri = vi.fn();
const mockGetElement = vi.fn(() => {
	const div = document.createElement("div");
	div.className = "bchc-qr-section";
	return div;
});
const mockSwipeDestroy = vi.fn();

vi.mock("../styles.css", () => ({ default: "" }));
vi.mock("../assets/fonts/base64fonts", () => ({
	zalandoSansFontBase64: "",
}));
vi.mock("../assets/images/wc-logo.svg", () => ({ default: "logo.svg" }));

vi.mock("../utils", () => ({
	isMobileDevice: vi.fn(),
}));

vi.mock("../qrController", () => {
	return {
		QRController: class {
			getElement = mockGetElement;
			setUri = mockSetUri;
		},
	};
});

vi.mock("../swipeController", () => {
	return {
		SwipeController: class {
			destroy = mockSwipeDestroy;
		},
	};
});

Object.defineProperty(window, "matchMedia", {
	writable: true,
	// biome-ignore lint/suspicious: any
	value: vi.fn().mockImplementation((query: any) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

Object.assign(navigator, {
	clipboard: {
		writeText: vi.fn(),
	},
});

vi.stubGlobal("open", vi.fn());

const mockLocation = { href: "" };
Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

describe("ModalDOM", () => {
	let modal: ModalDOM;

	beforeEach(() => {
		HTMLDialogElement.prototype.showModal = vi.fn(function (
			this: HTMLDialogElement,
		) {
			this.setAttribute("open", "");
		});
		HTMLDialogElement.prototype.close = vi.fn(function (
			this: HTMLDialogElement,
		) {
			this.removeAttribute("open");
		});
		Object.defineProperty(HTMLDialogElement.prototype, "open", {
			get: function () {
				return this.hasAttribute("open");
			},
			configurable: true,
		});

		document.body.innerHTML = "";
		vi.clearAllMocks();
		vi.useFakeTimers();

		(isMobileDevice as Mock).mockReturnValue(false);

		modal = new ModalDOM();
		modal.mount();
	});

	afterEach(() => {
		vi.useRealTimers();
		modal?.unmount();
	});

	it("should be mounted to the document body", () => {
		const root = document.querySelector(".bchc-root");
		expect(root).toBeTruthy();
		expect(root?.shadowRoot).toBeTruthy();
	});

	it("should create the correct shadow DOM structure", () => {
		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");

		const shadow = root.shadowRoot;

		expect(shadow.querySelector("dialog.bchc-modal-container")).toBeTruthy();
		expect(shadow.querySelector(".bchc-header")).toBeTruthy();
		expect(shadow.querySelector(".bchc-content")).toBeTruthy();
	});

	it("should render the wallet list", () => {
		const wallets: ModalWallet[] = [
			{
				id: "test",
				name: "Test Wallet",
				iconUrl: "img.png",
				links: {
					native: "app://",
					web: "https://web.com",
					fallback: "https://fallback.com",
				},
			},
		];

		modal.setWallets(wallets);

		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");
		const shadow = root.shadowRoot;
		const list = shadow.querySelector(".bchc-wallet-list");
		const item = list?.querySelector("li button");

		expect(list?.children.length).toBe(1);
		expect(item?.textContent).toContain("Test Wallet");
	});

	it("should handle wallet clicks and logic (Desktop)", () => {
		(isMobileDevice as Mock).mockReturnValue(false);

		const walletSpy = vi.fn();
		modal.onWalletClick(walletSpy);
		modal.setUri("wc:123");

		const testWallet: ModalWallet = {
			id: "web-wallet",
			name: "Web Wallet",
			iconUrl: "",
			links: { fallback: "", web: "https://wallet.com/connect?uri={{uri}}" },
		};
		modal.setWallets([testWallet]);

		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");
		const btn = root.shadowRoot.querySelector(
			".bchc-wallet-card",
		) as HTMLButtonElement;
		btn.click();

		const expectedUrl = `https://wallet.com/connect?uri=${encodeURIComponent("wc:123")}`;
		expect(window.open).toHaveBeenCalledWith(
			expectedUrl,
			"_blank",
			"noopener,noreferrer",
		);
		expect(walletSpy).toHaveBeenCalledWith(testWallet);
	});

	it("should handle wallet clicks and logic (Mobile)", () => {
		(isMobileDevice as Mock).mockReturnValue(true);

		mockLocation.href = "";

		modal.setUri("wc:456");
		const testWallet: ModalWallet = {
			id: "native-wallet",
			name: "Native Wallet",
			iconUrl: "",
			links: { fallback: "", native: "app://wc?uri={{uri}}" },
		};
		modal.setWallets([testWallet]);

		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");
		const btn = root.shadowRoot.querySelector(
			".bchc-wallet-card",
		) as HTMLButtonElement;
		btn.click();

		const expectedUrl = `app://wc?uri=${encodeURIComponent("wc:456")}`;
		expect(mockLocation.href).toBe(expectedUrl);
	});

	it("should animate open correctly", () => {
		modal.open();

		vi.runAllTimers();
		vi.advanceTimersByTime(100);

		const root = document.querySelector(".bchc-root");
		expect(root?.classList.contains("bchc-active")).toBe(true);
	});

	it("should animate close correctly", () => {
		modal.open();
		vi.runAllTimers();

		modal.close();

		const root = document.querySelector(".bchc-root");
		expect(root?.classList.contains("bchc-active")).toBe(false);

		expect(HTMLDialogElement.prototype.close).not.toHaveBeenCalled();

		vi.advanceTimersByTime(250);

		expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
	});

	it("should update URI on QR controller", () => {
		modal.setUri("wc:new-uri");
		expect(mockSetUri).toHaveBeenCalledWith("wc:new-uri");
	});

	it("should close when clicking the backdrop", () => {
		modal.open();
		vi.runAllTimers();

		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");
		const dialog = root.shadowRoot.querySelector("dialog") as HTMLDialogElement;

		dialog.click();

		const rootAfterClick = document.querySelector(".bchc-root");
		expect(rootAfterClick?.classList.contains("bchc-active")).toBe(false);
	});

	it("should close when pressing Escape", () => {
		modal.open();
		vi.runAllTimers();

		document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

		const root = document.querySelector(".bchc-root");
		expect(root?.classList.contains("bchc-active")).toBe(false);
	});

	it("should fallback to download page if mobile app fails to open", () => {
		// biome-ignore lint/suspicious: any
		(window.matchMedia as any).mockImplementation(() => ({ matches: true }));

		modal.setUri("wc:test");
		const testWallet: ModalWallet = {
			id: "native-only",
			name: "Native",
			iconUrl: "",
			links: {
				native: "app://wc?uri={{uri}}",
				fallback: "https://fallback.com",
			},
		};
		modal.setWallets([testWallet]);

		const root = document.querySelector(".bchc-root");
		if (!root || !root.shadowRoot) throw new Error("Root element not found");
		const btn = root.shadowRoot.querySelector(
			".bchc-wallet-card",
		) as HTMLButtonElement;

		btn.click();

		expect(window.location.href).toContain("app://wc");

		vi.advanceTimersByTime(2000);

		expect(window.open).toHaveBeenCalledWith(
			"https://fallback.com",
			"_blank",
			"noopener,noreferrer",
		);
	});

	it("should not crash if mounted multiple times", () => {
		modal.mount();
		expect(() => modal.mount()).not.toThrow();
		expect(() => modal.mount()).not.toThrow();
	});

	it("should not crash if unmounted multiple times", () => {
		modal.unmount();
		expect(() => modal.unmount()).not.toThrow();
		expect(() => modal.unmount()).not.toThrow();
	});
});
