import { describe, expect, it } from "vitest";
import addressToTokenAddress from "./addressToTokenAddress";

const mainnetAddress = "bitcoincash:qp6s8u7gkr2v92uvlmnk0schdcrehaj8yyk2u6qa6g";
const mainnetExpectedTokenAddress =
	"bitcoincash:zp6s8u7gkr2v92uvlmnk0schdcrehaj8yy3q0ywm9m";

const testnetAddress = "bchtest:qp6s8u7gkr2v92uvlmnk0schdcrehaj8yyjccaz2a5";
const testnetExpectedTokenAddress =
	"bchtest:zp6s8u7gkr2v92uvlmnk0schdcrehaj8yy4jtrvvz8";

describe("addressToTokenAddress", () => {
	describe("Successful Conversions", () => {
		it("should convert mainnet address to token address", () => {
			const result = addressToTokenAddress({
				address: mainnetAddress,
				network: "mainnet",
			});

			expect(result).toBe(mainnetExpectedTokenAddress);
		});

		it("should convert testnet address to token address", () => {
			const result = addressToTokenAddress({
				address: testnetAddress,
				network: "testnet",
			});

			expect(result).toBe(testnetExpectedTokenAddress);
		});
	});

	describe("Error Handling", () => {
		it("should throw error when address is invalid", () => {
			const invalidAddress = "invalid-address";

			expect(() =>
				addressToTokenAddress({
					address: invalidAddress,
					network: "mainnet",
				}),
			).toThrowError();
		});

		it("should throw error for addresses with wrong network prefix", () => {
			expect(() =>
				addressToTokenAddress({
					address: "bchtest:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9ay4zl5q",
					network: "mainnet",
				}),
			).toThrowError();
		});
	});

	describe("Edge Cases", () => {
		it("should handle addresses without prefix", () => {
			const address = mainnetAddress.replace("bitcoincash:", "");

			const result = addressToTokenAddress({
				address,
				network: "mainnet",
			});

			expect(result).toBe(mainnetExpectedTokenAddress);
		});
	});
});
