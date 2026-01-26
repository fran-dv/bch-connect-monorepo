"use client";

import { BCHConnectProvider, createConfig } from "bch-connect";
import { type ReactNode, useEffect, useMemo, useState } from "react";

export function BCHConnectWrapper({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState<boolean>(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const config = useMemo(() => {
		if (!mounted) return null;

		return createConfig({
			projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "",
			network:
				process.env.NEXT_PUBLIC_BCH_NETWORK === "testnet"
					? "testnet"
					: "mainnet",
			metadata: {
				name: "BCH Connect Starter",
				description: "Change this metadata in app/BCHConnectWrapper.tsx ",
				url: window.location.origin,
				icons: [`${window.location.origin}/bch.svg`],
			},
		});
	}, [mounted]);

	if (!config) {
		return null;
	}
	return <BCHConnectProvider config={config}>{children}</BCHConnectProvider>;
}
