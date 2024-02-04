'use client';

import ConnectButton from '@/components/ConnectButton';
import chain from '@/mint/chain';
import getTransactionReceipt from '@/mint/getTransactionReceipt';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { Address, createWalletClient, custom } from 'viem';
import { useSearchParams } from 'next/navigation'

const ownerPublicKey = process.env.NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY;
if (!ownerPublicKey) {
  throw new Error('[Create] Missing NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY');
}

const Create = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [supply, setSupply] = useState(1000);
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const [error, setError] = useState<string | null>(null);
  const address = user?.wallet?.address as Address | undefined;

  const getWalletClient = async () => {
    if (!address) {
      console.warn('[Create] No address found', user);
      return;
    }
    await wallets[0]?.switchChain(chain.id);
    const ethereumProvider = await wallets[0]?.getEthereumProvider();
    const walletClient = createWalletClient({
      account: address,
      chain: chain,
      transport: custom(ethereumProvider),
    });
    return walletClient;
  };

  const create = async (): Promise<number | undefined> => {
    // remove error message after each attempt
    setError(null);
    const walletClient = await getWalletClient();
    if (!walletClient) return;
    const hash = await walletClient.sendTransaction({
      to: ownerPublicKey as Address,
      value: BigInt(100000),
    });
    console.log('[Create] Transaction sent', hash);
    const receipt = await getTransactionReceipt(hash);
    if (receipt.status === 'reverted') {
      console.error('[Create] Transaction reverted', receipt);
      return;
    }
    console.log('[Create] Transaction confirmed', receipt);
    console.log('[Create] Transaction confirmed', url, supply);

    try {
      const res = await fetch('/api/registerPaymentAndCreateToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash, supply, url }),
      });
      const json = await res.json();
      const tokenId = json.id as number;
      console.log('[Create] Token created with tokenId', tokenId);
      return tokenId;
    } catch (e) {
      console.error('[Create] Failed to register payment and create token', e);
      // TODO @david: Important to surface an error to the user here, since they have paid...
      setError('Failed to register payment and create token');
    }
  };

  return (
    <div className='max-w-md mx-auto'>
      <ConnectButton />
      {
        url && (
          <div className='py-2'>
            <img src={url} className='w-full' />
          </div>
        )
      }
      <div className='py-2'>
        <label className='block text-stone-100 font-bold'>Supply</label>
      <div className='flex'>
        <button onClick={() => setSupply(100)} className={`  ${supply === 100 ? "bg-stone-900" : "bg-stone-800" } p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}>100</button>
        <button onClick={() => setSupply(1000)} className={`  ${supply === 1000 ? "bg-stone-900" : "bg-stone-800" } p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}>1,000</button>
        <button onClick={() => setSupply(10000)} className={`  ${supply === 10000 ? "bg-stone-900" : "bg-stone-800" } p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}>10,000</button>
      </div>
      </div>
      <div className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900'>
        <button onClick={create} type='button' className='h-full w-full'>
          Create Token
        </button>
      </div>
      {
        error && (
          <div className='text-red-500'>{error}</div>
        )
      }

    </div>
  );
};

export default Create;
