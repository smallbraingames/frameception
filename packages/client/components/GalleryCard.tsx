import { TokenInfo } from '@/indexing/getCollectionInfo';
import logo from '@/public/logo.png';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Address } from 'viem';

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

  const truncateHolderList = (
    holders: Map<Address, number>,
    maxLength: number
  ) => {
    const truncatedList = Array.from(holders.keys()).slice(0, maxLength);
    return truncatedList.join(', ') + (holders.size > maxLength ? ', ...' : '');
  };

  return (
    <div className='w-full flex items-end justify-end'>
      <div className='rounded-sm shadow-lg bg-white transition-transform transform hover:scale-105 w-72 overflow-hidden'>
        <div className='relative h-72 w-72'>
          <Image
            src={imageUrl ?? logo}
            alt={`Artwork ${id}`}
            layout='fill'
            className='object-cover w-full transition-opacity duration-300 ease-in-out rounded-sm'
          />
        </div>
        <div className='p-4'>
          <div className='mb-2 text-sm font-semibold text-gray-600'>
            Token #{id}
          </div>
          <div className='mb-2 text-xs text-gray-500'>
            <span className='font-semibold'>Creator:</span> {tokenInfo.creator}
          </div>
          <div className='mb-4 text-xs text-gray-500'>
            <span className='font-semibold'>Holders:</span>{' '}
            {truncateHolderList(tokenInfo.holders, 3)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryCard;
