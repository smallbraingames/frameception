import CollectionProvider from '@/components/CollectionProvider';
import Gallery from '@/components/Gallery';
import { getFrameMetadata } from '@coinbase/onchainkit';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Create artwork',
    },
  ],
  input: {
    text: 'Write your prompt here',
  },
  image: `${NEXT_PUBLIC_URL}/logo.png`,
  post_url: `${NEXT_PUBLIC_URL}/api/generate`,
});

export const metadata = {
  title: 'Frameception',
  description: 'Create a frame within a frame.',
  openGraph: {
    title: 'Frameception',
    description: 'Create a frame within a frame.',
    images: [`${NEXT_PUBLIC_URL}/logo.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Home() {
  return (
    <main className='flex p-2'>
      <div className='flex flex-row w-full max-w-screen-2xl mx-auto'>
        <div className='w-full'>
          <div className='flex flex-row justify-between'></div>
          <CollectionProvider>
            <Gallery />
          </CollectionProvider>
        </div>
      </div>
    </main>
  );
}
