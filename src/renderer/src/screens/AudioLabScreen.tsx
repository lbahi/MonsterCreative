import { useState, useEffect } from 'react';
import { 
  Music2, Mic, AudioWaveform, Play, Pause, 
  Download, History, Settings, Filter, 
  Sparkles, Globe, User, Check, AlertCircle,
  Volume2, FastForward, Rewind, ChevronRight,
  Plus
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VOICE_REGISTRY, VoiceEntry } from '../data/voices';
import { UnifiedAudioPlayer } from './audio-lab/components/UnifiedAudioPlayer';

export function AudioLabScreen() {
  const { setRightPanelContent } = useApp();
  const [activeTab, setActiveTab] = useState<'tts' | 'clone' | 's2s'>('tts');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEntry>(VOICE_REGISTRY[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  
  // Clone State
  const [cloneName, setCloneName] = useState('');
  const [cloneFile, setCloneFile] = useState<File | null>(null);

  // S2S State
  const [sourceAudio, setSourceAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Generation Settings
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    setRightPanelContent(<AudioLabRightPanel results={results} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, results]);

  const handleGenerate = async () => {
    if (activeTab === 'tts') {
      if (!script.trim()) return;
      setIsGenerating(true);
      try {
        const response = await (window as any).api.audio.generateSpeech({
          text: script,
          voiceId: selectedVoice.elevenLabsId,
          stability: stability / 100,
          similarity_boost: similarity / 100,
          speed: speed
        });

        if (response.success) {
          const newResult = {
            id: Date.now().toString(),
            url: response.data.url,
            text: script,
            voice: selectedVoice.name,
            createdAt: new Date().toISOString(),
            type: 'TTS'
          };
          setResults(prev => [newResult, ...prev]);
        }
      } catch (err) {
        console.error('Error generating audio:', err);
      } finally {
        setIsGenerating(false);
      }
    } else if (activeTab === 's2s') {
      if (!sourceAudio) return;
      setIsGenerating(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(sourceAudio);
        reader.onload = async () => {
          const dataUrl = reader.result as string;
          const uploadRes = await (window as any).api.fal.uploadImageFromDataUrl(dataUrl); 
          
          const response = await (window as any).api.audio.speechToSpeech({
            audio_url: uploadRes,
            voice: selectedVoice.elevenLabsId
          });

          if (response.success) {
            const newResult = {
              id: Date.now().toString(),
              url: response.data.url,
              text: 'Voice transformation result',
              voice: selectedVoice.name,
              createdAt: new Date().toISOString(),
              type: 'S2S'
            };
            setResults(prev => [newResult, ...prev]);
          }
          setIsGenerating(false);
        };
      } catch (err) {
        console.error('Error in S2S:', err);
        setIsGenerating(false);
      }
    }
  };

  const handlePreview = async (voice: VoiceEntry) => {
    const response = await (window as any).api.audio.generateSpeech({
      text: "Hi, I am " + voice.name + ". I can help you with your ads.",
      voiceId: voice.elevenLabsId,
      speed: 1.0
    });
    if (response.success) {
      const audio = new Audio(response.data.url);
      audio.play();
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
        {/* Mode Switcher */}
        <div style={{
          background: 'var(--ma-surface)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 4,
          display: 'flex',
          gap: 4
        }}>
          {[
            { id: 'tts', label: 'Script', icon: <Sparkles size={14} /> },
            { id: 'clone', label: 'Clone', icon: <Mic size={14} /> },
            { id: 's2s', label: 'Design', icon: <AudioWaveform size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === tab.id ? 'var(--ma-elevated)' : 'transparent',
                color: activeTab === tab.id ? '#FFF' : 'rgba(255,255,255,0.4)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'tts' && (
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
                placeholder="Type your ad script here..."
                style={{
                  width: '100%', height: 200, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--ma-border)', borderRadius: 12,
                  padding: 16, color: '#FFF', fontSize: 14, lineHeight: 1.6,
                  resize: 'none', outline: 'none', fontFamily: 'var(--font-body)'
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'clone' && (
          <div style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border)',
            borderRadius: 16,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: '50%', background: 'rgba(108,99,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ma-accent)',
                margin: '0 auto 16px'
              }}>
                <Mic size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: '0 0 8px' }}>Clone Brand Voice</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Upload a 30s sample of your brand's voice to create a unique identity.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Voice Name</label>
              <input 
                type="text" value={cloneName} onChange={(e) => setCloneName(e.target.value)}
                placeholder="e.g. Monster Brand Male"
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)',
                  borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13, outline: 'none'
                }}
              />
            </div>

            <div style={{
              border: '2px dashed var(--ma-border)', borderRadius: 12, padding: '32px 20px',
              textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
            }}
            onClick={() => document.getElementById('clone-upload')?.click()}
            >
              <input type="file" id="clone-upload" hidden onChange={(e) => setCloneFile(e.target.files?.[0] || null)} />
              <div style={{ color: cloneFile ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)', marginBottom: 12 }}>
                <Plus size={32} />
              </div>
              <p style={{ fontSize: 13, color: cloneFile ? '#FFF' : 'rgba(255,255,255,0.4)', margin: 0 }}>
                {cloneFile ? cloneFile.name : 'Click to upload audio sample'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>MP3, WAV, or M4A supported</p>
            </div>
          </div>
        )}

        {activeTab === 's2s' && (
          <div style={{
            background: 'var(--ma-surface)',
            border: '1px solid var(--ma-border)',
            borderRadius: 16,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
             <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: '50%', background: 'rgba(108,99,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ma-accent)',
                margin: '0 auto 16px'
              }}>
                <AudioWaveform size={24} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: '0 0 8px' }}>Voice Design Studio</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Transform your own recording into any premium voice from the marketplace.</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--ma-border)',
              borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <button 
                onClick={() => setIsRecording(!isRecording)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                  background: isRecording ? '#EF4444' : 'rgba(255,255,255,0.05)',
                  color: '#FFF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFF', animation: isRecording ? 'statusPulse 1s infinite' : 'none' }} />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>OR</div>

              <button 
                onClick={() => document.getElementById('s2s-upload')?.click()}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--ma-border)',
                  background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer'
                }}
              >
                <input type="file" id="s2s-upload" hidden onChange={(e) => setSourceAudio(e.target.files?.[0] || null)} />
                {sourceAudio ? sourceAudio.name : 'Upload Source Audio'}
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'clone' && (
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
          disabled={isGenerating || (activeTab === 'tts' && !script.trim()) || (activeTab === 'clone' && !cloneFile) || (activeTab === 's2s' && !sourceAudio)}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: 'none',
            background: isGenerating ? 'var(--ma-border)' : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            color: isGenerating ? 'rgba(255,255,255,0.3)' : '#FFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
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
              {activeTab === 'clone' ? 'Creating Voice...' : 'Generating...'}
            </>
          ) : (
            <>
              {activeTab === 'tts' && <Sparkles size={18} />}
              {activeTab === 'clone' && <Mic size={18} />}
              {activeTab === 's2s' && <AudioWaveform size={18} />}
              {activeTab === 'tts' ? 'Generate Voiceover' : activeTab === 'clone' ? 'Clone Brand Voice' : 'Transform Audio'}
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
              <select style={{
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
                <option>All Regions</option>
                <option>Egypt</option>
                <option>Gulf</option>
                <option>Levant</option>
                <option>Maghreb</option>
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
          {VOICE_REGISTRY.map(voice => (
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

          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '2px dashed var(--ma-border)',
            borderRadius: 20,
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: 180
          }}
          onClick={() => setActiveTab('clone')}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.2)'
            }}>
              <Plus size={20} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: '0 0 2px' }}>Clone Brand Voice</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: 0 }}>Add your own identity</p>
            </div>
          </div>
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

function AudioLabRightPanel({ results }: { results: any[] }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--ma-border)' }}>
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
