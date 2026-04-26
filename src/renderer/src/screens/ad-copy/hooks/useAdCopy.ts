import { useState } from 'react';
import { anthropicService, ProductAnalysis, OneShotResult } from '../../../services/anthropic.service';
import { CopyVariant } from '../../../services/fal.service';

export const useAdCopy = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisModel, setAnalysisModel] = useState('google/gemini-2.5-flash');
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ProductAnalysis | null>(null);
  const [generatedVariants, setGeneratedVariants] = useState<CopyVariant[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const maxSize = 1024;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = (height / width) * maxSize; width = maxSize; }
            else { width = (width / height) * maxSize; height = maxSize; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setGenerationError(null);
    setShowResults(false);

    try {
      const dataUrl = await compressImage(file);
      setProductImageUrl(dataUrl);

      const result: OneShotResult = await anthropicService.generatePlanFromImage(dataUrl, analysisModel);
      setAiAnalysis(result.analysis);
      setGeneratedVariants(result.variants);
      setShowResults(true);
    } catch (err: any) {
      setGenerationError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartOver = () => {
    setShowResults(false);
    setGeneratedVariants([]);
    setGenerationError(null);
    setAiAnalysis(null);
    setProductImageUrl(null);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return {
    isGenerating, setIsGenerating,
    analysisModel, setAnalysisModel,
    productImageUrl, setProductImageUrl,
    aiAnalysis, setAiAnalysis,
    generatedVariants, setGeneratedVariants,
    generationError, setGenerationError,
    showResults, setShowResults,
    modelDropdownOpen, setModelDropdownOpen,
    copiedIndex, setCopiedIndex,
    compressImage,
    handleImageUpload,
    handleStartOver,
    copyToClipboard
  };
};
