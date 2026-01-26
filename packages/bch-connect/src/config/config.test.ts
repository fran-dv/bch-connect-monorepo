import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	BCH_EVENT,
	BCH_METHOD,
	CAIP_NETWORK_ID,
	type Configuration,
	NETWORK_INDEX,
	SESSION_TYPE,
} from "@/models/config";
import { createConfig, getNamespaces, initializeConnection } from "./config";

// --- MOCKS ---
const mockInitNew = vi.fn();
const mockInitOld = vi.fn();
vi.mock("@walletconnect/sign-client", () => ({
	default: { init: mockInitNew },
}));
vi.mock("sign-client-v2-20", () => ({
	default: { init: mockInitOld },
}));

const mockDefaultModalInstance = {
	open: vi.fn(),
	close: vi.fn(),
	id: "default-modal-instance",
};

// The factory returns the instance
const mockDefaultFactory = vi.fn().mockResolvedValue(mockDefaultModalInstance);

vi.mock("@/adapters/bchConnectModalAdapter", () => ({
	bchConnectModal: vi.fn(() => mockDefaultFactory),
}));

const mockBaseConfig: Configuration = {
	projectId: "test-id",
	network: NETWORK_INDEX.mainnet,
	metadata: {
		name: "Test App",
		description: "A test dApp",
		url: "https://test.app",
		icons: [],
	},
	sessionType: SESSION_TYPE.walletConnectV2,
};

describe("config/config.ts", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockInitNew.mockResolvedValue({ clientType: "new" });
		mockInitOld.mockResolvedValue({ clientType: "old" });
	});

	describe("createConfig", () => {
		it("should merge default values with provided configuration", () => {
			const config = createConfig(mockBaseConfig);

			expect(config.supportLegacyClient).toBe(true);
			expect(config.debug).toBe(false);
			expect(config.projectId).toBe("test-id");
			// Check that the default modal factory is assigned (not executed yet)
			expect(config.modal).toBeDefined();
		});

		it("should allow overriding default values", () => {
			const customConfig: Configuration = {
				...mockBaseConfig,
				debug: true,
				supportLegacyClient: false,
			};

			const config = createConfig(customConfig);

			expect(config.debug).toBe(true);
			expect(config.supportLegacyClient).toBe(false);
		});
	});

	describe("getNamespaces", () => {
		it("should return the correct namespace structure for mainnet", () => {
			const namespaces = getNamespaces(NETWORK_INDEX.mainnet);

			expect(namespaces.bch.chains).toEqual([CAIP_NETWORK_ID.mainnet]);
			expect(namespaces.bch.methods).toEqual(Object.values(BCH_METHOD));
			expect(namespaces.bch.events).toEqual(Object.values(BCH_EVENT));
		});

		it("should return the correct namespace structure for testnet", () => {
			const namespaces = getNamespaces(NETWORK_INDEX.testnet);

			expect(namespaces.bch.chains).toEqual([CAIP_NETWORK_ID.testnet]);
			expect(namespaces.bch.methods).toEqual(Object.values(BCH_METHOD));
			expect(namespaces.bch.events).toEqual(Object.values(BCH_EVENT));
		});

		it("should return the correct namespace structure for regtest", () => {
			const namespaces = getNamespaces(NETWORK_INDEX.regtest);

			expect(namespaces.bch.chains).toEqual([CAIP_NETWORK_ID.regtest]);
			expect(namespaces.bch.methods).toEqual(Object.values(BCH_METHOD));
			expect(namespaces.bch.events).toEqual(Object.values(BCH_EVENT));
		});
	});

	describe("initializeConnection", () => {
		it("should lazy load Modern SignClient when supportLegacyClient is FALSE", async () => {
			const config = createConfig({
				...mockBaseConfig,
				supportLegacyClient: false,
			});
			const result = await initializeConnection(config);

			expect(mockInitNew).toHaveBeenCalledTimes(1);
			expect(mockInitOld).not.toHaveBeenCalled();
			expect(result.signClient).toEqual({ clientType: "new" });
		});

		it("should lazy load Legacy SignClient when supportLegacyClient is TRUE", async () => {
			const config = createConfig({
				...mockBaseConfig,
				supportLegacyClient: true,
			});
			const result = await initializeConnection(config);

			expect(mockInitOld).toHaveBeenCalledTimes(1);
			expect(mockInitNew).not.toHaveBeenCalled();
			expect(result.signClient).toEqual({ clientType: "old" });
		});

		it("should execute the Factory function with correct context", async () => {
			// Mock a custom factory passed by the user
			const customFactorySpy = vi.fn().mockResolvedValue({
				open: vi.fn(),
				close: vi.fn(),
				id: "custom-factory-modal",
			});

			const config = createConfig({
				...mockBaseConfig,
				modal: customFactorySpy,
			});

			const result = await initializeConnection(config);

			// Ensure the factory was actually called
			expect(customFactorySpy).toHaveBeenCalledTimes(1);

			// Ensure correct context was passed
			expect(customFactorySpy).toHaveBeenCalledWith({
				projectId: "test-id",
				network: NETWORK_INDEX.mainnet,
				sessionType: config.sessionType,
			});

			expect(result.modal).toEqual(
				expect.objectContaining({ id: "custom-factory-modal" }),
			);
		});

		it("should use the Instance directly if passed as an object", async () => {
			const customModalInstance = {
				open: vi.fn(),
				close: vi.fn(),
				id: "direct-instance",
			};

			const config = createConfig({
				...mockBaseConfig,
				modal: customModalInstance,
			});

			const result = await initializeConnection(config);

			expect(result.modal).toBe(customModalInstance);
		});

		it("should execute the Default Modal Factory if modal is undefined", async () => {
			const rawConfig = {
				...mockBaseConfig,
				modal: undefined,
			} as unknown as Configuration;

			const result = await initializeConnection(rawConfig);

			expect(mockDefaultFactory).toHaveBeenCalledTimes(1);

			expect(mockDefaultFactory).toHaveBeenCalledWith({
				projectId: "test-id",
				network: NETWORK_INDEX.mainnet,
				sessionType: rawConfig.sessionType,
			});

			expect(result.modal).toEqual(mockDefaultModalInstance);
		});

		it("should pass 'debug' logger to SignClient when debug is TRUE", async () => {
			const config = createConfig({
				...mockBaseConfig,
				debug: true,
				supportLegacyClient: false,
			});
			await initializeConnection(config);

			expect(mockInitNew).toHaveBeenCalledWith(
				expect.objectContaining({
					logger: "debug",
				}),
			);
		});

		it("should pass undefined logger to SignClient when debug is FALSE", async () => {
			const config = createConfig({
				...mockBaseConfig,
				debug: false,
				supportLegacyClient: false,
			});
			await initializeConnection(config);

			expect(mockInitNew).toHaveBeenCalledWith(
				expect.objectContaining({
					logger: undefined,
				}),
			);
		});
	});
});
