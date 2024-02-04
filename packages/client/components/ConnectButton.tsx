import { usePrivy } from '@privy-io/react-auth';

const ConnectButton = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const connected = ready && authenticated && user;

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
        <div className='flex flex-col gap-2'>
          <button className='w-full' onClick={logout}>
            Change wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;
