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
  const imageGen = useImageGen(activeMode);

  const {
    prompt,
    style,
    ratio,
    model,
    numImages,
    nbReferenceImage,
    nbAssetImages,
    nbRatio,
    nbResolution,
    nbNumOutputs,
    nbSafety,
    nbWebSearch,
    nbModel,
    generating,
    generated,
    selectedOutput,
    setSelectedOutput,
    generatedImages,
    resizeSelectedFormats,
    resizeModel,
    resizeTotalCost,
    handleStepsComplete,
    nbEstimatedCost,
    modelPrices,
    totalCost,
    getGeneratingText,
    getGenerateButtonText,
    outputs,
    setNbReferenceImage,
    setNbAssetImages,
    setPrompt,
    nbAdvancedOpen,
    setNbAdvancedOpen,
    setNbRatio,
    setNbResolution,
    nbOutputFormat,
    setNbOutputFormat,
    setNbNumOutputs,
    nbSeed,
    setNbSeed,
    setNbSafety,
    setNbWebSearch,
    nbThinkingLevel,
    setNbThinkingLevel,
    nbLimitGen,
    setNbLimitGen,
    setNbModel,
    setGenerating,
    setGeneratedImages,
    setGenerated,
    resizeFile,
    setResizeFile,
    setResizeSelectedFormats,
    setResizeModel,
    resizeCustomDimensions,
    setResizeCustomDimensions,
    handleGenerate,
    handleModeChange,
  } = imageGen;

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
