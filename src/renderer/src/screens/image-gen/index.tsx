import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Wand2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { useApp } from '../../contexts/AppContext';
import { falService } from '../../services/fal.service';
import { IMG_STEPS, MODEL_FALLBACK_PRICES, MODES, SAMPLE_OUTPUTS } from './constants';
import { useImageGenPricing } from './hooks/useImageGenPricing';
import { LandingForm } from './modes/LandingForm';
import { NanoBananaLayout } from './modes/NanoBananaLayout';
import { ResizeForm } from './modes/ResizeForm';
import { VtonForm } from './modes/VtonForm';
import { ImageGenRightPanel } from './panels/ImageGenRightPanel';
import { NanoBananaRightPanel } from './panels/NanoBananaRightPanel';
import { CommonSettings } from './shared/CommonSettings';
import { ImageGenHeader } from './shared/ImageGenHeader';
import { ModeSelector } from './shared/ModeSelector';
import { OutputGrid } from './shared/OutputGrid';
import { PromptTips } from './shared/PromptTips';
import type { ActiveImageGenMode, NanoBananaThinkingLevel } from './types';
import { buildNanoBananaPrompt } from './utils/buildNanoBananaPrompt';
import { estimateNanoBananaCost } from './utils/estimateNanoBananaCost';
import { resolveImageInput } from './utils/resolveImageInput';

function getActiveMode(pathname: string): ActiveImageGenMode {
  if (pathname.includes('vton')) return 'vton';
  if (pathname.includes('resize')) return 'resize';
  if (pathname.includes('landing')) return 'landing';
  return 'generate';
}

