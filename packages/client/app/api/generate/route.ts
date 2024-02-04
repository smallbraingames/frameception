import { generateNewImage } from '@/generate/generateNewImage';
import getImageUrl from '@/generate/getImageUrl';
import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const getPreviousPromptKey = (fid: number) => `previous-prompt-${fid}`;

const getResponse = async (req: NextRequest): Promise<NextResponse> => {
  let text: string | undefined = '';
  let buttonIndex: number | undefined = undefined;

  const body: FrameRequest = await req.json();

  let url;
  if (body?.untrustedData?.inputText) {
    text = body.untrustedData.inputText;
    console.log('[Generate] Text: ', text);
    const prevPromptKey = getPreviousPromptKey(body.untrustedData.fid);
    if (text === '') {
      const prevPrompt = await kv.get<string>(prevPromptKey);
      url = await getImageUrl(prevPrompt ?? '');
    } else {
      [, url] = await Promise.all([
        getImageUrl(text),
        kv.set(prevPromptKey, text),
      ]);
    }
  }

  if (body?.untrustedData?.buttonIndex) {
    buttonIndex = body.untrustedData.buttonIndex;
    console.log('buttonIndex: ', buttonIndex);

    if (buttonIndex === 3) {
      // TODO: redirect to NFT creation page
      return NextResponse.redirect(NEXT_PUBLIC_URL, {
        status: 302,
      });
    }
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: "Refresh",
        },
        {
          label: `Create NFT: ${buttonIndex}`,
          action: 'post_redirect',
        },
      ],
      input: {
        text: 'Write your prompt here',
      },
      image: url ?? '',
      post_url: `${NEXT_PUBLIC_URL}/api/generate`,
    })
  );
};

export const POST = async (req: NextRequest): Promise<Response> => {
  return getResponse(req);
};

export const dynamic = 'force-dynamic';
