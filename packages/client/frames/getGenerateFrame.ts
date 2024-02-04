import { getFrameHtmlResponse } from '@coinbase/onchainkit';

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
if (!NEXT_PUBLIC_URL) {
  throw new Error('[Get Generate Frame] NEXT_PUBLIC_URL is not defined');
}

const getGenerateFrame = (url: string) => {
  return getFrameHtmlResponse({
    buttons: [
      {
        label: 'Refresh',
      },
      {
        label: 'Get Frame Minter URL',
        action: 'post_redirect',
      },
    ],
    input: {
      text: 'Write a new prompt, leave blank to refresh the previous prompt',
    },
    image: url ?? '',
    post_url: `${NEXT_PUBLIC_URL}/api/generate`,
  });
};

export default getGenerateFrame;