export function ImageGenScreen() {
  const { setRightPanelContent } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const activeMode = getActiveMode(location.pathname);
  const { modelPrices } = useImageGenPricing();

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [ratio, setRatio] = useState('1:1');
  const [model, setModel] = useState('FLUX.1 Pro');
  const [numImages, setNumImages] = useState(4);

  const [nbReferenceImage, setNbReferenceImage] = useState<string | null>(null);
  const [nbAssetImage, setNbAssetImage] = useState<string | null>(null);
  const [nbAdvancedOpen, setNbAdvancedOpen] = useState(false);
  const [nbRatio, setNbRatio] = useState('auto');
  const [nbResolution, setNbResolution] = useState('1K');
  const [nbOutputFormat, setNbOutputFormat] = useState('jpeg');
  const [nbNumOutputs, setNbNumOutputs] = useState(1);
  const [nbSeed, setNbSeed] = useState('');
  const [nbSafety, setNbSafety] = useState(3);
  const [nbWebSearch, setNbWebSearch] = useState(false);
  const [nbThinkingLevel, setNbThinkingLevel] = useState<NanoBananaThinkingLevel>('minimal');
  const [nbModel, setNbModel] = useState('Nano Banana 2');
  const [nbLimitGen, setNbLimitGen] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleStepsComplete = useCallback(() => {
    setGenerating(false);
    setGenerated(true);
    setSelectedOutput(0);
  }, []);

  const handleModeChange = useCallback(
    (mode: (typeof MODES)[number]) => {
      navigate(mode.path);
    },
    [navigate],
  );

  const costPerImage = modelPrices[model] ?? MODEL_FALLBACK_PRICES[model] ?? 0.024;
  const totalCost = (costPerImage * numImages).toFixed(3);
  const nbEstimatedCost = useMemo(
    () =>
      estimateNanoBananaCost({
        model: nbModel,
        resolution: nbResolution,
        numOutputs: nbNumOutputs,
        webSearch: nbWebSearch,
        thinkingLevel: nbThinkingLevel,
      }),
    [nbModel, nbResolution, nbNumOutputs, nbWebSearch, nbThinkingLevel],
  );

  const handleGenerate = useCallback(async () => {
    if (activeMode === 'generate') {
      try {
        setGenerating(true);
        setGenerated(false);
        setGeneratedImages([]);

        const uploadedUrls = (
          await Promise.all([
            resolveImageInput(nbReferenceImage, 'Reference'),
            resolveImageInput(nbAssetImage, 'Asset'),
          ])
        ).filter(Boolean) as string[];

        const finalPrompt = buildNanoBananaPrompt({
          model: nbModel,
          prompt,
          style,
          resolution: nbResolution,
          aspectRatio: nbRatio,
          numImages: nbNumOutputs,
          outputFormat: nbOutputFormat,
        });

        console.log('Final Orchestrated Prompt:', finalPrompt);

        const result = await falService.nanoBananaEdit({
          model: nbModel,
          prompt: finalPrompt,
          image_urls: uploadedUrls,
          resolution: nbResolution,
          aspect_ratio: nbRatio,
          num_images: nbNumOutputs,
          seed: nbSeed,
          output_format: nbOutputFormat,
          safety_tolerance: nbSafety.toString(),
          thinking_level: nbThinkingLevel,
          enable_web_search: nbWebSearch,
          limit_generations: nbLimitGen,
        });

        if (!result.images || result.images.length === 0) {
          throw new Error('No images returned from API');
        }

        setGeneratedImages(result.images.map((image) => image.url));
        setGenerated(true);
        setSelectedOutput(0);
      } catch (error: any) {
        console.error('Generation Error:', error);
        alert(`Generation failed: ${error.message}`);
      } finally {
        setGenerating(false);
      }
      return;
    }

    setGenerating(true);
    setGenerated(false);
  }, [
    activeMode,
    nbReferenceImage,
    nbAssetImage,
    nbModel,
    prompt,
    style,
    nbResolution,
    nbRatio,
    nbNumOutputs,
    nbOutputFormat,
    nbSeed,
    nbSafety,
    nbThinkingLevel,
    nbWebSearch,
    nbLimitGen,
  ]);

  const getGenerateButtonText = useCallback(() => {
    if (activeMode === 'vton') return `Virtual Try-On (${numImages} Images)`;
    if (activeMode === 'resize') return 'Resize All Formats';
    if (activeMode === 'landing') return 'Generate Page Concept';
    return `Generate ${numImages} Images`;
  }, [activeMode, numImages]);

  const getGeneratingText = useCallback(() => {
    if (activeMode === 'vton') return 'Casting AI & Fitting...';
    if (activeMode === 'resize') return 'Resizing Formats...';
    if (activeMode === 'landing') return 'Designing Hero Layout...';
    return `Generating ${numImages} images...`;
  }, [activeMode, numImages]);

  useEffect(() => {
    if (activeMode === 'generate') {
      setRightPanelContent(
        <NanoBananaRightPanel
          generating={generating}
          generated={generated}
          ratio={nbRatio}
          resolution={nbResolution}
          numOutputs={nbNumOutputs}
          safety={nbSafety}
          search={nbWebSearch}
          estimatedCost={nbEstimatedCost}
          nbModel={nbModel}
          outputs={generatedImages}
          selectedOutput={selectedOutput}
          setSelectedOutput={setSelectedOutput}
          refImage={nbReferenceImage}
        />,
      );
    } else {
      setRightPanelContent(
        <ImageGenRightPanel
          generating={generating}
          generated={generated}
          steps={IMG_STEPS}
          onStepsComplete={handleStepsComplete}
          selectedOutput={selectedOutput}
          setSelectedOutput={setSelectedOutput}
          outputs={SAMPLE_OUTPUTS}
          model={model}
          ratio={ratio}
          style={style}
          numImages={numImages}
        />,
      );
    }

    return () => setRightPanelContent(null);
  }, [
    activeMode,
    generated,
    generatedImages,
    generating,
    handleStepsComplete,
    model,
    nbEstimatedCost,
    nbModel,
    nbNumOutputs,
    nbRatio,
    nbResolution,
    nbSafety,
    nbWebSearch,
    numImages,
    ratio,
    selectedOutput,
    setRightPanelContent,
    style,
  ]);

  const outputs = generatedImages.length > 0 ? generatedImages : SAMPLE_OUTPUTS;

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      <ImageGenHeader />
      <ModeSelector modes={MODES} activeMode={activeMode} onSelect={handleModeChange} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeMode === 'generate' ? (
            <NanoBananaLayout
              refImage={nbReferenceImage}
              setRefImage={setNbReferenceImage}
              assetImage={nbAssetImage}
              setAssetImage={setNbAssetImage}
              prompt={prompt}
              setPrompt={setPrompt}
              generating={generating}
              onGenerate={handleGenerate}
              advOpen={nbAdvancedOpen}
              setAdvOpen={setNbAdvancedOpen}
              ratio={nbRatio}
              setRatio={setNbRatio}
              resolution={nbResolution}
              setResolution={setNbResolution}
              format={nbOutputFormat}
              setFormat={setNbOutputFormat}
              numOutputs={nbNumOutputs}
              setNumOutputs={setNbNumOutputs}
              seed={nbSeed}
              setSeed={setNbSeed}
              safety={nbSafety}
              setSafety={setNbSafety}
              searchGround={nbWebSearch}
              setSearchGround={setNbWebSearch}
              thinking={nbThinkingLevel}
              setThinking={setNbThinkingLevel}
              limitGen={nbLimitGen}
              setLimitGen={setNbLimitGen}
              nbModel={nbModel}
              setNbModel={setNbModel}
            />
          ) : (
            <>
              {activeMode === 'vton' && <VtonForm />}
              {activeMode === 'resize' && <ResizeForm />}
              {activeMode === 'landing' && <LandingForm prompt={prompt} setPrompt={setPrompt} />}

              <CommonSettings
                style={style}
                setStyle={setStyle}
                ratio={ratio}
                setRatio={setRatio}
                model={model}
                setModel={setModel}
                numImages={numImages}
                setNumImages={setNumImages}
                modelPrices={modelPrices}
              />

              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: generating ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: generating ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> {getGeneratingText()}
                  </>
                ) : (
                  <>
                    <Wand2 size={16} /> {getGenerateButtonText()}
                  </>
                )}
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}
                >
                  ~${totalCost}
                </span>
              </button>
            </>
          )}

          {generated && activeMode !== 'generate' && (
            <OutputGrid outputs={outputs} selectedOutput={selectedOutput} setSelectedOutput={setSelectedOutput} />
          )}
        </div>

        {!generated && <PromptTips />}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
