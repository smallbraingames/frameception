import chain from '@/mint/chain';
import create from '@/mint/create';
import ownerWalletClient from '@/mint/ownerWalletClient';
import publicClient from '@/mint/publicClient';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Hex, getAddress } from 'viem';

const MAX_SUPPLY = 1e6;

const getKey = (chainId: number, hash: Hex) => `${chainId}:${hash}`;

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const hash = body.hash as Hex | undefined;
  const supply = body.supply as number | undefined;

  if (!hash || hash.slice(0, 2) !== '0x') {
    return NextResponse.json({ message: 'Invalid hash' }, { status: 500 });
  }

  if (
    !supply ||
    supply <= 0 ||
    supply > MAX_SUPPLY ||
    !Number.isInteger(supply)
  ) {
    return NextResponse.json({ message: 'Invalid supply' }, { status: 500 });
  }

  const transaction = await publicClient.getTransaction({
    hash,
  });

  const chainId = chain.id;
  const sender = transaction.from;
  const value = transaction.value;
  if (!transaction.to) {
    return NextResponse.json(
      { message: 'Invalid transaction: No to' },
      { status: 500 }
    );
  }
  const to = getAddress(transaction.to);
  const ownerAddress = getAddress(ownerWalletClient.account.address);

  if (to !== ownerAddress) {
    return NextResponse.json(
      { message: 'Invalid transaction: Not to owner' },
      { status: 500 }
    );
  }

  if (value <= 0) {
    return NextResponse.json(
      { message: 'Invalid transaction: Zero value' },
      { status: 500 }
    );
  }

  const key = getKey(chainId, hash);
  const hasUsedPayment = await kv.get(key);
  if (hasUsedPayment) {
    return NextResponse.json(
      { message: 'Invalid transaction: Already used hash' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { message: 'Invalid transaction: Already used hash' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Error creating token, refunded' },
      { status: 500 }
    );
  }

  console.log(
    `[RegisterPaymentAndCreateToken] Created token: (sender) ${sender}, (to) ${to}, (value) ${value}, (hash) ${hash}, (chainId) ${chainId}`
  );

  return NextResponse.json({ message: 'Created' }, { status: 200 });
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
