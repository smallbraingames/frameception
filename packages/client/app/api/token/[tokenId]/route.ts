import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const getResponse = async (tokenId: number) => {
  const imageUrl = await kv.get(getTokenImageKVKey(tokenId));
  return NextResponse.json({
    name: 'Frameception',
    description:
      'A generative art collection created by the Farcaster community. Each piece is unique and was generated and minted in a Farcaster frame.',
    image: imageUrl,
  });
};

export const GET = (
  _: Request,
  { params }: { params: { tokenId: string } }
) => {
  const tokenId = params.tokenId;
  return getResponse(Number(tokenId));
};

export const POST = (
  _: Request,
  { params }: { params: { tokenId: string } }
) => {
  const tokenId = params.tokenId;
  return getResponse(Number(tokenId));
};
