import { useState, useEffect } from 'react';
import { SOCIAL_LANGUAGES } from '../data/social-templates';
import type { Template, SocialAdsFormProps } from '../types';
import { resolveImageInput } from '../../../utils/resolveImageInput';

export const useSocialAds = (props: SocialAdsFormProps) => {
  const {
    setGenerating, setGeneratedImages, setGenerated,
    refImage, setRefImage, model
  } = props;

  const [dragging, setDragging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedResolution, setSelectedResolution] = useState('1K');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [progressMsg, setProgressMsg] = useState('');
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const clearImage = (e: React.MouseEvent) => { e.stopPropagation(); setRefImage(null); setSavedPath(null); };

  const generateSocialAd = async (templateOverride?: Template) => {
    if (!refImage) { alert('Please upload a product image first.'); return; }
    const activeTemplate = templateOverride ?? selectedTemplate;
    if (!activeTemplate) { alert('Please select a template design first.'); return; }

    setSavedPath(null);
    setSaveError(null);

    try {
      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);
      setProgressMsg('Uploading product image...');

      const uploadedProduct = await resolveImageInput(refImage, 'Product');
      if (!uploadedProduct) throw new Error('Product upload failed');

      const langDirective = selectedLanguage === 'english'
        ? 'All text in the poster must be written in English.'
        : selectedLanguage === 'arabic'
          ? 'All text in the poster must be written in Arabic (عربي). Use Arabic script for every headline, tagline, and call-to-action.'
          : 'All text in the poster must be written in French (Français). Use French for every headline, tagline, and call-to-action.';
      const posterDirective = 'This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy, bold visual impact, and eye-catching composition.';
      const ratioDirective = `Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}.`;
      const basePrompt = activeTemplate.prompt.replace('{{ASPECT_RATIO}}', selectedRatio);
      const finalPrompt = `${basePrompt} ${posterDirective} ${ratioDirective} ${langDirective}`;

      setProgressMsg(`Generating with ${model}...`);

      const result = await (window as any).api.fal.nanoBananaEdit({
        model,
        prompt: finalPrompt,
        image_urls: [uploadedProduct],
        resolution: selectedResolution,
        aspect_ratio: selectedRatio,
        num_images: 1,
        output_format: 'jpeg',
      });

      if (!result?.images?.length) throw new Error('No image returned from model');
      const imageUrl = result.images[0].url;

      setGeneratedImages([imageUrl]);
      setGenerated(true);

      setProgressMsg('Saving to OutputSocialAds...');
      const filename = `SocialAd_${activeTemplate.id}_${selectedRatio.replace(':', 'x')}_${Date.now()}.jpg`;
      const saveResult = await (window as any).api.social.saveAdImage({ imageUrl, filename });

      if (saveResult.success) {
        setSavedPath(saveResult.localUrl);
      } else {
        setSaveError(saveResult.error);
      }

    } catch (err: any) {
      console.error(err);
      alert(`Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  const openOutputFolder = () => (window as any).api.social.openOutputFolder();

  const handleLightboxGenerate = () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate);
      const tpl = previewTemplate;
      setPreviewTemplate(null);
      generateSocialAd(tpl);
    }
  };

  useEffect(() => {
    if (!previewTemplate) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewTemplate(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewTemplate]);

  const buildPromptPreview = (t: Template) => {
    const langText = selectedLanguage === 'english'
      ? 'All text in the poster must be written in English.'
      : selectedLanguage === 'arabic'
        ? 'All text in the poster must be written in Arabic (عربي).'
        : 'All text in the poster must be written in French (Français).';
    return `${t.prompt} This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy. Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}. ${langText}`;
  };

  return {
    dragging, setDragging,
    selectedTemplate, setSelectedTemplate,
    previewTemplate, setPreviewTemplate,
    selectedRatio, setSelectedRatio,
    selectedResolution, setSelectedResolution,
    selectedLanguage, setSelectedLanguage,
    progressMsg, setProgressMsg,
    savedPath, setSavedPath,
    saveError, setSaveError,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    processFile,
    clearImage,
    generateSocialAd,
    handleLightboxGenerate,
    openOutputFolder,
    buildPromptPreview
  };
};
