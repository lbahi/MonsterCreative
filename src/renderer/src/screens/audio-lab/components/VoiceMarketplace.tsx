import { Filter } from 'lucide-react';
import { VoiceEntry } from '../../../data/voices';
import { VoiceCard } from './VoiceCard';

interface VoiceMarketplaceProps {
  voices: VoiceEntry[];
  selectedVoice: VoiceEntry | null;
  regionFilter: string;
  onRegionChange: (region: string) => void;
  onSelect: (voice: VoiceEntry) => void;
  onPreview: (voice: VoiceEntry) => void;
}

export const VoiceMarketplace = ({
  voices,
  selectedVoice,
  regionFilter,
  onRegionChange,
  onSelect,
  onPreview
}: VoiceMarketplaceProps) => {
  return (
    <div style={{
      background: 'var(--ma-surface)',
      border: '1px solid var(--ma-border)',
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Marketplace Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid var(--ma-border)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 4px' }}>Voice Marketplace</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Premium AI voices for regional Arabic markets</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <select
              value={regionFilter}
              onChange={(e) => onRegionChange(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--ma-border)',
                borderRadius: 10,
                padding: '8px 12px 8px 34px',
                color: '#FFF',
                fontSize: 12,
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}>
              <option value="" style={{ background: '#1A1A1A', color: '#FFF' }}>All Regions</option>
              <option value="English" style={{ background: '#1A1A1A', color: '#FFF' }}>English (US/UK)</option>
              <option value="French" style={{ background: '#1A1A1A', color: '#FFF' }}>French (FR)</option>
              <option value="Arabic (MENA)" style={{ background: '#1A1A1A', color: '#FFF' }}>Arabic (MENA)</option>
              <option value="Egypt" style={{ background: '#1A1A1A', color: '#FFF' }}>Egypt</option>
              <option value="Gulf" style={{ background: '#1A1A1A', color: '#FFF' }}>Gulf</option>
              <option value="Maghreb" style={{ background: '#1A1A1A', color: '#FFF' }}>Maghreb</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voices Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '20px',
        alignContent: 'start'
      }}>
        {voices.filter(voice => regionFilter === '' || voice.region === regionFilter).map(voice => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isSelected={selectedVoice?.id === voice.id}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
};
