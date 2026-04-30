export type ActiveVideoGenMode = 'templates' | 'manual';

export interface VideoModel {
  id: string;
  label: string;
  endpoint: string;
  pricePerSec: {
    noAudio: number;
    withAudio: number;
  };
  maxDur: number;
  supportedDurations: number[];
  supportsAudio: boolean;
  desc: string;
  purpose: 'testing' | 'production' | 'quality' | 'speed' | 'style';
  badge?: string;
  fixedDuration: number | null;
  fixedDurationNote?: string;
}

export interface VideoTemplate {
  id: string;
  label: string;
  prompt: string;
  coverImage: string; // URL to thumbnail
  previewVideo?: string; // URL to template preview video definition
  recommendedModelId: string;
  recommendedDuration: number;
}
