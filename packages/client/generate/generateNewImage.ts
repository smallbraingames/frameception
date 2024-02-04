import { kv } from '@vercel/kv';
import Replicate from 'replicate';

import { getGenerationIdKey } from './generationKV';

export const generateNewImage = async (prompt: string) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
  const prediction = await replicate.predictions.create({
    version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
    input: {
      prompt,
    },
  });
  const key = getGenerationIdKey(prompt);
  await kv.set(key, prediction.id);
  console.log(
    '[Generate New Image] Kicked off prediction job',
    key,
    prediction.id
  );
  await replicate.wait(prediction);
  return prediction.id;
};
