import { NB_TEMPLATES } from '../constants';

type BuildNanoBananaPromptArgs = {
  model: string;
  prompt: string;
  style: string;
  resolution: string;
  aspectRatio: string;
  numImages: number;
  outputFormat: string;
};

export function buildNanoBananaPrompt({
  model,
  prompt,
  style,
  resolution,
  aspectRatio,
  numImages,
  outputFormat,
}: BuildNanoBananaPromptArgs) {
  const template = NB_TEMPLATES[model as keyof typeof NB_TEMPLATES] || NB_TEMPLATES['Nano Banana 2'];

  return template
    .replace('{{USER_PROMPT}}', prompt)
    .replace('{{STYLE}}', style)
    .replace('{{RESOLUTION}}', resolution)
    .replace('{{ASPECT_RATIO}}', aspectRatio)
    .replace('{{NUM_IMAGES}}', numImages.toString())
    .replace('{{OUTPUT_FORMAT}}', outputFormat)
    .replace('{{QUALITY_HINT}}', resolution === '4K' ? 'Ultra HD' : resolution === '2K' ? 'High Detail' : 'Standard')
    .replace('{{STRICTNESS}}', 'strict');
}
