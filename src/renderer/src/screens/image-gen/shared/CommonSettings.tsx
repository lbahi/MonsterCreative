import { ChevronDown, Sliders } from 'lucide-react';

import { MODELS, MODEL_FALLBACK_PRICES, RATIOS, STYLES } from '../constants';

type CommonSettingsProps = {
  style: string;
  setStyle: (value: string) => void;
  ratio: string;
  setRatio: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  numImages: number;
  setNumImages: (value: number) => void;
  modelPrices: Record<string, number>;
};

export function CommonSettings({
  style,
  setStyle,
  ratio,
  setRatio,
  model,
  setModel,
  numImages,
  setNumImages,
  modelPrices,
}: CommonSettingsProps) {
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Sliders size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Generation Settings
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Style</label>
          <div style={{ position: 'relative' }}>
            <select
              value={style}
              onChange={(event) => setStyle(event.target.value)}
              style={{
                width: '100%',
                padding: '8px 32px 8px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 12,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {STYLES.map((item) => (
                <option key={item} value={item} style={{ background: '#111124' }}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Aspect Ratio</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {RATIOS.map((item) => (
              <button
                key={item}
                onClick={() => setRatio(item)}
                style={{
                  padding: '5px 10px',
                  background: ratio === item ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${ratio === item ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
                  borderRadius: 6,
                  color: ratio === item ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Model</label>
          <div style={{ position: 'relative' }}>
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
              style={{
                width: '100%',
                padding: '8px 32px 8px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8,
                color: '#FFF',
                fontSize: 12,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {MODELS.map((item) => (
                <option key={item} value={item} style={{ background: '#111124' }}>
                  {item} - ${(modelPrices[item] ?? MODEL_FALLBACK_PRICES[item] ?? 0).toFixed(3)}/img
                </option>
              ))}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Images: {numImages}</label>
          <input
            type="range"
            min={1}
            max={8}
            value={numImages}
            onChange={(event) => setNumImages(Number(event.target.value))}
            style={{ width: '100%', accentColor: 'var(--ma-accent)', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
