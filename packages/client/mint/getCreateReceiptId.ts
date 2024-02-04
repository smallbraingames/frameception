import collectionAbi from 'contracts/out/Collection.sol/Collection.abi.json';
import { TransactionReceipt, decodeEventLog } from 'viem';

const getCreateReceiptId = (receipt: TransactionReceipt) => {
  try {
    for (const encodedLog of receipt.logs) {
      try {
        const log = decodeEventLog({
          abi: collectionAbi,
          data: encodedLog.data,
          topics: encodedLog.topics,
        });
        if (log.eventName === 'Created') {
          const id: bigint = (log.args as any).id;
          return Number(id);
        }
      } catch (e) {
        console.warn(
          '[GetCreateReceiptId] Error parsing log, skipping...',
          e,
          encodedLog
        );
      }
    }
  } catch (e) {
    console.warn(
      '[GetCreateReceiptId] Error parsing receipt, skipping...',
      e,
      receipt
    );
  }
  return undefined;
};

export default getCreateReceiptId;
