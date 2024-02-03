'use client';

import chain from '@/mint/chain';
import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
if (!privyAppId) {
  throw new Error('[RootLayout] Missing NEXT_PUBLIC_PRIVY_APP_ID');
}

const Privy = ({ children }: { children: ReactNode }) => {
  return (
    <PrivyProvider
      appId={privyAppId as string}
      config={{
        defaultChain: chain,
        supportedChains: [chain],
        loginMethods: ['farcaster', 'wallet'],
      }}
    >
      {children}
    </PrivyProvider>
  );
};

export default Privy;
