import { Hex } from 'viem';
import publicClient from './publicClient';

const getTransactionReceipt = async (hash: Hex) => {
  return await publicClient.waitForTransactionReceipt({
    hash,
  });
};

export default getTransactionReceipt;
