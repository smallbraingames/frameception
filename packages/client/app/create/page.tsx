'use client';

import ConnectButton from '@/components/ConnectButton';
import chain from '@/mint/chain';
import create from '@/mint/create';
import { getReadCollectionContract } from '@/mint/getCollectionContract';
import publicClient from '@/mint/publicClient';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Address, createWalletClient, custom, formatEther } from 'viem';

const ownerPublicKey = process.env.NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY;
if (!ownerPublicKey) {
  throw new Error('[Create] Missing NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY');
}

const Create = () => {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [supply, setSupply] = useState(100);
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [error, setError] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [pricePerSupply, setPricePerSupply] = useState<bigint | null>(null);
  const address = user?.wallet?.address as Address | undefined;
  const [isCreating, setIsCreating] = useState(false);

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
    setIsCreating(true);
    const walletClient = await getWalletClient();
    if (!walletClient) {
      console.error('[Create] No wallet client found');
      setIsCreating(false);
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
      setIsCreating(false);
      return;
    }

    // Send transaction
    const receipt = await create(walletClient, supply);
    console.log('[Create] Transaction sent', receipt);
    if (receipt.status === 'reverted') {
      console.error('[Create] Transaction reverted', receipt);
      setIsCreating(false);
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
      setIsCreating(false);
    }
  };

  const formatAddress = (address: `0x${string}` | undefined) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  const cost = `${pricePerSupply ? formatEther(BigInt(supply) * pricePerSupply) : '-'} ETH`;

  return (
    <div className='max-w-sm mx-auto pt-10'>
      {user ? (
        <div className='flex flex-col gap-2 text-xs'>
          <p>
            You&apos;re connected as {formatAddress(address)} (
            <button onClick={logout} className='border-b-2 border-gray-400'>
              change wallet
            </button>
            ).{' '}
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          <p className='text-sm'>
            Today is the day you have the opportunity to create a frame within a
            frame. Your frame will let others mint this image and after, they&apos;ll
            have the option to create their own.
          </p>
          {url && <img src={url} className='w-full ' />}

          {!tokenId && <ConnectButton />}
        </div>
      )}

      {url && user && (
        <div className='py-4'>
          <img src={url} className='w-full ' />
        </div>
      )}

      {!tokenId && user && (
        <div>
          <div className=''>
            <p className='text-sm pb-2'>
              How many NFTs would you like to distribute using your frame link?
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setSupply(100)}
                className={`${supply === 100 ? 'bg-stone-900' : 'bg-stone-500'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900 w-full`}
              >
                100
              </button>
              <button
                onClick={() => setSupply(500)}
                className={`${supply === 500 ? 'bg-stone-900' : 'bg-stone-500'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900 w-full`}
              >
                500
              </button>
              <button
                onClick={() => setSupply(1000)}
                className={`${supply === 1000 ? 'bg-stone-900' : 'bg-stone-500'} p-2 text-center font-bold text-stone-100 hover:bg-stone-900 w-full`}
              >
                1,000
              </button>
            </div>
          </div>

          <button
            onClick={createToken}
            type='button'
            className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900 mt-2'
          >
            {isCreating ? 'Creating Link ...' : `Get Frame Link (${cost})`}
          </button>

          <p className='py-2 text-xs'>
            The first {supply} collectors will mint for free. We&apos;ll use some of
            the {cost} to pay for gas.
          </p>
        </div>
      )}
      {error && <div className='text-red-500'>{error}</div>}
      {tokenId && (
        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <p className='text-sm'>Your link purchase was successfull! </p>
            <Image alt='hearts gif' height='20' width='20' src='/hearts.gif' />
          </div>

          <button
            className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900'
            onClick={() => {
              navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_URL}/frame/${tokenId}`
              );
              toast.success('Copied to clipboard');
            }}
          >
            Copy Your Frame Link
          </button>
          <p className='text-xs'>
            Copy and cast your frame link on{' '}
            <Link
              className='border-b-2 border-gray-400'
              href='https://warpcast.com'
              target='_blank'
            >
              Warpcast
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default Create;
