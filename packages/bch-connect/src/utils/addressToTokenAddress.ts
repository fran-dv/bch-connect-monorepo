import {
  cashAddressToLockingBytecode,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";

export interface AddressToTokenAddressParams {
  address: string;
  network: "mainnet" | "testnet" | "regtest";
}

const Prefixes = {
  mainnet: "bitcoincash",
  testnet: "bchtest",
  regtest: "bchreg",
} as const;

export const addressToTokenAddress = ({
  address,
  network,
}: AddressToTokenAddressParams) => {
  const addressWithPrefix = !address.includes(Prefixes[network])
    ? `${Prefixes[network]}:${address}`
    : address;

  const toBytecodeResult = cashAddressToLockingBytecode(addressWithPrefix);

  if (typeof toBytecodeResult === "string") {
    throw new Error(toBytecodeResult);
  }

  const toAddressresult = lockingBytecodeToCashAddress({
    prefix: Prefixes[network],
    bytecode: toBytecodeResult.bytecode,
    tokenSupport: true,
  });

  if (typeof toAddressresult === "string") {
    throw new Error(toAddressresult);
  }

  return toAddressresult.address;
};

export default addressToTokenAddress;
