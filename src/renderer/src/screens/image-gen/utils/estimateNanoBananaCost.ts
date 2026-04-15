import type { NanoBananaThinkingLevel } from '../types';

type EstimateNanoBananaCostArgs = {
  model: string;
  resolution: string;
  numOutputs: number;
  webSearch: boolean;
  thinkingLevel: NanoBananaThinkingLevel;
};

export function estimateNanoBananaCost({
  model,
  resolution,
  numOutputs,
  webSearch,
  thinkingLevel,
}: EstimateNanoBananaCostArgs) {
  if (model === 'Seedream 4.5') return (0.04 * numOutputs).toFixed(3);

  let base = 0.08;
  if (resolution === '2K') base *= 1.5;
  if (resolution === '4K') base *= 2;
  if (resolution === '0.5K') base *= 0.75;

  if (webSearch) base += 0.015;
  if (thinkingLevel === 'high') base += 0.002;

  return (base * numOutputs).toFixed(3);
}
