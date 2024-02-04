// Adapted from https://github.com/privy-io/privy-frames-demo/blob/main/lib/farcaster.ts
import { FrameRequest } from '@coinbase/onchainkit';
import { Message, getSSLHubRpcClient } from '@farcaster/hub-nodejs';

const HUB_URL = 'nemes.farcaster.xyz:2283';

const validateFrameRequest = async (request: FrameRequest) => {
  const hub = getSSLHubRpcClient(HUB_URL);
  let fid: number | undefined;
  let isValid: boolean = true;

  try {
    const decodedMessage = Message.decode(
      Buffer.from(request.trustedData.messageBytes, 'hex')
    );
    const result = await hub.validateMessage(decodedMessage);
    if (!result.isOk() || !result.value.valid || !result.value.message) {
      isValid = false;
    } else {
      fid = result.value.message.data?.fid;
    }
  } catch (error) {
    console.error(error);
  }

  return { fid: fid, isValid: isValid };
};

export default validateFrameRequest;
