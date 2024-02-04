'use client';

import { TokenInfo } from '@/indexing/getCollectionInfo';
import { useContext } from 'react';

import { CollectionContext } from './CollectionProvider';
import GalleryCard from './GalleryCard';

const Gallery = () => {
  const info: Map<number, TokenInfo> = useContext(CollectionContext);

  // Parse info map to get top holders and top creators
  const parseInfoMap = () => {
    const topHolders: { address: string; tokenCount: number }[] = [];
    const topCreators: { address: string; createdTokens: number }[] = [];

    info.forEach((tokenInfo, tokenId) => {
      // Parse top holders
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

      // Parse top creators
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

    // Sort top holders and top creators based on token count
    topHolders.sort((a, b) => b.tokenCount - a.tokenCount);
    topCreators.sort((a, b) => b.createdTokens - a.createdTokens);

    return { topHolders, topCreators };
  };

  const { topHolders, topCreators } = parseInfoMap();

  return (
    <div className='flex w-full gap-8'>
      <div className='w-fit bg-stone-900 rounded-sm text-stone-100 p-4'>
        <h1 className='font-bold text-xl mb-4'>Top Holders</h1>
        <ul>
          {topHolders.map((holder, index) => (
            <li
              key={index}
              className='mb-2 hover:text-gray-300 transition-colors duration-300'
            >
              {holder.address} - {holder.tokenCount} tokens
            </li>
          ))}
        </ul>
      </div>

      <div className='flex-1 grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 rounded-lg'>
        {[...info.entries()].map(([id, tokenInfo]) => (
          <GalleryCard key={id} id={id} tokenInfo={tokenInfo} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
