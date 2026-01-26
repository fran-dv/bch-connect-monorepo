import { ModalDOM } from "./dom";
import type {
	IBCHConnectModal,
	ModalConfig,
	OpenOpts,
	Theme,
} from "./models/modal";
import { DefaultWallets } from "./wallets";

export class BCHConnectModal implements IBCHConnectModal {
	private modal: ModalDOM;

	constructor({ wallets, sessionType, theme }: ModalConfig) {
		this.modal = new ModalDOM();
		this.modal.setSessionType(sessionType);
		this.modal.setWallets(wallets ?? DefaultWallets);
		if (theme) this.modal.setTheme(theme);
	}

	public open({ uri }: OpenOpts) {
		this.modal.setUri(uri);
		this.modal.open();
	}

	public close() {
		this.modal.close();
	}

	public setTheme(theme: Theme) {
		this.modal.setTheme(theme);
	}

	public destroy() {
		this.modal.unmount();
	}
}

export const createBCHConnectModal = (config: ModalConfig) => {
	return new BCHConnectModal(config);
};
