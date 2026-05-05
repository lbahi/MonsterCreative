export type VtonFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  model: string;
  setModel: (val: string) => void;
  numImages: number;
  setNumImages: (val: number) => void;
  resolution: string;
  setResolution: (val: string) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
};

export type ModelTemplate = {
  id: string;
  label: string;
  gender: 'male' | 'female';
  ageRange: string;
  ageMin: number;
  ageMax: number;
  promptFragment: string;
  thumbnail: string;
  color: string;
};

export type GarmentSlot = {
  id: number;
  label: string;
  image: string | null;
};
