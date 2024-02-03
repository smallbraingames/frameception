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
    const walletClient = await createWalletClient({
      account: address,
      chain: chain,
      transport: custom(ethereumProvider),
    });
    return walletClient;
  };

  const create = async () => {
    const walletClient = await getWalletClient();
    if (!walletClient) return;
    const hash = await walletClient.sendTransaction({
      to: ownerPublicKey as Address,
      value: BigInt(100000),
    });
    const receipt = await getTransactionReceipt(hash);
    const res = await fetch('/api/registerPaymentAndCreateToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hash, supply: 10 }),
    });
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
