import { kv } from '@vercel/kv';
import Replicate from 'replicate';

import { getGenerationIdKey } from './generationKV';

export const generateNewImage = async (prompt: string) => {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });
  const prediction = await replicate.predictions.create({
    version: '53a8078c87ad900402a246bf5e724fa7538cf15c76b0a22753594af58850a0e3',
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
