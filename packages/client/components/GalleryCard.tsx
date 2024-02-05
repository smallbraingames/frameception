import { TokenInfo } from '@/indexing/getCollectionInfo';
import logo from '@/public/logo.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Name from './Name';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL as string;

const GalleryCard = ({
  id,
  tokenInfo,
}: {
  id: number;
  tokenInfo: TokenInfo;
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const metadataUrl = `${NEXT_PUBLIC_URL}/api/token/${id}`;
    fetch(metadataUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.image && data.image.startsWith('http'))
          setImageUrl(data.image);
      });
  }, [id]);

  const firstHolder = tokenInfo.holders.keys().next().value;
  const holderCount = tokenInfo.holders.size;

  return (
    <div className=''>
      <div
        style={{ borderRadius: '20px' }}
        className='rounded-sm shadow-lg  transition-transform transform hover:scale-105 overflow-hidden relative max-w-72 bg-gray-200 max-h-96 mx-auto'
      >
        <div className='p-3 font-semibold flex justify-between text-sm'>
          <h1>#{id}</h1>
          <Name address={tokenInfo.creator} />
        </div>
        <div className='relative h-72 w-72'>
          <Image
            src={imageUrl ?? logo}
            alt={`Artwork ${id}`}
            layout='fill'
            className='object-cover w-full transition-opacity duration-300 ease-in-out rounded-sm'
          />
        </div>
        <div className='p-3'>
          <p className='text-xs text-gray-600'>
            Collected by <Name address={firstHolder} /> and {holderCount - 1}{' '}
            {holderCount - 1 === 1 ? 'other' : 'others'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
