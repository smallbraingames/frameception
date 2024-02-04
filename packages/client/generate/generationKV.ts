export const getGenerationIdKey = (prompt: string) =>
  `generation-${prompt.replaceAll(' ', '_')}`;

export const getGenerationResultKey = (prompt: string) =>
  `generationresult-${prompt.replaceAll(' ', '_')}`;
