import { base, foundry } from 'viem/chains';

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? -1);

if (chainId !== foundry.id && chainId !== base.id) {
  throw new Error(`[Chain] NEXT_PUBLIC_CHAIN_ID is unsupported: ${chainId}`);
}
const chain =
  Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? -1) === base.id ? base : foundry;
export default chain;
