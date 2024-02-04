import { kv } from '@vercel/kv';
import Replicate from 'replicate';

import { generateNewImage } from './generateNewImage';
import { getGenerationIdKey, getGenerationResultKey } from './generationKV';

const NUM_TRIES = 3;

const replicateApiToken = process.env.REPLICATE_API_TOKEN;
if (!replicateApiToken) {
  throw new Error('[Get Image Url] REPLICATE_API token is required');
}

const getImageUrl = async (prompt: string): Promise<string | undefined> => {
  const idKey = getGenerationIdKey(prompt);
  let generationId = await kv.get<string>(idKey);

  if (!generationId) {
    generationId = await generateNewImage(prompt);
  }

  console.log('[Get Image URL] Getting image url', prompt, generationId, idKey);

  for (let i = 0; i < NUM_TRIES; i++) {
    try {
      const generationResultKey = getGenerationResultKey(prompt);
      const generationResult = await kv.get<string>(generationResultKey);
      if (generationResult) {
        return generationResult;
      }
      const replicate = new Replicate({
        auth: replicateApiToken,
      });
      const prediction = await replicate.predictions.get(generationId);
      const result = await replicate.wait(prediction);
      const output = result.output[0];
      if (!output) {
        throw Error('Error getting url');
      }
      await kv.set(generationResultKey, output);
      return output;
    } catch (e) {
      console.log('Error generating image, trying again', i, e);
      await generateNewImage(prompt);
    }
  }
};

export default getImageUrl;
