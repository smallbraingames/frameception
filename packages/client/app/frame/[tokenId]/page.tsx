import { getFrameMetadata } from '@coinbase/onchainkit';
import { Metadata } from 'next';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

export const generateMetadata = async ({
  params,
}: {
  params: { tokenId: string };
}): Promise<Metadata> => {
  const tokenId = Number(params.tokenId);
  const imageUrl = (
    await (await fetch(`${NEXT_PUBLIC_URL}/api/token/${tokenId}`)).json()
  ).image;

  const frameMetadata = getFrameMetadata({
    buttons: [
      {
        label: 'Create your own',
      },
      {
        label: 'Mint',
      },
    ],
    image: imageUrl,
    post_url: `${NEXT_PUBLIC_URL}/api/frame/${tokenId}`,
  });

  return {
    title: 'Frameception',
    description: 'Create a frame within a frame.',
    openGraph: {
      title: 'Frameception',
      description: 'Create a frame within a frame.',
      images: [imageUrl],
    },
    other: {
      ...frameMetadata,
    },
  };
};

const Frame = () => {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
  );
};

export default Frame;
