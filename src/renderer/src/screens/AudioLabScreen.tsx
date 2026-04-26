import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VOICE_REGISTRY } from '../data/voices';
import { useAudioLab } from './audio-lab/hooks/useAudioLab';
import { VoiceMarketplace } from './audio-lab/components/VoiceMarketplace';
import { AudioLabRightPanel } from './audio-lab/components/AudioLabRightPanel';



export function AudioLabScreen() {
  const { setRightPanelContent } = useApp();
  const {
    script, setScript,
    selectedVoice, setSelectedVoice,
    isGenerating,
    results,
    regionFilter, setRegionFilter,
    stability, setStability,
    similarity, setSimilarity,
    handleGenerate,
    handlePreview
  } = useAudioLab();

  useEffect(() => {
    setRightPanelContent(<AudioLabRightPanel results={results} scriptLength={script.length} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, results, script.length]);


  return (
    <div style={{
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: '24px',
      height: 'calc(100vh - 54px)',
      overflow: 'hidden'
    }}>
      {/* LEFT: Script & Settings */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'var(--ma-surface)',
              border: '1px solid var(--ma-border)',
              borderRadius: 16,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Script Editor</h3>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
                  {script.length} chars
                </span>
              </div>

              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Type your ad script here... use [laughs] or [whispers] for emotion."
                style={{
                  width: '100%', height: 200, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--ma-border)', borderRadius: 12,
                  padding: 16, color: '#FFF', fontSize: 14, lineHeight: 1.6,
                  resize: 'none', outline: 'none', fontFamily: 'var(--font-body)',
                  transition: 'border-color 0.2s',
                  ['WebkitAppRegion' as string]: 'no-drag',
                  ['WebkitUserSelect' as string]: 'auto',
                  pointerEvents: 'auto'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--ma-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--ma-border)'}
              />

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['[excited]', '[whispers]', '[laughs]', '[serious]', '[sarcastically]'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setScript(prev => prev + ' ' + tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--ma-border)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 11,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="hover:bg-white/10 hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border)',
            borderRadius: 16,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>Generation Settings</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Stability</label>
                <span style={{ fontSize: 11, color: 'var(--ma-accent)', fontWeight: 600 }}>{stability}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={stability}
                onChange={(e) => setStability(parseInt(e.target.value))}
                style={{ accentColor: 'var(--ma-accent)' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Similarity Boost</label>
                <span style={{ fontSize: 11, color: 'var(--ma-accent)', fontWeight: 600 }}>{similarity}%</span>
              </div>
              <input
                type="range" min="0" max="100" value={similarity}
                onChange={(e) => setSimilarity(parseInt(e.target.value))}
                style={{ accentColor: 'var(--ma-accent)' }}
              />
            </div>
          </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !script.trim()}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: 'none',
            background: isGenerating ? 'var(--ma-border)' : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            color: isGenerating ? 'rgba(255,255,255,0.3)' : '#FFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: (isGenerating || !script.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: isGenerating ? 'none' : '0 8px 30px var(--ma-accent-glow)',
            transition: 'all 0.2s',
            marginBottom: 20
          }}
        >
          {isGenerating ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Voiceover
            </>
          )}
        </button>
      </div>

      <VoiceMarketplace
        voices={VOICE_REGISTRY}
        selectedVoice={selectedVoice}
        regionFilter={regionFilter}
        onRegionChange={setRegionFilter}
        onSelect={setSelectedVoice}
        onPreview={handlePreview}
      />


      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}




