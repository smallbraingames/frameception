import { Address } from 'viem';
import { getWriteCollectionContract } from './getCollectionContract';
import ownerWalletClient from './ownerWalletClient';
import getTransactionReceipt from './getTransactionReceipt';
import publicClient from './publicClient';

const create = async (creator: Address, supply: number) => {
  const contract = getWriteCollectionContract(publicClient, ownerWalletClient);
  console.log(`[Create] Creating: (creator) ${creator}, (supply) ${supply}`);
  const txHash = await contract.write.create([creator, supply]);
  const receipt = await getTransactionReceipt(txHash);
  if (receipt.status === 'reverted') {
    throw Error(
      `[Create] Transaction reverted: ${txHash}, ${JSON.stringify(receipt)}`
    );
  }
  console.log(`[Create] Created: ${creator}, ${supply}`);
};

export default create;
