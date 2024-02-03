import { createPublicClient, http } from 'viem';

import chain from './chain';

const publicClient = createPublicClient({ chain: chain, transport: http() });
export default publicClient;
