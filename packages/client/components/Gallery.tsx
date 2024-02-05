'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { Address } from 'viem';

import { CollectionContext } from './CollectionProvider';
import ConnectButton from './ConnectButton';
import GalleryCard from './GalleryCard';
import Name from './Name';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const Gallery = () => {
  const { collection: info } = useContext(CollectionContext);

  console.log('[Gallery]: info', info);

  const { user, logout } = usePrivy();
  const address = user?.wallet?.address as Address | undefined;

  const createdTokenIds = [...info.entries()]
    .map(([id, tokenInfo]) => {
      if (tokenInfo.creator === address) {
        return id;
      }
    })
    .filter((id) => id !== undefined) as number[];

  const parseInfoMap = () => {
    const topHolders: { address: string; tokenCount: number }[] = [];
    const topCreators: { address: string; createdTokens: number }[] = [];

    info.forEach((tokenInfo) => {
      tokenInfo.holders.forEach((tokenCount, address) => {
        const existingHolderIndex = topHolders.findIndex(
          (holder) => holder.address === address
        );
        if (existingHolderIndex !== -1) {
          topHolders[existingHolderIndex].tokenCount += tokenCount;
        } else {
          topHolders.push({ address, tokenCount });
        }
      });

      const existingCreatorIndex = topCreators.findIndex(
        (creator) => creator.address === tokenInfo.creator
      );
      if (existingCreatorIndex !== -1) {
        topCreators[existingCreatorIndex].createdTokens += tokenInfo.supply;
      } else {
        topCreators.push({
          address: tokenInfo.creator,
          createdTokens: tokenInfo.supply,
        });
      }
    });

    topHolders.sort((a, b) => b.tokenCount - a.tokenCount);
    topCreators.sort((a, b) => b.createdTokens - a.createdTokens);

    return { topHolders, topCreators };
  };

  const { topHolders } = parseInfoMap();

  return (
    <div>
      <div className='flex flex-row justify-between my-8 items-center'>
        <div className='flex flex-row items-center gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Frameception</h1>
          </div>
          <div className='p-1 text-xs bg-blue-100 text-blue-500 rounded-sm mt-1'>
            Beta
          </div>
        </div>

        <div>
          {address ? (
            <div className='text-stone-900 rounded-lg'>
              {createdTokenIds.length > 0 && 'Tokens you created: '}
              {createdTokenIds.map((id) => {
                const link = `${NEXT_PUBLIC_URL}/frame/${id})`;

                return (
                  <span key={id}>
                    <button
                      className='border-b-2 border-gray-400 mx-1'
                      onClick={() => {
                        navigator.clipboard.writeText(link);
                        toast.success('Copied to clipboard');
                      }}
                    >
                      #{id}
                    </button>
                  </span>
                );
              })}{' '}
              (
              <button onClick={logout} className='border-b-2 border-gray-400'>
                change wallet
              </button>
              )
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10'>
        <div
          style={{ borderRadius: '20px' }}
          className=' bg-gray-200 rounded-sm text-stone-800 p-4 w-72 overflow-y-scroll max-h-96 mx-auto'
        >
          <h1 className='font-bold mb-4'>What is this?</h1>
          <p className='text-sm'>
            Frameception is a collaborative generative art collection. Each
            piece is made by a user on Farcaster within a Farcaster frame, and
            is also minted within a Farcaster frame.{' '}
          </p>
          <p className='tracking-widest pt-1 font-serif'>FRAMECEPTION</p>

          <h1 className='font-bold my-4'>Top Holders</h1>
          <div>
            {topHolders.map((holder, index) => (
              <div
                key={index}
                className='mb-2 transition-colors duration-300 flex justify-between border-b border-gray-300 pb-2 text-sm'
              >
                <div className=''>{index + 1}</div>
                <div>
                  <Name address={holder.address as Address} />{' '}
                </div>
                <div>{holder.tokenCount}</div>
              </div>
            ))}
          </div>
        </div>
        {[...info.entries()].map(([id, tokenInfo]) => (
          <GalleryCard key={id} id={id} tokenInfo={tokenInfo} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
