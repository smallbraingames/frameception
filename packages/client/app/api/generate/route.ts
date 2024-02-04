import getGenerateFrame from '@/frames/getGenerateFrame';
import validateFrameRequest from '@/frames/validateFrameRequest';
import getImageUrl from '@/generate/getImageUrl';
import { FrameRequest } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const getPreviousPromptKey = (fid: number) => `previous-prompt-${fid}`;

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  let text: string | undefined = '';

  const body: FrameRequest = await req.json();
  const { isValid, fid } = await validateFrameRequest(body);
  const buttonIndex = body.untrustedData.buttonIndex;

  if (!isValid || !fid || buttonIndex === undefined) {
    return NextResponse.json({
      status: 400,
      message: 'Invalid request',
    });
  }

  let url: string | undefined;

  if (buttonIndex === 1) {
    text = body.untrustedData.inputText;
    console.log('[Generate] Text: ', text);
    const prevPromptKey = getPreviousPromptKey(body.untrustedData.fid);
    if (text === '') {
      const prevPrompt = await kv.get<string>(prevPromptKey);
      url = await getImageUrl(prevPrompt ?? '');
    } else {
      [, url] = await Promise.all([
        kv.set(prevPromptKey, text),
        getImageUrl(text),
      ]);
    }
  } else if (buttonIndex === 2) {
    const prevPromptKey = getPreviousPromptKey(body.untrustedData.fid);
    const prevPrompt = await kv.get<string>(prevPromptKey);
    if (!prevPrompt) {
      return NextResponse.json({
        status: 400,
        message: 'No previous prompt',
      });
    }
    const url = await getImageUrl(prevPrompt);
    return NextResponse.redirect(`${NEXT_PUBLIC_URL}/create?url=${url}`, {
      status: 302,
    });
  }

  return new NextResponse(getGenerateFrame(url ?? ''));
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
