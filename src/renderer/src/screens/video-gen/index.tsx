/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/useVideoGen.ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import { useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VideoRightPanel } from './panels/VideoRightPanel';
import { useVideoGen } from './hooks/useVideoGen';
import { VideoGenHeader } from './components/VideoGenHeader';
import { VideoGenLeftPanel } from './components/VideoGenLeftPanel';
import { VideoGenResults } from './components/VideoGenResults';

export function VideoGenScreen() {
  const { setRightPanelContent } = useApp();
  const videoGen = useVideoGen();

  const {
    activeMode, setActiveMode,
    generating,
    generatedVideoUrl,
    modelId,
    duration,
    resolution,
    audio,
    selectedModelInfo,
    estimatedCost,
    handleManualGenerate,
  } = videoGen;

  useEffect(() => {
    setRightPanelContent(
      <VideoRightPanel 
        isGenerating={generating} 
        generatedVideoUrl={generatedVideoUrl} 
        selectedModel={selectedModelInfo} 
        selectedDuration={duration} 
        selectedResolution={resolution}
        audioEnabled={audio}
        currentCost={Number(estimatedCost)}
      />
    );

    return () => setRightPanelContent(null);
  }, [generating, generatedVideoUrl, modelId, duration, resolution, audio, estimatedCost, setRightPanelContent, selectedModelInfo, handleManualGenerate]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, background: 'var(--ma-bg)', overflowY: 'auto' }}>
      <VideoGenHeader activeMode={activeMode} onModeChange={setActiveMode} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
        <VideoGenLeftPanel {...videoGen} />
        <VideoGenResults videoGen={videoGen} />
      </div>
    </div>
  );
}
