// Adapted from https://github.com/privy-io/privy-frames-demo/blob/main/lib/farcaster.ts
import { createPublicClient, getContract, http, zeroAddress } from 'viem';
import { optimism } from 'viem/chains';

const ID_REGISTRY_CONTRACT_ADDRESS: `0x${string}` =
  '0x00000000fc6c5f01fc30151999387bb99a9f489b';

const getOwnerAddressFromFid = async (fid: number) => {
  let ownerAddress: `0x${string}` | undefined;
  try {
    const publicClient = createPublicClient({
      chain: optimism,
      transport: http(),
    });
    const idRegistry = getContract({
      address: ID_REGISTRY_CONTRACT_ADDRESS,
      abi: [
        {
          inputs: [{ internalType: 'uint256', name: 'fid', type: 'uint256' }],
          name: 'custodyOf',
          outputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      client: publicClient,
    });
    ownerAddress = await idRegistry.read.custodyOf([BigInt(fid)]);
  } catch (error) {
    console.error(error);
  }
  return ownerAddress !== zeroAddress ? ownerAddress : undefined;
};

export default getOwnerAddressFromFid;
