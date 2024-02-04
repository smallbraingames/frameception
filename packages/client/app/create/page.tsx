'use client';

import ConnectButton from '@/components/ConnectButton';
import chain from '@/mint/chain';
import create from '@/mint/create';
import { getReadCollectionContract } from '@/mint/getCollectionContract';
import publicClient from '@/mint/publicClient';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Address, createWalletClient, custom, formatEther } from 'viem';

const ownerPublicKey = process.env.NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY;
if (!ownerPublicKey) {
  throw new Error('[Create] Missing NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY');
}

const Create = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [supply, setSupply] = useState(1000);
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [error, setError] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [pricePerSupply, setPricePerSupply] = useState<bigint | null>(null);
  const address = user?.wallet?.address as Address | undefined;

  useEffect(() => {
    getReadCollectionContract(publicClient)
      .read.pricePerSupply()
      .then((p) => setPricePerSupply(p as bigint));
  }, []);

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

  const createToken = async (): Promise<number | undefined> => {
    setError(null);
    const walletClient = await getWalletClient();
    if (!walletClient) {
      console.error('[Create] No wallet client found');
      return;
    }

    // Check that the token ID can be set on the server before taking payment
    const nextTokenId =
      Number(await getReadCollectionContract(publicClient).read.lastId()) + 1;
    const checkRes = await fetch('/api/canSetTokenId', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: nextTokenId, url }),
    });
    const canSetTokenId = (await checkRes.json()).value as boolean;
    if (!canSetTokenId) {
      console.error('[Create] Invalid token ID or URL');
      setError('Invalid token ID or URL');
      return;
    }

    // Send transaction
    const receipt = await create(walletClient, supply);
    console.log('[Create] Transaction sent', receipt);
    if (receipt.status === 'reverted') {
      console.error('[Create] Transaction reverted', receipt);
      return;
    }

    // Set URL on server
    try {
      const res = await fetch('/api/setTokenImage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash: receipt.transactionHash, url }),
      });
      if (res.status !== 200) {
        throw Error((await res.json()).message);
      }
      const json = await res.json();
      const tokenId = json.id as number;
      console.log('[Create] Token created with tokenId', tokenId);
      setTokenId(tokenId);
      return tokenId;
    } catch (e) {
      console.error('[Create] Failed to register payment and create token', e);
      setError('Failed to register payment and create token');
    }
  };

  return (
    <div className='max-w-md mx-auto'>
      <ConnectButton />
      {url && (
        <div className='py-2'>
          <img src={url} className='w-full' />
        </div>
      )}

      {!tokenId && (
        <div>
          <div className='py-2'>
            <label className='block text-stone-100 font-bold'>Supply</label>
            <div className='flex'>
              <button
                onClick={() => setSupply(100)}
                className={`  ${supply === 100 ? 'bg-stone-900' : 'bg-stone-800'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}
              >
                100
              </button>
              <button
                onClick={() => setSupply(500)}
                className={`  ${supply === 500 ? 'bg-stone-900' : 'bg-stone-800'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}
              >
                500
              </button>
              <button
                onClick={() => setSupply(1000)}
                className={`  ${supply === 1000 ? 'bg-stone-900' : 'bg-stone-800'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900`}
              >
                1,000
              </button>
            </div>
          </div>
          <div className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900'>
            <button
              onClick={createToken}
              type='button'
              className='h-full w-full'
            >
              Get Frame Link (
              {pricePerSupply
                ? formatEther(BigInt(supply) * pricePerSupply)
                : '-'}{' '}
              ETH)
            </button>
          </div>
        </div>
      )}

      {error && <div className='text-red-500'>{error}</div>}
      {tokenId && (
        <div>
          <p>
            Your new frame link:{' '}
            {`${process.env.NEXT_PUBLIC_URL}/frame/${tokenId}`}{' '}
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_URL}/frame/${tokenId}`
              );
              toast.success('Copied to clipboard');
            }}
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
};

export default Create;
