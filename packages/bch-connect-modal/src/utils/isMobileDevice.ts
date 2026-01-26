export const isMobileDevice = (): boolean => {
	if (typeof navigator === "undefined") return false;

	// biome-ignore lint/suspicious: any
	const navAny = navigator as any;
	if (
		navAny.userAgentData &&
		typeof navAny.userAgentData.mobile === "boolean"
	) {
		return navAny.userAgentData.mobile;
	}

	const ua = navigator.userAgent || "";
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		ua,
	);
};
