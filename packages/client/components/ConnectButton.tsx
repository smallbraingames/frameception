import { usePrivy } from '@privy-io/react-auth';
import { Address } from 'viem';

const ConnectButton = () => {
  const { ready, authenticated, user, login } = usePrivy();

  const connected = ready && authenticated && user;

  const address = user?.wallet?.address as Address;

  return (
    <div
      className='w-full rounded-sm bg-stone-800 p-2 text-center font-bold text-stone-100 hover:bg-stone-900'
      {...(!ready && {
        'aria-hidden': true,
        style: {
          opacity: 0,
          pointerEvents: 'none',
          userSelect: 'none',
        },
      })}
    >
      {!connected ? (
        <button onClick={login} type='button' className='h-full w-full'>
          Connect Wallet
        </button>
      ) : (
        <div>{address}</div>
      )}
    </div>
  );
};

export default ConnectButton;
