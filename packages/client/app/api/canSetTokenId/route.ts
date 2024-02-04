import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import isURLValid from '@/mint/isURLValid';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const id = body.id as number | undefined;
  const url = body.url as string | undefined;
  if (!id) {
    return NextResponse.json({ value: false });
  }
  if (!url) {
    return NextResponse.json({ value: false });
  }
  const key = getTokenImageKVKey(id);
  const existingUrl = await kv.get(key);
  if (existingUrl) {
    return NextResponse.json({ value: false });
  }

  const isValid = isURLValid(url);
  if (!isValid) {
    return NextResponse.json({ value: false });
  }

  return NextResponse.json({ value: !existingUrl });
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
