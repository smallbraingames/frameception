import Privy from '@/components/Privy';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Toaster } from 'react-hot-toast';

import dh from '../public/dh.png';
import logo from '../public/logo.png';
import smallbrain from '../public/smallbrain.jpg';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frameception',
  description: 'Create a frame... from WITHIN a frame',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang='en'>
      <body className='bg-stone-100 font-sans text-stone-900'>
        <div className='bg-stone-900 text-stone-100 w-full p-2 flex gap-2 flex-row items-center'>
          <a href='/'>
            <div className='h-8 w-8 relative'>
              <Image
                src={logo}
                alt='Logo'
                layout='fill'
                className='rounded-sm'
              />
            </div>
          </a>

          <div className='grow' />

          <div className='flex flex-row gap-2 items-center'>
            <div className='tracking-tight text-xs text-stone-500'>
              A project by
            </div>

            <a
              href='https://warpcast.com/0xsmallbrain'
              target='_blank'
              rel='noreferrer'
            >
              <div className='h-8 w-8 relative'>
                <Image
                  src={smallbrain}
                  alt='smallbrain'
                  layout='fill'
                  className='rounded-full'
                />
              </div>
            </a>

            <a
              href='https://warpcast.com/hurls'
              target='_blank'
              rel='noreferrer'
            >
              <div className='h-8 w-8 relative'>
                <Image
                  src={dh}
                  alt='dh'
                  layout='fill'
                  className='rounded-full'
                />
              </div>
            </a>
          </div>
        </div>
        <Toaster />
        <Privy>{children}</Privy>
      </body>
    </html>
  );
};

export default RootLayout;
