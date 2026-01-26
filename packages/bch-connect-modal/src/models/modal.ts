export interface IBCHConnectModal {
	open(options: { uri: string }): void;
	close(): void;
}

export interface ModalWallet {
	id: string;
	name: string;
	iconUrl: string;
	links: {
		fallback: string;
		native?: string;
		universal?: string;
		web?: string;
	};
}

export type Theme = "light" | "dark" | "system";

export interface ModalConfig {
	sessionType: string;
	wallets?: ModalWallet[];
	theme?: Theme;
}

export interface OpenOpts {
	uri: string;
}
