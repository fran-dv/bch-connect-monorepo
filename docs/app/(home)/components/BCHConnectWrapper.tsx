"use client";

import { BCHConnectProvider, createConfig } from "bch-connect";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export function BCHConnectWrapper({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState<boolean>(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const config = useMemo(() => {
		if (!mounted) return null;

		return createConfig({
			projectId: "443a55415de265485a8eeaa18494d7ad",
			network: "mainnet",
			metadata: {
				name: "BCH Connect docs",
				description: "Documentation of BCH Connect",
				url: "bchconnect.dev",
				icons: ["https://placehold.io/"],
			},
		});
	}, [mounted]);

	if (!config) return null;

	return <BCHConnectProvider config={config}>{children}</BCHConnectProvider>;
}
