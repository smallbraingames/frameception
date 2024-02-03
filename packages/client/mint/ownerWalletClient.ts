import { Hex, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import chain from './chain';

const ownerWalletPrivateKey = process.env.OWNER_WALLET_PRIVATE_KEY as
  | Hex
  | undefined;
if (!ownerWalletPrivateKey) {
  throw new Error('[OwnerWallet] OWNER_WALLET_PRIVATE_KEY is not set');
}
const privateKeyAccount = privateKeyToAccount(ownerWalletPrivateKey);

const ownerWalletClient = createWalletClient({
  account: privateKeyAccount,
  chain: chain,
  transport: http(),
});
export default ownerWalletClient;
