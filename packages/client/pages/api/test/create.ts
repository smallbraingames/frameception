import create from '@/mint/create';
import ownerWalletClient from '@/mint/ownerWalletClient';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await create(ownerWalletClient.account.address, 10);
  res.status(200).json({ message: 'Created' });
};

export default handler;
