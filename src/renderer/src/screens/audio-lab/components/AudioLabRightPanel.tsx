import { BarChart3, History, Download } from 'lucide-react';
import { UnifiedAudioPlayer } from './UnifiedAudioPlayer';

interface AudioLabRightPanelProps {
  results: any[];
  scriptLength: number;
}

export const AudioLabRightPanel = ({ results, scriptLength }: AudioLabRightPanelProps) => {
  // ElevenLabs pricing: $0.1 per 1000 chars for TTS
  const estimatedCost = ((scriptLength / 1000) * 0.1).toFixed(4);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      {/* Cost Estimator */}
      <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={14} color="var(--ma-accent)" />
            Cost Estimator
          </h3>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
            ${estimatedCost}
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          ElevenLabs v3: $0.1 per 1k characters
        </p>
      </div>

      <div style={{ padding: '16px 24px 8px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: '0 0 4px' }}>Recent Results</h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Your generated voiceovers</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.3,
            marginTop: 40
          }}>
            <History size={32} />
            <p style={{ fontSize: 12 }}>No history yet</p>
          </div>
        ) : (
          results.map(result => (
            <div
              key={result.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--ma-border)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ma-accent)' }}>{result.voice}</span>
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, color: 'rgba(255,255,255,0.3)' }}>
                    {result.type}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
                  {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p style={{
                fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0,
                lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
              }}>
                {result.text}
              </p>

              <UnifiedAudioPlayer url={result.url} />

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => (window as any).api.utils.downloadFile({ url: result.url, filename: `voiceover-${result.id}.mp3` })}
                  style={{
                    flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--ma-border)',
                    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer'
                  }}
                >
                  <Download size={12} />
                  Save
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
