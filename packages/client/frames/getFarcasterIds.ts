import { gql, request } from 'graphql-request';
import { Address, getAddress } from 'viem';

const FARCASTER_BATCH_SIZE = 50;

const AIRSTACK_GQL = 'https://api.airstack.xyz/gql';

const query = gql`
  query ResolveFarcaster($addresses: [Address!]) {
    Socials(
      input: {
        filter: {
          userAssociatedAddresses: { _in: $addresses }
          dappName: { _eq: farcaster }
        }
        blockchain: ethereum
      }
    ) {
      Social {
        profileName
        userAssociatedAddresses
      }
    }
  }
`;

const getBatches = <T>(arr: T[], batchSize: number): T[][] => {
  const numBatches = Math.ceil(arr.length / batchSize);
  const batches: T[][] = [];
  for (let i = 0; i < numBatches; i++) {
    const start = i * batchSize;
    const end = start + batchSize;
    const batch = arr.slice(start, end);
    batches.push(batch);
  }
  return batches;
};

const getFarcasterIds = async (addresses: Address[]) => {
  const batches = getBatches<Address>(addresses, FARCASTER_BATCH_SIZE);
  console.log(
    `[Get Farcaster Ids] updating farcaster ids for ${addresses.length} addresses in ${batches.length} batches`
  );

  const farcasterIds: Map<Address, string> = new Map();

  for (const batch of batches) {
    const response: {
      Socials?: {
        Social?: {
          profileName: string;
          userAssociatedAddresses: `0x${string}`[];
        }[];
      };
    } = await request(AIRSTACK_GQL, query, {
      addresses: batch,
    });

    if (!response.Socials?.Social) {
      console.log('[Get Farcaster Ids] no response.Socials?.Social', response);
      continue;
    }

    console.log(
      `[Get Farcaster Ids] got ${response.Socials.Social.length} farcaster ids`
    );

    for (const resolved of response.Socials.Social) {
      const { profileName, userAssociatedAddresses } = resolved;
      for (const address of userAssociatedAddresses) {
        farcasterIds.set(address, profileName);
      }
    }
  }

  return farcasterIds;
};

export default getFarcasterIds;
