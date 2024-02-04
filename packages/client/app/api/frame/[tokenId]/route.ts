import getFarcasterFidKVKey from '@/frames/getFarcasterFidKVKey';
import getGenerateFrame from '@/frames/getGenerateFrame';
import getOwnerAddressFromFid from '@/frames/getOwnerAddressFromFid';
import validateFrameRequest from '@/frames/validateFrameRequest';
import createOrFindEmbeddedWalletForFid from '@/mint/createOrFindEmbeddedWalletForFid';
import { getReadCollectionContract } from '@/mint/getCollectionContract';
import getTokenImageKVKey from '@/mint/getTokenImageKVKey';
import mint from '@/mint/mint';
import publicClient from '@/mint/publicClient';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';
import {
  FrameButtonMetadata,
  FrameRequest,
} from '@coinbase/onchainkit/dist/types/core/types';
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const getResponse = async (req: Request, tokenId: number) => {
  const frameRequest: FrameRequest | undefined = await req.json();
  if (!frameRequest) {
    console.error('[Mint Frame] Invalid request', frameRequest);
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const { fid, isValid } = await validateFrameRequest(frameRequest);
  if (!fid || !isValid) {
    console.error('[Mint Frame] Invalid frame request', frameRequest);
    return NextResponse.json(
      { message: 'Invalid frame request' },
      { status: 400 }
    );
  }

  const [owner, imageUrl] = await Promise.all([
    getOwnerAddressFromFid(fid),
    kv.get<string>(getTokenImageKVKey(tokenId)),
  ]);
  const contract = getReadCollectionContract(publicClient);
  let hasAlreadyMinted =
    Number(await contract.read.balanceOf([owner, tokenId])) > 0;

  const buttonIndex = frameRequest.untrustedData.buttonIndex;

  if (!owner) {
    console.error('[Mint Frame] Invalid owner');
    return NextResponse.json({ message: 'Invalid owner' }, { status: 400 });
  }

  if (buttonIndex === 1) {
    return new NextResponse(getGenerateFrame(imageUrl ?? ''));
  } else if (buttonIndex === 2) {
    if (!hasAlreadyMinted) {
      const toAddress = await createOrFindEmbeddedWalletForFid(fid, owner);
      if (!toAddress) {
        console.error('[Mint Frame] Unable to create or find embedded wallet');
        return NextResponse.json(
          { message: 'Unable to create or find embedded wallet' },
          { status: 500 }
        );
      }
      await mint(toAddress, tokenId);
      try {
        await kv.set(getFarcasterFidKVKey(toAddress), fid);
      } catch (e) {
        console.warn("[Mint Frame] Couldn't set farcaster fid");
      }
      hasAlreadyMinted = true;
    }
  }

  const buttons: [FrameButtonMetadata, ...FrameButtonMetadata[]] = [
    {
      label: hasAlreadyMinted
        ? 'Minted, now create your own'
        : 'Create your own',
    },
  ];
  if (!hasAlreadyMinted) buttons.push({ label: 'Mint' });

  return new NextResponse(
    getFrameHtmlResponse({
      buttons,
      image: imageUrl ?? '',
      post_url: `${NEXT_PUBLIC_URL}/api/frame/${tokenId}`,
    })
  );
};

export const POST = async (
  req: Request,
  { params }: { params: { tokenId: string } }
) => {
  const tokenId = Number(params.tokenId);
  return getResponse(req, tokenId);
};
