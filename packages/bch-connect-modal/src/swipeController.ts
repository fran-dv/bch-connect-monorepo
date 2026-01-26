export class SwipeController {
	private dragStartY = 0;
	private dragCurrentY = 0;
	private isDragging = false;
	private isMobile = false;
	private mediaQuery: MediaQueryList | null = null;

	private handleMediaChange = (event: MediaQueryListEvent): void => {
		this.isMobile = event.matches;
	};

	constructor(
		private target: HTMLElement,
		private handleSelector: string,
		private onClose: () => void,
	) {
		if (typeof window !== "undefined" && "matchMedia" in window) {
			this.mediaQuery = window.matchMedia("(max-width: 850px)");
			this.isMobile = this.mediaQuery.matches;
			this.mediaQuery.addEventListener("change", this.handleMediaChange);
		}

		this.init();
	}

	private init() {
		this.target.addEventListener("touchstart", this.handleTouchStart, {
			passive: true,
		});
		this.target.addEventListener("touchmove", this.handleTouchMove, {
			passive: false,
		});
		this.target.addEventListener("touchend", this.handleTouchEnd);
		this.target.addEventListener("pointerdown", this.handlePointerDown, {
			passive: true,
		});
		this.target.addEventListener("pointermove", this.handlePointerMove, {
			passive: false,
		});
		this.target.addEventListener("pointerup", this.handlePointerUp);
	}

	public destroy() {
		if (this.mediaQuery) {
			this.mediaQuery.removeEventListener("change", this.handleMediaChange);
		}

		this.target.removeEventListener("touchstart", this.handleTouchStart);
		this.target.removeEventListener("touchmove", this.handleTouchMove);
		this.target.removeEventListener("touchend", this.handleTouchEnd);
		this.target.removeEventListener("pointerdown", this.handlePointerDown);
		this.target.removeEventListener("pointermove", this.handlePointerMove);
		this.target.removeEventListener("pointerup", this.handlePointerUp);
	}

	private handleTouchStart = (e: TouchEvent): void => {
		const target = e.target as HTMLElement;
		// Only allow dragging from header
		if (!target.closest(this.handleSelector)) return;

		this.isDragging = true;
		this.dragStartY = e.touches[0].clientY;
		this.dragCurrentY = this.dragStartY;
		this.target.style.transition = "none";
		this.target.style.userSelect = "none";
	};

	private handleTouchMove = (e: TouchEvent): void => {
		if (!this.isDragging) return;

		this.dragCurrentY = e.touches[0].clientY;
		const deltaY = this.dragCurrentY - this.dragStartY;

		// Only allow dragging down
		if (deltaY > 0) {
			e.preventDefault();
			this.target.style.transform = `translateY(${deltaY}px)`;
		}
	};

	private handleTouchEnd = (): void => {
		if (!this.isDragging) return;

		this.isDragging = false;
		this.target.style.transition = "";
		this.target.style.userSelect = "auto";

		const deltaY = this.dragCurrentY - this.dragStartY;
		const threshold = 100;

		if (deltaY > threshold) {
			this.onClose();
		} else {
			this.target.style.transform = "";
		}
	};

	private handlePointerDown = (e: PointerEvent): void => {
		if (!this.isMobile) return;
		const target = e.target as HTMLElement;
		if (!target.closest(this.handleSelector)) return;

		this.isDragging = true;
		this.dragStartY = e.clientY;
		this.dragCurrentY = this.dragStartY;
		this.target.style.transition = "none";
		this.target.style.userSelect = "none";
	};

	private handlePointerMove = (e: PointerEvent): void => {
		if (!this.isMobile) return;
		if (!this.isDragging) return;

		this.dragCurrentY = e.clientY;
		const deltaY = this.dragCurrentY - this.dragStartY;

		if (deltaY > 0) {
			e.preventDefault();
			this.target.style.transform = `translateY(${deltaY}px)`;
		}
	};

	private handlePointerUp = (): void => {
		if (!this.isMobile) return;
		if (!this.isDragging) return;

		this.isDragging = false;
		this.target.style.transition = "";
		this.target.style.userSelect = "auto";

		const deltaY = this.dragCurrentY - this.dragStartY;
		const threshold = 100;

		if (deltaY > threshold) {
			this.onClose();
		} else {
			this.target.style.transform = "";
		}
	};
}
