import { SOCIAL_TEMPLATES } from './data/social-templates';

export type Template = typeof SOCIAL_TEMPLATES[0];

export type SocialAdsFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
  resolution: string;
  model: string;
  setModel: (val: string) => void;
};
