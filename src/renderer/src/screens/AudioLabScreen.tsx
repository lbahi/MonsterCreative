import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Music2, Mic, AudioWaveform, Play, Pause,
  Download, History, Settings, Filter,
  Sparkles, Globe, User, Check, AlertCircle,
  Volume2, FastForward, Rewind, ChevronRight,
  Plus, BarChart3, Lock
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VOICE_REGISTRY, VoiceEntry } from '../data/voices';
import { UnifiedAudioPlayer } from './audio-lab/components/UnifiedAudioPlayer';

export function AudioLabScreen() {
  const { setRightPanelContent } = useApp();
  const location = useLocation();

  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEntry>(VOICE_REGISTRY[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [regionFilter, setRegionFilter] = useState('');

  // Custom (Cloned) Voices - persisted
  const [customVoices, setCustomVoices] = useState<any[]>([]);

  // Generation Settings
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [speed, setSpeed] = useState(1.0);

  // Load custom voices from DB on mount
  useEffect(() => {
    (window as any).api.audio.getAllCustomVoices().then((res: any) => {
      if (res.success) setCustomVoices(res.data);
    });
  }, []);

  useEffect(() => {
    setRightPanelContent(<AudioLabRightPanel results={results} scriptLength={script.length} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, results, script.length]);

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsGenerating(true);
    try {
      let response: any;

      if (selectedVoice.id.startsWith('custom_')) {
        // Cloned voice: use Qwen3 TTS with the saved embedding path
        response = await (window as any).api.audio.generateClonedSpeech({
          text: script,
          speakerEmbeddingUrl: selectedVoice.elevenLabsId // stored as local path
        });
      } else {
        // Standard ElevenLabs voice
        response = await (window as any).api.audio.generateSpeech({
          text: script,
          voiceId: selectedVoice.elevenLabsId,
          stability: stability / 100,
        });
      }

      if (response.success) {
        setResults(prev => [{
          id: Date.now().toString(),
          url: response.data.url,
          text: script,
          voice: selectedVoice.name,
          createdAt: new Date().toISOString(),
          type: selectedVoice.id.startsWith('custom_') ? 'CLONE' : 'TTS'
        }, ...prev]);
      } else { alert('Generation failed: ' + response.error); }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally { setIsGenerating(false); }
  };

  const handlePreview = async (voice: VoiceEntry) => {
    try {
      // 100% Free Local Preview (Method 1)
      const audioUrl = `/OutputVoices/${voice.name}.mp4`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;

      await audio.play();
    } catch (err) {
      console.error("Failed to play local preview:", err);
      alert(`Could not play the local preview for ${voice.name}. Ensure ${voice.name}.mp4 exists in the public/OutputVoices folder.`);
    }
  };

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
                  WebkitAppRegion: 'no-drag',
                  WebkitUserSelect: 'auto',
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
        )}

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

      {/* CENTER: Voice Marketplace */}
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
                onChange={(e) => setRegionFilter(e.target.value)}
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
          {VOICE_REGISTRY.filter(voice => regionFilter === '' || voice.region === regionFilter).map(voice => (
            <div
              key={voice.id}
              onClick={() => setSelectedVoice(voice)}
              style={{
                background: selectedVoice.id === voice.id ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.03)',
                border: selectedVoice.id === voice.id ? '2px solid var(--ma-accent)' : '1px solid var(--ma-border)',
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
              {selectedVoice.id === voice.id && (
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
                    handlePreview(voice);
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
          ))}

          {/* My Voices — Cloned Voices Section */}
          {customVoices.length > 0 && (
            <>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 4px' }}>
                <div style={{ height: 1, flex: 1, background: 'var(--ma-border)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>My Voices</span>
                <div style={{ height: 1, flex: 1, background: 'var(--ma-border)' }} />
              </div>
              {customVoices.map((cv: any) => (
                <div
                  key={cv.id}
                  style={{
                    background: selectedVoice?.id === `custom_${cv.id}` ? 'rgba(108,99,255,0.08)' : 'rgba(255,255,255,0.02)',
                    border: selectedVoice?.id === `custom_${cv.id}` ? '2px solid var(--ma-accent)' : '1px solid var(--ma-border)',
                    borderRadius: 20, padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12
                  }}
                  onClick={() => setSelectedVoice({
                    id: `custom_${cv.id}`,
                    name: cv.name,
                    elevenLabsId: cv.embedding_path, // used as embedding path reference
                    region: 'My Voices',
                    regionFlag: '🎙️',
                    dialect: 'Cloned',
                    gender: 'male',
                    tier: 'premium',
                    useCase: 'Custom cloned voice',
                    sampleText: ''
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(108,99,255,0.1))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Mic size={18} color="var(--ma-accent)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#FFF', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cv.name}
                      </p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, fontFamily: 'var(--font-mono)' }}>
                        {new Date(cv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{
                      padding: '3px 7px', borderRadius: 5,
                      background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)',
                      color: 'var(--ma-accent)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase'
                    }}>Cloned</div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        flex: 1, padding: '7px', borderRadius: 8,
                        background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
                        color: 'var(--ma-accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVoice({
                          id: `custom_${cv.id}`,
                          name: cv.name,
                          elevenLabsId: cv.embedding_path,
                          region: 'My Voices',
                          regionFlag: '🎙️',
                          dialect: 'Cloned',
                          gender: 'male',
                          tier: 'premium',
                          useCase: 'Custom cloned voice',
                          sampleText: ''
                        });
                      }}
                    >Use Voice</button>
                    <button
                      style={{
                        padding: '7px 10px', borderRadius: 8,
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#EF4444', fontSize: 11, cursor: 'pointer'
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Delete "${cv.name}"? This cannot be undone.`)) return;
                        await (window as any).api.audio.deleteCustomVoice(cv.id);
                        const res = await (window as any).api.audio.getAllCustomVoices();
                        if (res.success) setCustomVoices(res.data);
                      }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>

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

function AudioLabRightPanel({ results, scriptLength }: { results: any[], scriptLength: number }) {
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
          ElevenLabs v3: $0.1 per 1k charactersn audio length'}
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
}

function ComingSoonCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div style={{
      background: 'var(--ma-surface)',
      border: '1px solid var(--ma-border)',
      borderRadius: 16,
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      textAlign: 'center',
      minHeight: 400
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(108,99,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ma-accent)'
      }}>
        {icon}
      </div>
      
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 auto', maxWidth: 400, lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      <div style={{
        padding: '6px 12px',
        borderRadius: 20,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 8
      }}>
        In Development
      </div>
    </div>
  );
}
