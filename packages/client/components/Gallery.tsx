'use client';

import { useContext } from 'react';
import { Address } from 'viem';

import { CollectionContext } from './CollectionProvider';
import GalleryCard from './GalleryCard';
import Name from './Name';

const Gallery = () => {
  const { collection: info } = useContext(CollectionContext);

  console.log('[Gallery]: info', info);

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
    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10'>
      <div
        style={{ borderRadius: '20px' }}
        className=' bg-gray-200 rounded-sm text-stone-800 p-4 w-72 overflow-y-scroll max-h-96 mx-auto'
      >
        <h1 className='font-bold mb-4'>Collected by</h1>
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
  );
};

export default Gallery;
