import { getFrameMetadata } from '@coinbase/onchainkit';

const NEXT_PUBLIC_URL = 'https://frameception.vercel.app';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Create artwork',
    },
  ],
  input: {
    text: 'Write your prompt here',
  },
  image: `${NEXT_PUBLIC_URL}/dummy.png`,
  post_url: `${NEXT_PUBLIC_URL}/api/generate`,
});

export const metadata = {
  title: 'Frameception',
  description: 'Create a frame within a frame.',
  openGraph: {
    title: 'Frameception',
    description: 'Create a frame within a frame.',
    images: [`${NEXT_PUBLIC_URL}/dummy.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Home() {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      frameception
    </main>
  );
}
