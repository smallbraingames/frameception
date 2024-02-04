import getOwnerAddressFromFid from '@/frames/getOwnerAddressFromFid';
import validateFrameRequest from '@/frames/validateFrameRequest';
import { getWriteCollectionContract } from '@/mint/getCollectionContract';
import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import mint from '@/mint/mint';
import ownerWalletClient from '@/mint/ownerWalletClient';
import publicClient from '@/mint/publicClient';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import { FrameButtonMetadata } from '@coinbase/onchainkit/dist/types/core/types';
import { kv } from '@vercel/kv';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const getResponse = async (req: Request, tokenId: number) => {
  const frameRequest = await req.json();
  if (!frameRequest) {
    console.error('[Mint Frame] Invalid request', frameRequest);
    return new Response('Invalid request', { status: 400 });
  }

  const { fid, isValid } = await validateFrameRequest(frameRequest);
  if (!fid || !isValid) {
    console.error('[Mint Frame] Invalid frame request', frameRequest);
    return new Response('Invalid frame request', { status: 400 });
  }

  const [imageUrl, owner] = await Promise.all([
    kv.get<string>(getTokenImageKVKey(tokenId)),
    getOwnerAddressFromFid(fid),
  ]);
  const contract = getWriteCollectionContract(publicClient, ownerWalletClient);
  const hasAlreadyMinted =
    Number(await contract.read.balanceOf([owner, tokenId])) > 0;

  const buttonIndex = frameRequest.untrustedData.buttonIndex;

  if (!owner) {
    console.error('[Mint Frame] Invalid owner');
    return new Response('Invalid owner', { status: 400 });
  }

  if (buttonIndex === 1) {
    return Response.redirect(`${NEXT_PUBLIC_URL}/api/generatre`, 302);
  } else if (buttonIndex === 2) {
    if (!hasAlreadyMinted) {
      await mint(owner, tokenId);
    }
  }

  const buttons: [FrameButtonMetadata, ...FrameButtonMetadata[]] = [
    {
      label: hasAlreadyMinted
        ? 'Already minted! Create your own'
        : 'Create your Own',
      action: 'post_redirect',
    },
  ];
  if (!hasAlreadyMinted) buttons.push({ label: 'Mint' });

  return new Response(
    getFrameHtmlResponse({
      buttons,
      input: {
        text: 'Write a new prompt, or leave blank to refresh the previous prompt',
      },
      image: imageUrl ?? '',
      post_url: `${NEXT_PUBLIC_URL}/api/generate`,
    })
  );
};

export const POST = (
  request: Request,
  { params }: { params: { tokenId: string } }
) => {
  const tokenId = Number(params.tokenId);
  return getResponse(request, tokenId);
};
