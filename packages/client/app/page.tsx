import { getFrameMetadata } from '@coinbase/onchainkit';

const NEXT_PUBLIC_URL = 'https://seedclub.xyz';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Learn more',
      action: 'post_redirect',
    },
  ],
  input: {
    text: 'Submit your email',
  },
  image: `${NEXT_PUBLIC_URL}/meta.png`,
  post_url: `${NEXT_PUBLIC_URL}/api/redirect`,
});

export const metadata = {
  title: 'Seed Club',
  description: 'Make something people want to be a part of',
  openGraph: {
    title: 'Seed Club',
    description: 'Make something people want to be a part of',
    images: [`${NEXT_PUBLIC_URL}/meta2.png`],
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
