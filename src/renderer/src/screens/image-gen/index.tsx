/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/useImageGen.ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useApp } from '../../contexts/AppContext';
import { IMG_STEPS, SAMPLE_OUTPUTS } from './constants';
import { useImageGen } from './hooks/useImageGen';
import { ImageGenRightPanel } from './panels/ImageGenRightPanel';
import { NanoBananaRightPanel } from './panels/NanoBananaRightPanel';
import { ResizeRightPanel } from './panels/ResizeRightPanel';
import type { ActiveImageGenMode } from './types';
import { ModeRouter } from './components/ModeRouter';

function getActiveMode(pathname: string): ActiveImageGenMode {
  if (pathname.includes('vton')) return 'vton';
  if (pathname.includes('resize')) return 'resize';
  if (pathname.includes('landing')) return 'landing';
  return 'generate';
}

export function ImageGenScreen() {
  const { setRightPanelContent } = useApp();
  const location = useLocation();
  const activeMode = getActiveMode(location.pathname);
  const imageGen = useImageGen(activeMode);

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
    nbEstimatedCost,
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
    resizeSelectedFormats,
    resizeModel,
    resizeTotalCost,
  ]);

  return <ModeRouter {...imageGen} activeMode={activeMode} />;
}
