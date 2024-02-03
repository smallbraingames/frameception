import { FrameRequest, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';

const NEXT_PUBLIC_URL = 'https://frameception.vercel.app';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let text: string | undefined = '';
  let buttonIndex: number | undefined = undefined;

  const body: FrameRequest = await req.json();

  if (body?.untrustedData?.inputText) {
    text = body.untrustedData.inputText;
    console.log('text: ', text);
    // TODO: create image based on text
  }

  if (body?.untrustedData?.buttonIndex) {
    buttonIndex = body.untrustedData.buttonIndex;
    console.log('buttonIndex: ', buttonIndex);

    if (buttonIndex === 2) {
        // TDOO: redirect to NFT creation page
      return NextResponse.redirect(NEXT_PUBLIC_URL, {
        status: 302,
      });
    }
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Create artwork`,
        },
        {
          label: `Create NFT: ${buttonIndex}`,
          action: 'post_redirect',
        },
      ],
      input: {
        text: 'Write your prompt here',
      },
      image: `${NEXT_PUBLIC_URL}/degen.png`,
      post_url: `${NEXT_PUBLIC_URL}/api/generate`,
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
