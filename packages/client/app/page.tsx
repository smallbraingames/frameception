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
    <main className='flex bg-green-200 p-2'>
      <div className='py-8 flex flex-row'>
        <div>
          <h1 className='text-2xl font-bold'>Collection</h1>
        </div>

        <CollectionProvider>
          <Gallery />
        </CollectionProvider>
      </div>

      <div></div>
    </main>
  );
}
