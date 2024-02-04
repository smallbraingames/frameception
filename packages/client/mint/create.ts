import { WalletClient } from 'viem';

import { getWriteCollectionContract } from './getCollectionContract';
import getTransactionReceipt from './getTransactionReceipt';
import publicClient from './publicClient';

const create = async (walletClient: WalletClient, supply: number) => {
  const contract = getWriteCollectionContract(publicClient, walletClient);
  const creator = walletClient.account?.address;
  if (!creator) {
    throw Error('[Create] No address from wallet client');
  }
  console.log(`[Create] Creating: (creator) ${creator}, (supply) ${supply}`);
  const pricePerSupply = (await contract.read.pricePerSupply()) as bigint;
  const txHash = await contract.write.create([creator, supply], {
    value: BigInt(supply) * pricePerSupply,
  });
  const receipt = await getTransactionReceipt(txHash);
  if (receipt.status === 'reverted') {
    throw Error(
      `[Create] Transaction reverted: ${txHash}, ${JSON.stringify(receipt)}`
    );
  }
  console.log(`[Create] Created: ${creator}, ${supply}`);
  return receipt;
};

export default create;
