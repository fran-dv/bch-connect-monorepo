import { ModalWallet, type Theme } from "./models/modal";
import { ModalContent } from "./content";
import { SwipeController } from "./swipeController";
import styles from "./styles.css";
import { zalandoSansFontBase64 } from "./assets/fonts/base64fonts";
import { QRController } from "./qrController";
import { isMobileDevice } from "./utils";

export interface IModalDOM {
  mount(): void;
  unmount(): void;
  open(): void;
  close(): void;
  setUri(uri: string): void;
  setWallets(wallets: ModalWallet[]): void;
  setSessionType(sessionType: string): void;
  setTheme(theme: Theme): void;
  onWalletClick(handler: (wallet: ModalWallet) => void): void;
}

export class ModalDOM implements IModalDOM {
  private root: HTMLDivElement;
  private shadow: ShadowRoot;
  private dialog: HTMLDialogElement;
  private modalCard: HTMLDivElement;
  private walletList: HTMLUListElement | undefined;
  private sessionTypeBadge: HTMLSpanElement | undefined;
  private qr: QRController | undefined;
  private scrollableContent: HTMLDivElement | undefined;

  private wallets: ModalWallet[] = [];
  private sessionType: string | undefined;
  private uri: string = "";
  private walletClickHandler?: (wallet: ModalWallet) => void;

  private swipeController: SwipeController | undefined;

  private createHeader(): HTMLElement {
    const header = document.createElement("header");
    header.classList.add("bchc-header");

    const leftGroup = document.createElement("div");
    leftGroup.classList.add("bchc-header-left");

    const title = document.createElement("h2");
    title.classList.add("bchc-title");
    title.textContent = ModalContent.headerH2Title;

    this.sessionTypeBadge = document.createElement("span");
    this.sessionTypeBadge.classList.add("bchc-session-type-badge");

    const sessionTypeSection = document.createElement("div");
    sessionTypeSection.classList.add("bchc-session-type-section");

    const sessionTypeLabel = document.createElement("p");
    sessionTypeLabel.textContent = ModalContent.sessionTypeLabel;
    sessionTypeLabel.classList.add("bchc-session-type-label");

    sessionTypeSection.appendChild(sessionTypeLabel);
    sessionTypeSection.appendChild(this.sessionTypeBadge);

    leftGroup.appendChild(title);
    leftGroup.appendChild(sessionTypeSection);

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("bchc-close");
    closeBtn.ariaLabel = ModalContent.closeButtonAriaLabel;
    closeBtn.type = "button";
    closeBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    closeBtn.addEventListener("click", () => this.close());

    header.appendChild(leftGroup);
    header.appendChild(closeBtn);

    return header;
  }

  private createContent(): HTMLElement {
    this.scrollableContent = document.createElement("div");
    this.scrollableContent.classList.add("bchc-content");

    const walletSection = document.createElement("div");
    walletSection.className = "bchc-wallet-section";

    this.walletList = document.createElement("ul");
    this.walletList.className = "bchc-wallet-list";

    walletSection.appendChild(this.walletList);

    this.qr = new QRController(this.uri);
    const qrSection = this.qr.getElement();

    this.scrollableContent.appendChild(walletSection);
    this.scrollableContent.appendChild(qrSection);

    return this.scrollableContent;
  }

  private renderWalletList(): void {
    this.walletList!.innerHTML = "";

    this.wallets.forEach((wallet) => {
      const li = document.createElement("li");

      const btn = document.createElement("button");
      btn.className = "bchc-wallet-card";
      btn.type = "button";

      const icon = document.createElement("img");
      icon.className = "bchc-wallet-icon";
      icon.src = wallet.iconUrl;
      icon.alt = `${wallet.name} icon`;

      const name = document.createElement("span");
      name.className = "bchc-wallet-name";
      name.textContent = wallet.name;

      const arrow = document.createElement("span");
      arrow.className = "bchc-wallet-arrow";
      arrow.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;

      btn.appendChild(icon);
      btn.appendChild(name);
      btn.appendChild(arrow);

      btn.addEventListener("click", () => {
        this.handleWalletClick(wallet);
      });

      li.appendChild(btn);
      this.walletList!.appendChild(li);
    });
  }

