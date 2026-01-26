import type { AppKit, CreateAppKit } from "@reown/appkit/core";
import type { CustomCaipNetwork } from "@reown/appkit-common";
import Networks from "@/config/BCHCustomCaipNetworks";
import type { Modal, ModalFactory, ModalFactoryContext } from "@/models/modal";

export class ReownModalAdapter implements Modal {
	private appKit: AppKit;

	constructor(appKit: AppKit) {
		this.appKit = appKit;
	}

	open({ uri }: { uri: string }) {
		return this.appKit.open({ uri });
	}

	close() {
		return this.appKit.close();
	}
}

export const reownModal = (
	options: Omit<
		CreateAppKit,
		"projectId" | "metadata" | "manualWCControl" | "networks"
	>,
): ModalFactory => {
	return async (config: ModalFactoryContext) => {
		const { createAppKit } = await import("@reown/appkit/core");

		const appKit = createAppKit({
			projectId: config.projectId,
			networks: [Networks[config.network] as CustomCaipNetwork],
			manualWCControl: true,
			themeMode: options.themeMode ?? "dark",
			...options,
		});
		return new ReownModalAdapter(appKit);
	};
};
