import { generate } from "lean-qr";
import { ModalContent } from "./content";
import WC_LOGO_URL from "./assets/images/wc-logo.svg";
import { Bitmap2D } from "lean-qr/extras/svg";

export class QRController {
  private root: HTMLDivElement;
  private qr: HTMLImageElement;
  private uri: string;
  private copyFeedback: HTMLDivElement;
  private copyTimeoutId: number | null = null;

  constructor(uri: string) {
    this.uri = uri;
    this.root = document.createElement("div");
    this.root.classList.add("bchc-qr-section");

    const qrWrapper = document.createElement("div");
    qrWrapper.classList.add("bchc-qr-container");

    this.qr = document.createElement("img");
    this.qr.classList.add("bchc-qr");

    this.qr.addEventListener("click", () => {
      this.handleQRCopy();
    });

    const walletConnectLogo = document.createElement("img");
    walletConnectLogo.src = WC_LOGO_URL;
    walletConnectLogo.classList.add("bchc-qr-logo");

    this.copyFeedback = document.createElement("div");
    this.copyFeedback.classList.add("bchc-copy-feedback");
    this.copyFeedback.textContent = ModalContent.copied;

    const label = document.createElement("p");
    label.classList.add("bchc-qr-label");
    label.textContent = ModalContent.qrLabel;

    this.rerender();

    qrWrapper.appendChild(this.qr);
    qrWrapper.appendChild(walletConnectLogo);

    this.root.appendChild(this.copyFeedback);
    this.root.appendChild(qrWrapper);
    this.root.appendChild(label);
  }

  private rerender(): void {
    if (!this.qr) {
      throw new Error("Error rerendering QR: QR Not found");
    }

    if (!this.uri) return;

    const code = generate(this.uri);
    const svgString = this.generateSVG(code);

    this.qr.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }

  private generateSVG(code: Bitmap2D): string {
    const size = code.size;
    const pad = 1.75;

    const dotRadius = 1;
    const ringRadius = 1;
    const innerRadius = 0.75;

    let paths = "";

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Check if (x,y) is inside one of the 3 finder patterns (7x7 zones)
        const isTopLeft = x < 7 && y < 7;
        const isTopRight = x >= size - 7 && y < 7;
        const isBottomLeft = x < 7 && y >= size - 7;

        if (isTopLeft || isTopRight || isBottomLeft) continue;

        if (code.get(x, y)) {
          paths += `<rect x="${x}" y="${y}" width="1" height="1" rx="${dotRadius}" />`;
        }
      }
    }

    const drawFinder = (ox: number, oy: number) => {
      // Outer Ring: 7x7 box. drawn as a stroke centered at 0.5 offset
      // x=0.5, width=6 ensures the stroke (width 1) covers pixels 0 to 7 perfectly.
      paths += `<rect x="${ox + 0.5}" y="${oy + 0.5}" width="6" height="6" 
                fill="none" stroke="black" stroke-width="1" rx="${ringRadius}" />`;

      // Inner Square: 3x3 box solid
      paths += `<rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" 
                fill="black" rx="${innerRadius}" />`;
    };

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}" fill="black" shape-rendering="geometricPrecision">${paths}</svg>`;
  }

  private showCopyFeedback(): void {
    this.copyFeedback!.classList.add("bchc-visible");

    if (this.copyTimeoutId !== null) {
      window.clearTimeout(this.copyTimeoutId);
    }

    this.copyTimeoutId = window.setTimeout(() => {
      this.copyFeedback!.classList.remove("bchc-visible");
      this.copyTimeoutId = null;
    }, 1500);
  }

  private handleQRCopy = async (): Promise<void> => {
    if (!this.uri) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.uri);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = this.uri;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      this.showCopyFeedback();
    } catch (err) {
      console.error("[bch-connect] Failed to copy URI:", err);
    }
  };

  public getElement(): HTMLElement {
    return this.root;
  }

  public setUri(uri: string) {
    this.uri = uri;
    this.rerender();
  }
}