  private handleWalletClick(wallet: ModalWallet): void {
    if (!this.uri) {
      console.error("Cannot connect: WalletConnect URI is missing");
      return;
    }

    const encodedUri = encodeURIComponent(this.uri);
    const injectUri = (link: string) => link.replace("{{uri}}", encodedUri);

    const { native, universal, web, fallback } = wallet.links;
    const isMobile = isMobileDevice();

    if (isMobile) {
      if (universal) {
        window.location.href = injectUri(universal);
        return;
      }

      if (native) {
        const nativeUrl = injectUri(native);
        const fallbackUrl = injectUri(fallback);

        window.location.href = nativeUrl;

        setTimeout(() => {
          if (!document.hidden) {
            window.open(
              injectUri(fallbackUrl),
              "_blank",
              "noopener,noreferrer",
            );
          }
        }, 2000);
        return;
      }

      if (web) {
        window.open(injectUri(web), "_blank", "noopener,noreferrer");
        return;
      }

      window.location.href = injectUri(fallback);
    } else {
      let targetUrl = "";
      if (web) targetUrl = injectUri(web);
      else if (universal) targetUrl = injectUri(universal);
      else targetUrl = injectUri(fallback);

      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    this.walletClickHandler?.(wallet);
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.dialog.open) {
      this.close();
    }
  };

  private handleBackdropClick = (e: MouseEvent): void => {
    if (e.target === this.dialog) {
      this.close();
    }
  };

  private loadFonts() {
    if (!document.getElementById("bchc-font-face")) {
      const fontStyle = document.createElement("style");
      fontStyle.id = "bchc-font-face";
      fontStyle.textContent = `
            @font-face {
                font-family: "Zalando Sans";
                src: url(data:font/woff2;base64,${zalandoSansFontBase64}) format("woff2");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }
        `;
      document.head.appendChild(fontStyle);
    }
  }

  constructor() {
    this.loadFonts();

    this.root = document.createElement("div");
    this.root.className = "bchc-root";

    this.shadow = this.root.attachShadow({ mode: "open" });

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    this.shadow.appendChild(styleSheet);

    const theme = document.documentElement.getAttribute("data-theme");
    if (theme) this.root.setAttribute("data-theme", theme);

    this.dialog = document.createElement("dialog");
    this.dialog.className = "bchc-modal-container";

    this.modalCard = document.createElement("div");
    this.modalCard.className = "bchc-modal";

    const header = this.createHeader();
    const content = this.createContent();

    this.modalCard.appendChild(header);
    this.modalCard.appendChild(content);

    this.dialog.appendChild(this.modalCard);
    this.shadow.appendChild(this.dialog);
    this.dialog.addEventListener("click", this.handleBackdropClick);

    this.swipeController = new SwipeController(
      this.modalCard,
      ".bchc-header",
      () => this.close(),
    );
  }

  public mount(): void {
    if (this.root.isConnected) return;
    document.body.appendChild(this.root);
    document.addEventListener("keydown", this.handleKeydown);
  }

  public unmount(): void {
    if (!this.root.isConnected) return;

    // Destroy to clean up listeners
    if (this.swipeController) {
      this.swipeController.destroy();
    }

    document.removeEventListener("keydown", this.handleKeydown);
    document.body.style.overflow = "";
    this.root.remove();
  }

  public open(): void {
    this.mount();

    this.dialog.showModal();
    requestAnimationFrame(() => {
      this.root.classList.add("bchc-active");
      // appear at the top in mobile (inverted because it's a flex column-reverse)
      if (this.scrollableContent) this.scrollableContent.scrollTop = -1000000;
    });
  }

  public close(): void {
    this.root.classList.remove("bchc-active");
    this.modalCard.style.transform = "";
    document.body.style.overflow = "";

    // Wait for animation before closing dialog
    setTimeout(() => {
      if (this.dialog.open) this.dialog.close();
    }, 210);
  }

  public setSessionType(sessionType: string): void {
    this.sessionType = sessionType;
    if (this.sessionTypeBadge) this.sessionTypeBadge.textContent = sessionType;
  }

  public setWallets(wallets: ModalWallet[]): void {
    this.wallets = wallets;
    this.renderWalletList();
  }

  public setUri(uri: string): void {
    this.uri = uri;
    if (!this.qr)
      throw new Error("Error setting uri: QR controller is not defined");

    this.qr.setUri(uri);
  }

  public setTheme(theme: Theme): void {
    this.root.setAttribute("data-theme", theme);
  }

  public onWalletClick(handler: (wallet: ModalWallet) => void): void {
    this.walletClickHandler = handler;
  }
}
