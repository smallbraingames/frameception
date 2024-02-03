import { Address } from 'viem';
import { getWriteCollectionContract } from './getCollectionContract';
import ownerWalletClient from './ownerWalletClient';
import getTransactionReceipt from './getTransactionReceipt';
import publicClient from './publicClient';

const mint = async (to: Address, id: number) => {
  const contract = getWriteCollectionContract(publicClient, ownerWalletClient);

  const prevBalance = (await contract.read.balanceOf([to, id])) as bigint;
  console.log(
    `[Mint] Minting: (to) ${to}, (id) ${id}, (token balance) ${prevBalance}`
  );
  const txHash = await contract.write.mint([to, id]);
  const receipt = await getTransactionReceipt(txHash);

  if (receipt.status === 'reverted') {
    throw Error(
      `[Mint] Transaction reverted: (hash) ${txHash}, (receipt) ${JSON.stringify(receipt)}`
    );
  }

  const newBalance = (await contract.read.balanceOf([to, id])) as bigint;
  console.log(`[Mint] Minted: ${to}, ${id}, token balance: ${newBalance}`);
  if (newBalance <= prevBalance) {
    console.warn(
      `[Mint] Post mint check balance mismatch: (to) ${to}, (id) ${id}, (previous token balance) ${prevBalance}, (current token balance) ${newBalance}`
    );
  }
};

export default mint;
