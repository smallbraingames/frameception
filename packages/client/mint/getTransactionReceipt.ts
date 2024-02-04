import { Hex } from 'viem';

import publicClient from './publicClient';

const getTransactionReceipt = async (hash: Hex) => {
  return await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: 10 * 1000,
  });
};

export default getTransactionReceipt;
