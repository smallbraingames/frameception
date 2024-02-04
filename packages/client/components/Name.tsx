import { useContext } from 'react';
import { Address, getAddress } from 'viem';

import { CollectionContext } from './CollectionProvider';

const Name = ({ address }: { address: Address }) => {
  const { farcaster } = useContext(CollectionContext);
  const farcasterName = farcaster.get(getAddress(address));

  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (farcasterName) {
    return (
      <span>
        <a
          href={`https://warpcast.com/${farcasterName}`}
          target='_blank'
          rel='noreferrer'
        >
          <span className='text-purple-500'>@{farcasterName}</span>
        </a>
      </span>
    );
  }
  return <span>{formatAddress(address)}</span>;
};

export default Name;
