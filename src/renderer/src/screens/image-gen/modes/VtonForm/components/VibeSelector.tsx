import { Camera } from 'lucide-react';
import { VIBES } from '../../../constants';

interface VibeSelectorProps {
  vibe: string;
  onSelect: (vibe: string) => void;
}

export function VibeSelector({ vibe, onSelect }: VibeSelectorProps) {
  return (
    <div>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
        <Camera size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
        3 · Select Casting Vibe
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {VIBES.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              aspectRatio: '1/1',
              border: `2px solid ${vibe === item.id ? 'var(--ma-accent)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <img src={item.image} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: vibe === item.id ? 1 : 0.6 }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              padding: '28px 4px 6px', fontSize: 9.5, fontWeight: 700, color: '#FFF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
