import { RefreshCw, Wand2 } from 'lucide-react';
import { MODES } from '../constants';
import { LandingForm } from '../modes/LandingForm';
import { NanoBananaLayout } from '../modes/NanoBananaLayout';
import { ResizeForm } from '../modes/ResizeForm';
import { VtonForm } from '../modes/VtonForm';
import { CommonSettings } from '../shared/CommonSettings';
import { ImageGenHeader } from '../shared/ImageGenHeader';
import { ModeSelector } from '../shared/ModeSelector';
import { OutputGrid } from '../shared/OutputGrid';
import type { ActiveImageGenMode } from '../types';
import { useImageGen } from '../hooks/useImageGen';

interface ModeRouterProps extends ReturnType<typeof useImageGen> {
  activeMode: ActiveImageGenMode;
}

export function ModeRouter(props: ModeRouterProps) {
  const {
    activeMode,
    prompt, setPrompt,
    style, setStyle,
    ratio, setRatio,
    model, setModel,
    numImages, setNumImages,
    nbReferenceImage, setNbReferenceImage,
    nbAssetImages, setNbAssetImages,
    nbAdvancedOpen, setNbAdvancedOpen,
    nbRatio, setNbRatio,
    nbResolution, setNbResolution,
    nbOutputFormat, setNbOutputFormat,
    nbNumOutputs, setNbNumOutputs,
    nbSeed, setNbSeed,
    nbSafety, setNbSafety,
    nbWebSearch, setNbWebSearch,
    nbThinkingLevel, setNbThinkingLevel,
    nbModel, setNbModel,
    nbLimitGen, setNbLimitGen,
    generating, setGenerating,
    generated, setGenerated,
    selectedOutput, setSelectedOutput,
    setGeneratedImages,
    resizeFile, setResizeFile,
    resizeSelectedFormats, setResizeSelectedFormats,
    resizeModel, setResizeModel,
    resizeCustomDimensions, setResizeCustomDimensions,
    handleModeChange,
    handleGenerate,
    getGenerateButtonText,
    getGeneratingText,
    totalCost,
    resizeTotalCost,
    modelPrices,
    outputs
  } = props;

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
