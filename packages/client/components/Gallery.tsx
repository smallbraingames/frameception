'use client';

import { useContext } from 'react';

import { CollectionContext } from './CollectionProvider';

const Gallery = () => {
  const info = useContext(CollectionContext);

  return (
    <div>
      {[...info.entries()].map(([id, tokenInfo]) => {
        return (
          <div key={id}>
            {JSON.stringify(tokenInfo)}
            {JSON.stringify([...tokenInfo.holders.entries()])}
          </div>
        );
      })}
    </div>
  );
};

export default Gallery;
