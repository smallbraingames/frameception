export const getGenerationIdKey = (prompt: string) =>
  `generation-${prompt.replace(' ', '_')}`;

export const getGenerationResultKey = (prompt: string) =>
  `generationresult-${prompt.replace(' ', '_')}`;
