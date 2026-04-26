import { Check, Play } from 'lucide-react';
import { VoiceEntry } from '../../../data/voices';

interface VoiceCardProps {
  voice: VoiceEntry;
  isSelected: boolean;
  onSelect: (voice: VoiceEntry) => void;
  onPreview: (voice: VoiceEntry) => void;
}

export const VoiceCard = ({
  voice,
  isSelected,
  onSelect,
  onPreview
}: VoiceCardProps) => {
  return (
    <div
      onClick={() => onSelect(voice)}
      style={{
        background: isSelected ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.03)',
        border: isSelected ? '2px solid var(--ma-accent)' : '1px solid var(--ma-border)',
        borderRadius: 20,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {isSelected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 20, height: 20, borderRadius: '50%',
          background: 'var(--ma-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000', boxShadow: '0 0 10px var(--ma-accent-glow)'
        }}>
          <Check size={12} strokeWidth={3} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24
        }}>
          {voice.regionFlag}
        </div>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#FFF', margin: '0 0 2px' }}>{voice.name}</h4>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {voice.dialect} • {voice.gender}
          </span>
        </div>
      </div>

      <p style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        margin: 0,
        lineHeight: 1.5,
        height: 36,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {voice.useCase}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
        <button
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--ma-border)',
            color: '#FFF',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(voice);
          }}
        >
          <Play size={12} fill="currentColor" />
          Preview
        </button>
        {voice.tier === 'premium' && (
          <div style={{
            padding: '4px 8px',
            borderRadius: 6,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            color: '#F59E0B',
            fontSize: 9,
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Premium
          </div>
        )}
      </div>
    </div>
  );
};
