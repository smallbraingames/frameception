import collectionAbi from 'contracts/out/Collection.sol/Collection.abi.json';
import { Address, PublicClient, WalletClient, getContract } from 'viem';

const contractAddress = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS as
  | Address
  | undefined;
if (!contractAddress) {
  throw new Error(
    '[CollectionContract] NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS is not set'
  );
}

const getCollectionContract = (
  publicClient: PublicClient,
  walletClient?: WalletClient
) => {
  return getContract({
    abi: collectionAbi,
    address: contractAddress,
    client: { public: publicClient, wallet: walletClient },
  });
};

export default getCollectionContract;
