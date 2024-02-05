import { gql, request } from 'graphql-request';
import { Address, getAddress } from 'viem';

const FARCASTER_BATCH_SIZE = 50;

const AIRSTACK_GQL = 'https://api.airstack.xyz/gql';

const addressQuery = gql`
  query ResolveFarcaster($addresses: [Address!]) {
    Socials(
      input: {
        filter: {
          _and: [
            { dappName: { _eq: farcaster } }
            { _or: [{ userAssociatedAddresses: { _in: $addresses } }] }
          ]
        }
        blockchain: ethereum
      }
    ) {
      Social {
        userId
        profileName
        userAddress
        userAssociatedAddresses
      }
    }
  }
`;

const fidQuery = gql`
  query ResolveFarcasterFid($fids: [String!]) {
    Socials(
      input: {
        filter: {
          _and: [
            { dappName: { _eq: farcaster } }
            { _or: [{ userId: { _in: $fids } }] }
          ]
        }
        blockchain: ethereum
      }
    ) {
      Social {
        userId
        profileName
        userAddress
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

const getFarcasterNames = async (addresses: Address[]) => {
  const getFidsForAddresses = async (addresses: Address[]) => {
    const response = await fetch('/api/fid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses }),
    });
    const { fids } = (await response.json()) as { fids: number[] };
    return fids;
  };


  const fids = await getFidsForAddresses(addresses);
  console.log("got fids", fids);
  const fidAddress = new Map(fids.map((fid, index) => [fid, addresses[index]]));
  const fidBatches = getBatches(
    fids.filter((fid) => fid !== -1),
    FARCASTER_BATCH_SIZE
  );

  const farcasterNames: Map<Address, string> = new Map();

  for (const batch of fidBatches) {
    const response: {
      Socials?: {
        Social?: {
          profileName: string;
          userId: string;
          userAddress: Address;
        }[];
      };
    } = await request(AIRSTACK_GQL, fidQuery, {
      fids: batch.map((fid) => fid.toString()),
    });
    if (!response.Socials?.Social) {
      console.log('[Get Farcaster Ids] no response.Socials?.Social', response);
      continue;
    }
    for (const resolved of response.Socials.Social) {

      console.log("resolved", resolved);
      const { profileName, userId } = resolved;
      console.log('uer id', userId, parseInt(userId));
      const address = fidAddress.get(parseInt(userId));
      console.log("got address", address, fidAddress);
      if (address) {
        farcasterNames.set(getAddress(address), profileName);
      }
      farcasterNames.set(getAddress(resolved.userAddress), profileName);
    }
  }

  const batches = getBatches<Address>(addresses, FARCASTER_BATCH_SIZE);

  console.log(
    `[Get Farcaster Ids] updating farcaster ids for ${addresses.length} addresses in ${batches.length} batches`
  );

  for (const batch of batches) {
    const response: {
      Socials?: {
        Social?: {
          profileName: string;
          userAssociatedAddresses: `0x${string}`[];
          userAddress: `0x${string}`;
        }[];
      };
    } = await request(AIRSTACK_GQL, addressQuery, {
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
        farcasterNames.set(getAddress(address), profileName);
      }
      farcasterNames.set(getAddress(resolved.userAddress), profileName);
    }
  }

  return farcasterNames;
};

export default getFarcasterNames;
