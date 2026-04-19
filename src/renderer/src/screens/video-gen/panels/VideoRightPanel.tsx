import { Download, Check, Film, Clock } from 'lucide-react';
import { StepChecklist } from '../../../components/ui/StepChecklist';
import { VIDEO_STEPS, VIDEO_MODELS } from '../constants';
import { InfoRow } from '../../image-gen/shared/InfoRow';

interface VideoRightPanelProps {
  generating: boolean;
  generatedVideoUrl: string | null;
  model: string;
  duration: number;
  aspectRatio: string;
  audio: boolean;
  estimatedCost: number;
}

export function VideoRightPanel({ generating, generatedVideoUrl, model, duration, aspectRatio, audio, estimatedCost }: VideoRightPanelProps) {
  const selectedModelInfo = VIDEO_MODELS.find(m => m.id === model);
  const modelName = selectedModelInfo ? selectedModelInfo.label : model;
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Film size={14} /> Video Panel
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Format: <span style={{ fontFamily: 'var(--font-mono)' }}>MP4 High Bitrate</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ 
            width: '100%', aspectRatio: '16/9', borderRadius: 12, background: 'rgba(108,99,255,0.08)', 
            border: '1px solid rgba(108,99,255,0.15)', animation: 'pulse 1.5s ease-in-out infinite', 
            marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Clock size={24} color="var(--ma-accent)" style={{ animation: 'spin 4s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Rendering Video...</span>
            </div>
          </div>
          <StepChecklist steps={VIDEO_STEPS} onComplete={() => {}} estimatedTime="~45-180 seconds" />
          <style>{`
            @keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {!generating && !generatedVideoUrl && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--ma-border)', marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 4px', fontSize: 13, color: '#FFF' }}>{modelName}</h4>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Workflow: Video Generation</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InfoRow label="Model" value={modelName} />
            <InfoRow label="Duration" value={`${duration}s`} />
            <InfoRow label="Ratio" value={aspectRatio} />
            <InfoRow label="Audio" value={audio ? "ON" : "OFF"} />
            <InfoRow label="Est. cost" value={`$${estimatedCost.toFixed(3)}`} valueColor="var(--ma-green)" />
          </div>
        </div>
      )}

      {generatedVideoUrl && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Check size={14} style={{ color: 'var(--ma-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>Video rendered successfully</span>
          </div>

          <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid var(--ma-border)' }}>
            <video 
              src={generatedVideoUrl} 
              controls 
              autoPlay 
              loop 
              playsInline
              style={{ width: '100%', display: 'block', backgroundColor: '#000' }} 
            />
          </div>

          <button style={{ width: '100%', padding: '10px', background: 'var(--ma-accent)', border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)' }}>
            <Download size={14} /> Download MP4
          </button>
          
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Platform" value="Auto" />
            <InfoRow label="Engine" value={model} mono />
            <InfoRow label="Duration" value={`${duration}s`} mono />
          </div>
        </div>
      )}
    </div>
  );
}
