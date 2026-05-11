import { MODES } from '../constants'
import { LandingForm } from '../modes/LandingForm'
import { NanoBananaLayout } from '../modes/NanoBananaLayout'
import { ResizeForm } from '../modes/ResizeForm'
import { VtonForm } from '../modes/VtonForm/index'
import { SocialAdsForm } from '../modes/SocialAdsForm/index'
import { CommonSettings } from './CommonSettings'
import { ImageGenHeader } from '../shared/ImageGenHeader'
import { ModeSelector } from '../shared/ModeSelector'
import { OutputGrid } from '../shared/OutputGrid'
import type { ActiveImageGenMode } from '../types'
import { useImageGen } from '../hooks/useImageGen'

interface ModeRouterProps extends ReturnType<typeof useImageGen> {
  activeMode: ActiveImageGenMode
}

export function ModeRouter(props: ModeRouterProps) {
  const {
    activeMode,
    prompt,
    setPrompt,
    style,
    setStyle,
    ratio,
    setRatio,
    model,
    setModel,
    numImages,
    setNumImages,
    nbReferenceImage,
    setNbReferenceImage,
    nbAssetImages,
    setNbAssetImages,
    nbAdvancedOpen,
    setNbAdvancedOpen,
    nbRatio,
    setNbRatio,
    nbResolution,
    setNbResolution,
    nbOutputFormat,
    setNbOutputFormat,
    nbNumOutputs,
    setNbNumOutputs,
    nbSeed,
    setNbSeed,
    nbSafety,
    setNbSafety,
    nbWebSearch,
    setNbWebSearch,
    nbThinkingLevel,
    setNbThinkingLevel,
    nbModel,
    setNbModel,
    nbLimitGen,
    setNbLimitGen,
    generating,
    setGenerating,
    generated,
    setGenerated,
    selectedOutput,
    setSelectedOutput,
    setGeneratedImages,
    resizeFile,
    setResizeFile,
    resizeSelectedFormats,
    setResizeSelectedFormats,
    resizeModel,
    setResizeModel,
    resizeCustomDimensions,
    setResizeCustomDimensions,
    handleModeChange,
    handleGenerate,
    getGenerateButtonText,
    getGeneratingText,
    totalCost,
    resizeTotalCost,
    modelPrices,
    outputs
  } = props

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      <ImageGenHeader />
      <ModeSelector modes={MODES} activeMode={activeMode} onSelect={handleModeChange} />

      <div
        style={{
          display:
            activeMode === 'resize' || activeMode === 'social' || activeMode === 'vton'
              ? 'block'
              : 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 20,
          alignItems: 'start'
        }}
      >
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
              aspectRatio={nbRatio}
              setAspectRatio={setNbRatio}
            />
          ) : activeMode === 'social' ? (
            <SocialAdsForm
              generating={generating}
              setGenerating={setGenerating}
              setGeneratedImages={setGeneratedImages}
              setGenerated={setGenerated}
              refImage={nbReferenceImage}
              setRefImage={setNbReferenceImage}
              resolution={nbResolution}
              model={nbModel}
              setModel={setNbModel}
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
                    handleGenerate={handleGenerate}
                    generating={generating}
                    getGeneratingText={getGeneratingText}
                    getGenerateButtonText={getGenerateButtonText}
                    totalCost={totalCost}
                  />
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
  )
}
