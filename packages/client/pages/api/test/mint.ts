import create from '@/mint/create';
import mint from '@/mint/mint';
import ownerWalletClient from '@/mint/ownerWalletClient';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await mint(ownerWalletClient.account.address, 1);
  res.status(200).json({ message: 'Created' });
};

export default handler;
