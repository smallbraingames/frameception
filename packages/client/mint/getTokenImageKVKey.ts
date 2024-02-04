import chain from './chain';

const getTokenImageKVKey = (tokenId: number) => {
  return `token-image-${tokenId}-chain:${chain.id}`;
};

export default getTokenImageKVKey;
