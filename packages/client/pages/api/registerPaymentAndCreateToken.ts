import chain from '@/mint/chain';
import create from '@/mint/create';
import ownerWalletClient from '@/mint/ownerWalletClient';
import publicClient from '@/mint/publicClient';
import { kv } from '@vercel/kv';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Hex } from 'viem';

const MAX_SUPPLY = 1e6;

const getKey = (chainId: number, hash: Hex) => `${chainId}:${hash}`;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const hash = req.body.hash as Hex | undefined;
  const supply = req.body.supply as number | undefined;

  if (!hash || hash.slice(0, 2) !== '0x') {
    res.status(400).json({ message: 'Invalid hash' });
    return;
  }

  if (
    !supply ||
    supply <= 0 ||
    supply > MAX_SUPPLY ||
    !Number.isInteger(supply)
  ) {
    res.status(400).json({ message: 'Invalid supply' });
    return;
  }

  const transaction = await publicClient.getTransaction({
    hash,
  });

  const chainId = chain.id;
  const sender = transaction.from;
  const value = transaction.value;
  const to = transaction.to;
  const ownerAddress = ownerWalletClient.account.address;

  if (to !== ownerAddress) {
    res.status(400).json({ message: 'Invalid transaction: Not t' });
    return;
  }

  if (value <= 0) {
    res.status(400).json({ message: 'Invalid transaction: No value' });
    return;
  }

  const key = getKey(chainId, hash);
  const hasUsedPayment = await kv.get(key);
  if (hasUsedPayment) {
    res
      .status(400)
      .json({ message: 'Invalid transaction: Already used payment tx' });
    return;
  }

  await kv.set(key, true);

  try {
    await create(sender, supply);
  } catch (e) {
    console.error(
      '[RegisterPaymentAndCreateToken] Error creating token, refunding user',
      e
    );
    try {
      await ownerWalletClient.sendTransaction({
        to: sender,
        value: value,
      });
    } catch (e) {
      console.error(
        `[RegisterPaymentAndCreateToken] Error refunding user: (sender) ${sender}, (to) ${to}, (value) ${value}, (hash) ${hash}, (chainId) ${chainId}`,
        e
      );
      res
        .status(500)
        .json({ message: 'Error creating token, and error refunding user' });
      return;
    }
    res.status(500).json({ message: 'Error creating token, refunded' });
    return;
  }

  console.log(
    `[RegisterPaymentAndCreateToken] Created token: (sender) ${sender}, (to) ${to}, (value) ${value}, (hash) ${hash}, (chainId) ${chainId}`
  );

  res.status(200).json({ message: 'Created' });
};

export default handler;
