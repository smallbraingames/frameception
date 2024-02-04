'use client';

import getFarcasterNames from '@/frames/getFarcasterNames';
import getCollectionInfo, { TokenInfo } from '@/indexing/getCollectionInfo';
import { ReactNode, createContext, useEffect, useState } from 'react';
import { Address } from 'viem';

export const CollectionContext = createContext<{
  collection: Map<number, TokenInfo>;
  farcaster: Map<Address, string>;
}>({
  collection: new Map(),
  farcaster: new Map(),
});

const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<Map<number, TokenInfo>>(new Map());
  const [farcaster, setFarcaster] = useState<Map<Address, string>>(new Map());
  useEffect(() => {
    getCollectionInfo().then((info) => {
      setInfo(info);
    });
  }, []);

  useEffect(() => {
    // get all creator and holder addresses
    const addresses = new Set<Address>();
    info.forEach((tokenInfo) => {
      addresses.add(tokenInfo.creator);
      tokenInfo.holders.forEach((_, holder) => {
        addresses.add(holder);
      });
    });
    getFarcasterNames(Array.from(addresses)).then((farcasterNames) => {
      setFarcaster(farcasterNames);
    });
  }, [info]);

  return (
    <CollectionContext.Provider value={{ collection: info, farcaster }}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;
