import getCollectionContract from './getCollectionContract';
import ownerWalletClient from './ownerWalletClient';
import publicClient from './publicClient';

const create = () => {
  const contract = getCollectionContract(publicClient, ownerWalletClient);
};

export default create;
