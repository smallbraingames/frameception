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

  buttonIndex = body.untrustedData.buttonIndex;

  let url: string | undefined;

  if (body?.untrustedData?.buttonIndex) {
    buttonIndex = body.untrustedData.buttonIndex;

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
    }

    if (buttonIndex === 2) {
      const prevPromptKey = getPreviousPromptKey(body.untrustedData.fid);
      const prevPrompt = await kv.get<string>(prevPromptKey);
      if (!prevPrompt) {
        return NextResponse.json({
          status: 500,
          message: 'No previous prompt',
        });
      }
      const url = await getImageUrl(prevPrompt);
      return NextResponse.redirect(`${NEXT_PUBLIC_URL}/create?url=${url}`, {
        status: 302,
      });
    }
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: 'Refresh',
        },
        {
          label: `Create NFT: ${buttonIndex}`,
          action: 'post_redirect',
        },
      ],
      input: {
        text: 'Write a new prompt, or leave blank to refresh the previous prompt',
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
