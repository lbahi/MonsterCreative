import { useEffect } from 'react'
import { useApp } from '../../../contexts/AppContext'
import { IMG_STEPS, SAMPLE_OUTPUTS } from '../constants'
import { ImageGenRightPanel } from '../panels/ImageGenRightPanel'
import { NanoBananaRightPanel } from '../panels/NanoBananaRightPanel'
import { ResizeRightPanel } from '../panels/ResizeRightPanel'
import type { ActiveImageGenMode } from '../types'

export function useImageGenRightPanel(activeMode: ActiveImageGenMode, imageGen: any) {
  const { setRightPanelContent } = useApp()

  const {
    model,
    style,
    ratio,
    numImages,
    nbReferenceImage,
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
    nbEstimatedCost
  } = imageGen

  useEffect(() => {
    if (activeMode === 'generate' || activeMode === 'vton' || activeMode === 'social') {
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
        />
      )
    } else if (activeMode === 'resize') {
      setRightPanelContent(
        <ResizeRightPanel
          generating={generating}
          generated={generated}
          resizeModel={resizeModel}
          selectedFormats={resizeSelectedFormats}
          totalCost={resizeTotalCost}
          outputs={generatedImages}
        />
      )
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
        />
      )
    }

    return () => setRightPanelContent(null)
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
    resizeSelectedFormats,
    resizeModel,
    resizeTotalCost
  ])
}
