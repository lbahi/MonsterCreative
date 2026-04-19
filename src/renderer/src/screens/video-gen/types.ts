export type ActiveVideoGenMode = 'templates' | 'manual';

export interface VideoModel {
  id: string;
  label: string;
  endpoint: string;
  pricePerSec: number;
  maxDur: number;
  supportsAudio: boolean;
  desc: string;
  badge?: string;
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
