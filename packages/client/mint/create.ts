import { Address } from 'viem';
import { getWriteCollectionContract } from './getCollectionContract';
import ownerWalletClient from './ownerWalletClient';
import getTransactionReceipt from './getTransactionReceipt';

const create = async (creator: Address, supply: number) => {
  const contract = getWriteCollectionContract(ownerWalletClient);
  const txHash = await contract.write.create([creator, supply]);
  const receipt = await getTransactionReceipt(txHash);
  if (receipt.status === 'reverted') {
    throw Error(
      `[Mint] Transaction reverted: ${txHash}, ${JSON.stringify(receipt)}`
    );
  }
};

export default create;
