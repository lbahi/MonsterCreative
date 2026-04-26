import { VideoPlayer } from '../../../components/VideoPlayer';
import { TemplatesTab } from '../tabs/TemplatesTab';
import { ManualTab } from '../tabs/ManualTab';
import { useVideoGen } from '../hooks/useVideoGen';

interface VideoGenResultsProps {
  videoGen: ReturnType<typeof useVideoGen>;
}

export function VideoGenResults({ videoGen }: VideoGenResultsProps) {
  const {
    generating,
    error,
    result,
    activeMode,
    duration,
    resolution,
    selectedModelInfo,
    estimatedCost,
    handleTemplateSelect,
    sourceImage
  } = videoGen;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {generating && (
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid var(--ma-border)', 
          borderRadius: 16, 
          padding: '40px 20px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(108, 99, 255, 0.2)', borderTopColor: 'var(--ma-accent)', borderRadius: '50%' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#FFF', margin: 0 }}>
              ⏳ Generating {duration}s @ {resolution}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              {selectedModelInfo.label} generation is in progress...
            </p>
            <p style={{ fontSize: '11px', color: 'var(--ma-accent)', marginTop: 12, fontWeight: 600 }}>
              Estimated Cost: ${estimatedCost}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          color: '#EF4444',
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          <div style={{ fontWeight: 700 }}>Generation Failed</div>
          <div>{error}</div>
        </div>
      )}

      {result && (
        <VideoPlayer 
          url={result.url} 
          fileName={result.fileName} 
          fileSize={result.fileSize} 
        />
      )}

      {!generating && !result && !error && activeMode === 'templates' && (
        <TemplatesTab onTemplateSelect={handleTemplateSelect} disabled={generating || !sourceImage} />
      )}

      {!generating && !result && !error && activeMode === 'manual' && (
        <ManualTab {...videoGen} />
      )}
    </div>
  );
}
