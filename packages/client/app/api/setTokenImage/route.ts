import { getReadCollectionContract } from '@/mint/getCollectionContract';
import parseCreateReceipt from '@/mint/getCreateReceiptId';
import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import getTransactionReceipt from '@/mint/getTransactionReceipt';
import publicClient from '@/mint/publicClient';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Hex, getAddress } from 'viem';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();

  const hash = body.hash as Hex | undefined;
  const url = body.url as string | undefined;

  if (!url) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 400 });
  }

  if (!hash || hash.slice(0, 2) !== '0x') {
    return NextResponse.json({ message: 'Invalid hash' }, { status: 400 });
  }

  const transactionReceipt = await getTransactionReceipt(hash);
  if (!transactionReceipt) {
    console.error(
      `[RegisterPaymentAndCreateToken] No receipt from hash: ${hash}`
    );
    return NextResponse.json(
      { message: 'Invalid transaction' },
      { status: 400 }
    );
  }

  const to = transactionReceipt.to;
  if (
    !to ||
    getAddress(to) !==
      getAddress(getReadCollectionContract(publicClient).address)
  ) {
    console.error(`[RegisterPaymentAndCreateToken] Invalid to address: ${to}`);

    return NextResponse.json(
      { message: 'Invalid to address' },
      { status: 400 }
    );
  }

  const { id: tokenId } = parseCreateReceipt(transactionReceipt) ?? {
    id: undefined,
  };

  if (!tokenId) {
    console.error(
      `[RegisterPaymentAndCreateToken] No tokenId from receipt: ${JSON.stringify(
        transactionReceipt
      )}`
    );

    return NextResponse.json({ message: 'Invalid receipt' }, { status: 400 });
  }

  const key = getTokenImageKVKey(tokenId);
  const existingUrl = await kv.get(key);
  if (existingUrl) {
    console.error(
      `[RegisterPaymentAndCreateToken] Token already has image: ${tokenId}`
    );

    return NextResponse.json(
      { message: 'Token already has image' },
      { status: 500 }
    );
  }

  await kv.set(getTokenImageKVKey(tokenId), url);

  return NextResponse.json(
    { message: 'Created', id: tokenId },
    { status: 200 }
  );
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
