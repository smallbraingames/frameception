import getCreateReceiptId from '@/mint/getCreateReceiptId';
import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import getTransactionReceipt from '@/mint/getTransactionReceipt';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Hex } from 'viem';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const hash = body.hash as Hex | undefined;
  const url = body.url as string | undefined;

  if (!url) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 500 });
  }

  if (!hash || hash.slice(0, 2) !== '0x') {
    return NextResponse.json({ message: 'Invalid hash' }, { status: 500 });
  }

  const transactionReceipt = await getTransactionReceipt(hash);
  if (!transactionReceipt) {
    console.error(
      `[RegisterPaymentAndCreateToken] No receipt from hash: ${hash}`
    );
    return NextResponse.json(
      { message: 'Invalid transaction' },
      { status: 500 }
    );
  }

  const tokenId = getCreateReceiptId(transactionReceipt);

  if (!tokenId) {
    console.error(
      `[RegisterPaymentAndCreateToken] No tokenId from receipt: ${JSON.stringify(
        transactionReceipt
      )}`
    );

    return NextResponse.json({ message: 'Invalid receipt' }, { status: 500 });
  }

  await kv.set(getTokenImageKVKey(tokenId), url);

  return NextResponse.json({ message: 'Created' }, { status: 200 });
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
