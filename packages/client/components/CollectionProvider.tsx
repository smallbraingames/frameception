'use client';

import getCollectionInfo, { TokenInfo } from '@/indexing/getCollectionInfo';
import { ReactNode, createContext, useEffect, useState } from 'react';

export const CollectionContext = createContext<Map<number, TokenInfo>>(
  new Map()
);

const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<Map<number, TokenInfo>>(new Map());
  useEffect(() => {
    getCollectionInfo().then((info) => {
      setInfo(info);
    });
  }, []);

  return (
    <CollectionContext.Provider value={info}>
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionProvider;
