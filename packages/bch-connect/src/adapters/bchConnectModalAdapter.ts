import {
	type BCHConnectModal,
	createBCHConnectModal,
	type ModalConfig,
} from "bch-connect-modal";
import { SESSION_TYPE, type SessionType } from "@/models/config";
import type { Modal } from "@/models/modal";

export class BCHConnectModalAdapter implements Modal {
	private modal: BCHConnectModal;

	constructor(internal: BCHConnectModal) {
		this.modal = internal;
	}

	open({ uri }: { uri: string }) {
		return this.modal.open({ uri });
	}

	close() {
		return this.modal.close();
	}
}

const DefaultConfig: ModalConfig = {
	sessionType: SESSION_TYPE.walletConnectV2,
};

// Wrap ModalConfig with local SessionType model
export interface BCHConnectModalConfig
	extends Omit<ModalConfig, "sessionType"> {
	sessionType: SessionType;
}

export const bchConnectModal = (modalConfig?: BCHConnectModalConfig): Modal => {
	const adaptedConfig: ModalConfig = modalConfig
		? (modalConfig as ModalConfig)
		: DefaultConfig;

	const modal = createBCHConnectModal(adaptedConfig);
	const adapter = new BCHConnectModalAdapter(modal);
	return adapter;
};
