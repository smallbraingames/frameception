'use client';

import ConnectButton from '@/components/ConnectButton';
import chain from '@/mint/chain';
import getTransactionReceipt from '@/mint/getTransactionReceipt';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Address, createWalletClient, custom } from 'viem';

const ownerPublicKey = process.env.NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY;
if (!ownerPublicKey) {
  throw new Error('[Create] Missing NEXT_PUBLIC_OWNER_WALLET_PUBLIC_KEY');
}

const Create = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const address = user?.wallet?.address as Address | undefined;

  const getWalletClient = async () => {
    if (!address) {
      console.warn('[Create] No address found', user);
      return;
    }
    await wallets[0]?.switchChain(chain.id);
    const ethereumProvider = await wallets[0]?.getEthereumProvider();
    const walletClient = createWalletClient({
      account: address,
      chain: chain,
      transport: custom(ethereumProvider),
    });
    return walletClient;
  };

  const create = async (): Promise<number | undefined> => {
    const walletClient = await getWalletClient();
    if (!walletClient) return;
    const hash = await walletClient.sendTransaction({
      to: ownerPublicKey as Address,
      value: BigInt(100000),
    });
    console.log('[Create] Transaction sent', hash);
    const receipt = await getTransactionReceipt(hash);
    if (receipt.status === 'reverted') {
      console.error('[Create] Transaction reverted', receipt);
      return;
    }
    console.log('[Create] Transaction confirmed', receipt);
    try {
      const res = await fetch('/api/registerPaymentAndCreateToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // TODO @david: fill in supply and url
        body: JSON.stringify({ hash, supply: 10, url: 'https://example.com' }),
      });
      const json = await res.json();
      const tokenId = json.id as number;
      console.log('[Create] Token created with tokenId', tokenId);
      return tokenId;
    } catch (e) {
      console.error('[Create] Failed to register payment and create token', e);
      // TODO @david: Important to surface an error to the user here, since they have paid...
    }
  };

  return (
    <div>
      <ConnectButton />

      <div className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900'>
        <button onClick={create} type='button' className='h-full w-full'>
          Create Token
        </button>
      </div>
    </div>
  );
};

export default Create;
