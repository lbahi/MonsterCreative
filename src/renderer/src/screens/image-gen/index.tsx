import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Wand2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import { useApp } from '../../contexts/AppContext';
import { falService } from '../../services/fal.service';
import { IMG_STEPS, MODEL_FALLBACK_PRICES, MODES, SAMPLE_OUTPUTS, NANO_BANANA_MODELS, PLATFORM_FORMATS, KONTEXT_RESIZE_PROMPT, RESIZE_MODELS } from './constants';
import { useImageGenPricing } from './hooks/useImageGenPricing';
import { LandingForm } from './modes/LandingForm';
import { NanoBananaLayout } from './modes/NanoBananaLayout';
import { ResizeForm, type ResizeCustomDimensions } from './modes/ResizeForm';
import { VtonForm } from './modes/VtonForm';
import { ImageGenRightPanel } from './panels/ImageGenRightPanel';
import { NanoBananaRightPanel } from './panels/NanoBananaRightPanel';
import { ResizeRightPanel } from './panels/ResizeRightPanel';
import { CommonSettings } from './shared/CommonSettings';
import { ImageGenHeader } from './shared/ImageGenHeader';
import { ModeSelector } from './shared/ModeSelector';
import { OutputGrid } from './shared/OutputGrid';
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
  const [nbAssetImages, setNbAssetImages] = useState<string[]>([]);
  const [nbAdvancedOpen, setNbAdvancedOpen] = useState(false);
  const [nbRatio, setNbRatio] = useState('auto');
  const [nbResolution, setNbResolution] = useState('1K');
  const [nbOutputFormat, setNbOutputFormat] = useState('jpeg');
  const [nbNumOutputs, setNbNumOutputs] = useState(1);
  const [nbSeed, setNbSeed] = useState('');
  const [nbSafety, setNbSafety] = useState(3);
  const [nbWebSearch, setNbWebSearch] = useState(false);
  const [nbThinkingLevel, setNbThinkingLevel] = useState<NanoBananaThinkingLevel>('minimal');
  const [nbModel, setNbModel] = useState(NANO_BANANA_MODELS[0]);
  const [nbLimitGen, setNbLimitGen] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // ── Resize state ──────────────────────────────────────────────────────────
  const [resizeFile, setResizeFile] = useState<File | null>(null);
  const [resizeSelectedFormats, setResizeSelectedFormats] = useState<string[]>(['instagram_post', 'meta_story']);
  const [resizeModel, setResizeModel] = useState('reframe');
  const [resizeCustomDimensions, setResizeCustomDimensions] = useState<ResizeCustomDimensions>({});

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

  const resizeModelPrice = RESIZE_MODELS.find((m) => m.id === resizeModel)?.price ?? 0.04;
  const resizeTotalCost = (resizeSelectedFormats.length * resizeModelPrice).toFixed(3);

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
    // ── Resize Mode ─────────────────────────────────────────────────────────
    if (activeMode === 'resize') {
      if (!resizeFile) { alert('Please upload a source image first.'); return; }
      if (resizeSelectedFormats.length === 0) { alert('Please select at least one export format.'); return; }

      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);

      try {
        // Step 1: Convert File → Base64 dataURL, then upload via main process (avoids renderer CORS/fetch block)
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(resizeFile!);
        });

        const uploadResult = await falService.uploadImageFromDataUrl(dataUrl);
        if (uploadResult.error || !uploadResult.url) {
          throw new Error(uploadResult.error ?? 'Upload failed');
        }
        const hostedUrl = uploadResult.url;

        // Step 2: Build payloads for each selected format
        const selectedPlatforms = PLATFORM_FORMATS.filter((f) => resizeSelectedFormats.includes(f.id));

        // Step 3: Parallel dispatch
        const promises = selectedPlatforms.map(async (fmt) => {
          const isNonStandard = fmt.aspectRatioEnum === null;
          const customDims = resizeCustomDimensions[fmt.id];
          const targetW = customDims?.w ?? fmt.w;
          const targetH = customDims?.h ?? fmt.h;

          if (resizeModel === 'reframe') {
            // Reframe only supports standard enums; use closestEnum for non-standard
            const result = await falService.reframeImage({
              image_url: hostedUrl,
              aspect_ratio: fmt.closestEnum,
            });
            return result?.images?.[0]?.url ?? null;

          } else if (resizeModel === 'kontext') {
            const result = await falService.kontextEdit({
              image_url: hostedUrl,
              prompt: KONTEXT_RESIZE_PROMPT,
              // Use exact W×H for non-standard; enum for standard
              ...(isNonStandard
                ? { width: targetW, height: targetH }
                : { aspect_ratio: fmt.aspectRatioEnum! }),
            });
            return result?.images?.[0]?.url ?? null;

          } else {
            // Nano Banana — use closestEnum for all (supports some 4:5 etc)
            const nbResult = await falService.nanoBananaEdit({
              model: 'Nano Banana',
              prompt: KONTEXT_RESIZE_PROMPT,
              image_urls: [hostedUrl],
              aspect_ratio: fmt.closestEnum,
              num_images: 1,
              output_format: 'jpeg',
              safety_tolerance: '4',
              limit_generations: true,
            });
            return nbResult?.images?.[0]?.url ?? null;
          }
        });

        const results = await Promise.allSettled(promises);

        // Log any per-format failures for debugging
        results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.error(`[resize] Format "${selectedPlatforms[i]?.label}" failed:`, r.reason);
          }
        });

        const urls = results
          .map((r) => (r.status === 'fulfilled' ? r.value : null))
          .filter(Boolean) as string[];

        if (urls.length === 0) {
          const reasons = results
            .filter((r) => r.status === 'rejected')
            .map((r) => (r as PromiseRejectedResult).reason?.message)
            .filter(Boolean)
            .join('\n');
          throw new Error(`All resize requests failed.\n${reasons}`);
        }

        setGeneratedImages(urls);
        setGenerated(true);
        setSelectedOutput(0);
      } catch (err: any) {
        console.error('Resize error:', err);
        alert(`Resize failed: ${err.message}`);
      } finally {
        setGenerating(false);
      }
      return;
    }

    // ── Generate Mode ───────────────────────────────────────────────────────
    if (activeMode === 'generate') {
      try {
        setGenerating(true);
        setGenerated(false);
        setGeneratedImages([]);

        const uploadedUrls = (
          await Promise.all([
            resolveImageInput(nbReferenceImage, 'Reference'),
            ...nbAssetImages.map((asset, i) => resolveImageInput(asset, `Asset ${i + 1}`)),
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
    nbAssetImages,
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
    // resize
    resizeFile,
    resizeSelectedFormats,
    resizeModel,
    resizeCustomDimensions,
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
    if (activeMode === 'generate' || activeMode === 'vton') {
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
    } else if (activeMode === 'resize') {
      setRightPanelContent(
        <ResizeRightPanel
          generating={generating}
          generated={generated}
          resizeModel={resizeModel}
          selectedFormats={resizeSelectedFormats}
          totalCost={resizeTotalCost}
          outputs={generatedImages}
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
    // resize
    resizeSelectedFormats,
    resizeModel,
    resizeTotalCost,
  ]);

  // Resize mode never falls back to SAMPLE_OUTPUTS — only show real generated images
  const outputs = activeMode === 'resize'
    ? generatedImages
    : (generatedImages.length > 0 ? generatedImages : SAMPLE_OUTPUTS);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      <ImageGenHeader />
      <ModeSelector modes={MODES} activeMode={activeMode} onSelect={handleModeChange} />

      <div style={{ display: activeMode === 'resize' ? 'block' : 'grid', gridTemplateColumns: activeMode === 'vton' ? '1fr 380px' : '1fr 320px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeMode === 'generate' ? (
            <NanoBananaLayout
              refImage={nbReferenceImage}
              setRefImage={setNbReferenceImage}
              assetImages={nbAssetImages}
              setAssetImages={setNbAssetImages}
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
          ) : activeMode === 'vton' ? (
            <VtonForm 
              generating={generating}
              setGenerating={setGenerating}
              setGeneratedImages={setGeneratedImages}
              setGenerated={setGenerated}
              model={nbModel}
              setModel={setNbModel}
              numImages={nbNumOutputs}
              setNumImages={setNbNumOutputs}
              resolution={nbResolution}
              setResolution={setNbResolution}
              refImage={nbReferenceImage}
              setRefImage={setNbReferenceImage}
            />
          ) : activeMode === 'resize' ? (
            <>
              <ResizeForm
                sourceFile={resizeFile}
                setSourceFile={setResizeFile}
                selectedFormats={resizeSelectedFormats}
                setSelectedFormats={setResizeSelectedFormats}
                resizeModel={resizeModel}
                setResizeModel={setResizeModel}
                customDimensions={resizeCustomDimensions}
                setCustomDimensions={setResizeCustomDimensions}
                onGenerate={handleGenerate}
                generating={generating}
                totalCost={resizeTotalCost}
              />
            </>
          ) : (
            <>
              {activeMode === 'landing' ? (
                <LandingForm />
              ) : (
                <>
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
            </>
          )}

          {generated && activeMode !== 'generate' && (
            <OutputGrid
              outputs={outputs}
              selectedOutput={selectedOutput}
              setSelectedOutput={setSelectedOutput}
              naturalRatio={activeMode === 'resize'}
            />
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
