import Privy from '@/components/Privy';
import type { Metadata } from 'next';

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
      <body>
        {' '}
        <Privy>{children}</Privy>
      </body>
    </html>
  );
};

export default RootLayout;
