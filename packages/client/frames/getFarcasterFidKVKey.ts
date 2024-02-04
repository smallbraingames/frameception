import { Address } from 'viem';

const getFarcasterFidKVKey = (address: Address): string =>
  `farcaster-name-${address}`;

export default getFarcasterFidKVKey;
