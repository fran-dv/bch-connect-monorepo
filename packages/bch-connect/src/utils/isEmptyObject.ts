export const isEmptyObject = (
	value: unknown,
): value is Record<string, never> => {
	return (
		!!value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype &&
		Object.keys(value).length === 0
	);
};
