import chain from '@/mint/chain';
import { getReadCollectionContract } from '@/mint/getCollectionContract';
import publicClient from '@/mint/publicClient';
import {
  Address,
  Hex,
  decodeEventLog,
  getAddress,
  parseAbi,
  zeroAddress,
} from 'viem';
import { base } from 'viem/chains';

const START_BLOCK = Number(process.env.NEXT_PUBLIC_START_BLOCK) ?? 0;
if (START_BLOCK === 0) {
  console.warn(
    '[Get Collection Info] NEXT_PUBLIC_START_BLOCK is not set, defaulting to 0'
  );
}

const LOGS_ABI = parseAbi([
  'event Created(address indexed creator, uint256 indexed id, uint256 supply)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 amount)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] amounts)',
]);

export type TokenInfo = {
  creator: Address;
  supply: number;
  holders: Map<Address, number>;
};

const dummyGetLogs = () =>
  decodeEventLog({
    abi: LOGS_ABI,
    data: undefined,
    topics: [],
    strict: false,
  });

type Logs = {
  log: Awaited<ReturnType<typeof dummyGetLogs>>;
  blockNumber: number;
}[];

const getBasescanLogs = async (contractAddress: Address): Promise<Logs> => {
  const basescanUrl = `https://api.basescan.org/api?module=logs&action=getLogs&address=${contractAddress}`;
  const response: {
    result: {
      data: Hex;
      topics: [signature: `0x${string}`, ...args: `0x${string}`[]];
    }[];
    blockNumber: Hex;
  } = await (await fetch(basescanUrl)).json();

  const decodedLogs: Logs = [];
  for (const log of response.result) {
    try {
      const decodedLog = decodeEventLog({
        abi: LOGS_ABI,
        data: log.data,
        topics: log.topics,
        strict: false,
      });
      decodedLogs.push({
        log: decodedLog,
        blockNumber: parseInt(response.blockNumber),
      });
    } catch (e) {
      console.warn("[Get Collection Logs] Error parsing basescan log", e);
    }
  }

  return decodedLogs;
};

const getBlockLogs = async (contractAddress: Address): Promise<Logs> => {
  const logs = await publicClient.getLogs({
    address: contractAddress,
    events: LOGS_ABI,
    fromBlock: BigInt(START_BLOCK),
  });
  return logs.map((log) => ({ log, blockNumber: Number(log.blockNumber) }));
};

const getCollectionInfo = async () => {
  const collectionContract = getReadCollectionContract(publicClient);
  let logs: Logs;
  if (chain.id === base.id) {
    logs = await getBasescanLogs(collectionContract.address);
  } else {
    logs = await getBlockLogs(collectionContract.address);
  }
  logs.sort((a, b) => a.blockNumber - b.blockNumber);

  const ids: Map<number, TokenInfo> = new Map();

  const createEmptyTokenInfo = (id: number) => {
    const info = { creator: zeroAddress, supply: 0, holders: new Map() };
    ids.set(id, info);
    return info;
  };

  const processTransferSingle = (
    to: Address,
    from: Address,
    amount: number,
    id: number
  ) => {
    const info = ids.get(id) ?? createEmptyTokenInfo(id);

    if (from === zeroAddress) {
      // Mint
      const prevBalance = info.holders.get(to) ?? 0;
      info.holders.set(to, prevBalance + Number(amount));
    } else {
      // Transfer
      const fromBalance = info.holders.get(from) ?? 0;
      const toBalance = info.holders.get(to) ?? 0;
      info.holders.set(from, fromBalance - Number(amount));
      info.holders.set(to, toBalance + Number(amount));
    }
  };

  for (const { log } of logs) {
    if (log.eventName === 'Created') {
      const id = Number(log.args.id);
      const info = ids.get(id) ?? createEmptyTokenInfo(id);
      log.args.creator && (info.creator = log.args.creator);
      log.args.supply && (info.supply = Number(log.args.supply));
    } else if (log.eventName === 'TransferSingle') {
      if (
        log.args.from !== undefined &&
        log.args.to &&
        log.args.amount &&
        log.args.id
      ) {
        const id = Number(log.args.id);
        const from = getAddress(log.args.from);
        const to = getAddress(log.args.to);
        const amount = Number(log.args.amount);
        processTransferSingle(to, from, amount, id);
      } else {
        console.warn('[Get Collection Info] Unhandled TransferSingle log', log);
      }
    } else if (log.eventName === 'TransferBatch') {
      if (
        log.args.ids &&
        log.args.from &&
        log.args.to &&
        log.args.amounts &&
        log.args.ids.length === log.args.amounts.length
      ) {
        const from = getAddress(log.args.from);
        const to = getAddress(log.args.to);
        const amounts = log.args.amounts.map(Number);
        log.args.ids.forEach((id: bigint, index: number) => {
          const amount = amounts[index];
          processTransferSingle(to, from, amount, Number(id));
        });
      } else {
        console.warn('[Get Collection Info] Unhandled TransferBatch log', log);
      }
    }
  }
  return ids;
};

export default getCollectionInfo;
