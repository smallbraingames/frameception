import { base, localhost } from 'viem/chains';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? -1);
if (chainId !== 31337 && chainId !== base.id) {
  throw new Error(`[Chain] NEXT_PUBLIC_CHAIN_ID is unsupported: ${chainId}`);
}
const chain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? -1) === base.id ? base : localhost;
export default chain;
