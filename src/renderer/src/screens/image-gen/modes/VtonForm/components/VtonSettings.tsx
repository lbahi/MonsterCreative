import { NANO_BANANA_MODELS } from '../../../constants';

interface VtonSettingsProps {
  model: string;
  setModel: (val: string) => void;
  numImages: number;
  setNumImages: (val: number) => void;
  resolution: string;
  setResolution: (val: string) => void;
  aspectRatio: string;
  setAspectRatio: (val: string) => void;
}

export function VtonSettings({
  model, setModel,
  numImages, setNumImages,
  resolution, setResolution,
  aspectRatio, setAspectRatio
}: VtonSettingsProps) {
  const selectStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white',
    padding: '10px 12px', borderRadius: 8, fontSize: 13,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <div>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Rendering Model</label>
        <select value={model} onChange={e => setModel(e.target.value)} style={selectStyle}>
          {NANO_BANANA_MODELS.map(m => <option key={m} value={m} style={{ background: '#11111A' }}>{m}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Variants</label>
        <select value={numImages} onChange={e => setNumImages(Number(e.target.value))} style={selectStyle}>
          {[1, 2, 3, 4].map(n => <option key={n} value={n} style={{ background: '#11111A' }}>{n} Images</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Resolution</label>
        <select value={resolution} onChange={e => setResolution(e.target.value)} style={selectStyle}>
          {['0.5K', '1K', '2K', '4K'].map(n => <option key={n} value={n} style={{ background: '#11111A' }}>{n}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Aspect Ratio</label>
        <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} style={selectStyle}>
          {['1:1', '4:5', '9:16', '3:4', '2:3', '16:9'].map(n => <option key={n} value={n} style={{ background: '#11111A' }}>{n}</option>)}
        </select>
      </div>
    </div>
  );
}
