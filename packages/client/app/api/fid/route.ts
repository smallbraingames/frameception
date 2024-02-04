import getFarcasterFidKVKey from '@/frames/getFarcasterFidKVKey';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';

const getResponse = async (req: NextRequest) => {
  const body = await req.json();
  const addresses = (body.addresses as Address[] | undefined) ?? [];
  const resolvedFids = await Promise.all(
    addresses.map(async (address) => {
      const resolvedFid = (await kv.get(getFarcasterFidKVKey(address))) ?? -1;
      return resolvedFid;
    })
  );

  return NextResponse.json({ fids: resolvedFids });
};

export const POST = (req: NextRequest) => {
  return getResponse(req);
};
