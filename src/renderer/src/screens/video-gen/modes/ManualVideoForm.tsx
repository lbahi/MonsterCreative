import { Play, Settings2, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { VIDEO_MODELS, VIDEO_DURATIONS, VIDEO_ASPECT_RATIOS } from '../constants';

interface ManualVideoFormProps {
  prompt: string;
  setPrompt: (value: string) => void;
  disabled?: boolean;
}

export function ManualVideoForm({
  prompt, setPrompt,
  disabled
}: ManualVideoFormProps) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      {/* Prompt */}
      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF' }}>1</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Director's Notes (Prompt)</span>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={disabled}
          placeholder="Describe the camera motion, character actions, and environmental aesthetics..."
          style={{
            width: '100%', flex: 1, minHeight: 160, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ma-border)',
            borderRadius: 8, color: '#FFF', fontSize: 13, padding: '16px', outline: 'none', resize: 'none',
            fontFamily: 'var(--font-body)'
          }}
        />
      </div>
    </div>
  );
}
