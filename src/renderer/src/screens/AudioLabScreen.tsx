import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { 
  Music2, Mic, AudioWaveform, Play, Pause, 
  Download, History, Settings, Filter, 
  Sparkles, Globe, User, Check, AlertCircle,
  Volume2, FastForward, Rewind, ChevronRight,
  Plus, BarChart3
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { VOICE_REGISTRY, VoiceEntry } from '../data/voices';
import { UnifiedAudioPlayer } from './audio-lab/components/UnifiedAudioPlayer';

export function AudioLabScreen() {
  const { setRightPanelContent } = useApp();
  const location = useLocation();
  
  const activeTab = location.pathname.includes('/clone') ? 'clone' : 
                    location.pathname.includes('/s2s') ? 's2s' : 'tts';
  
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceEntry>(VOICE_REGISTRY[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [regionFilter, setRegionFilter] = useState('');

  
  // Clone State
  const [cloneName, setCloneName] = useState('');
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloneReferenceText, setCloneReferenceText] = useState('');
  const [cloneStep, setCloneStep] = useState<'upload' | 'generate'>('upload');
  const [speakerEmbeddingUrl, setSpeakerEmbeddingUrl] = useState<string | null>(null);
  const [cloneScript, setCloneScript] = useState('');

  // S2S State
  const [sourceAudio, setSourceAudio] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Generation Settings
  const [stability, setStability] = useState(50);
  const [similarity, setSimilarity] = useState(75);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    setRightPanelContent(<AudioLabRightPanel results={results} scriptLength={script.length} activeTab={activeTab} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, results, script.length, activeTab]);

  const handleGenerate = async () => {
    if (activeTab === 'tts') {
      if (!script.trim()) return;
      setIsGenerating(true);
      try {
        const response = await (window as any).api.audio.generateSpeech({
          text: script,
          voiceId: selectedVoice.elevenLabsId,
          stability: stability / 100,
        });
        if (response.success) {
          setResults(prev => [{
            id: Date.now().toString(),
            url: response.data.url,
            text: script,
            voice: selectedVoice.name,
            createdAt: new Date().toISOString(),
            type: 'TTS'
          }, ...prev]);
        } else { alert('Generation failed: ' + response.error); }
      } catch (err: any) {
        alert('Error: ' + err.message);
      } finally { setIsGenerating(false); }

    } else if (activeTab === 'clone') {
      // STEP 1: Upload file + call clone-voice endpoint to get speaker_embedding
      if (cloneStep === 'upload') {
        if (!cloneFile) return;
        setIsGenerating(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(cloneFile);
          reader.onload = async () => {
            const dataUrl = reader.result as string;
            const uploadRes = await (window as any).api.fal.uploadImageFromDataUrl(dataUrl);
            if (!uploadRes) throw new Error('Failed to upload audio sample');

            const cloneRes = await (window as any).api.audio.cloneVoice({
              audioUrl: uploadRes,
              referenceText: cloneReferenceText || undefined
            });

            if (cloneRes.success) {
              setSpeakerEmbeddingUrl(cloneRes.data.speakerEmbeddingUrl);
              setCloneStep('generate');
            } else { alert('Clone failed: ' + cloneRes.error); }
            setIsGenerating(false);
          };
          reader.onerror = () => { setIsGenerating(false); alert('Failed to read file'); };
        } catch (err: any) {
          alert('Error: ' + err.message);
          setIsGenerating(false);
        }

      // STEP 2: Use speaker_embedding + text to generate speech
      } else if (cloneStep === 'generate') {
        if (!speakerEmbeddingUrl || !cloneScript.trim()) return;
        setIsGenerating(true);
        try {
          const response = await (window as any).api.audio.generateClonedSpeech({
            text: cloneScript,
            speakerEmbeddingUrl
          });
          if (response.success) {
            setResults(prev => [{
              id: Date.now().toString(),
              url: response.data.url,
              text: cloneScript,
              voice: cloneName || 'Cloned Voice',
              createdAt: new Date().toISOString(),
              type: 'CLONE'
            }, ...prev]);
          } else { alert('Generation failed: ' + response.error); }
        } catch (err: any) {
          alert('Error: ' + err.message);
        } finally { setIsGenerating(false); }
      }

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
            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['upload', 'generate'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: cloneStep === step || (step === 'upload' && cloneStep === 'generate') ? 'var(--ma-accent)' : 'rgba(255,255,255,0.08)',
                    color: '#FFF'
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: cloneStep === step ? '#FFF' : 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {step === 'upload' ? 'Clone Sample' : 'Generate Speech'}
                  </span>
                  {i === 0 && <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                </div>
              ))}
            </div>

            {cloneStep === 'upload' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Voice Name (optional label)</label>
                  <input
                    type="text" value={cloneName} onChange={(e) => setCloneName(e.target.value)}
                    placeholder="e.g. My Brand Voice"
                    style={{
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)',
                      borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13, outline: 'none',
                      WebkitAppRegion: 'no-drag', WebkitUserSelect: 'auto'
                    }}
                  />
                </div>

                <div
                  style={{
                    border: `2px dashed ${cloneFile ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                    borderRadius: 12, padding: '32px 20px',
                    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                    background: cloneFile ? 'rgba(108,99,255,0.05)' : 'transparent'
                  }}
                  onClick={() => document.getElementById('clone-upload')?.click()}
                >
                  <input type="file" id="clone-upload" hidden accept="audio/*" onChange={(e) => setCloneFile(e.target.files?.[0] || null)} />
                  <Mic size={28} style={{ color: cloneFile ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)', marginBottom: 12 }} />
                  <p style={{ fontSize: 13, color: cloneFile ? '#FFF' : 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>
                    {cloneFile ? cloneFile.name : 'Upload voice sample (MP3, WAV, M4A)'}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Minimum 10 seconds of clean audio recommended</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Reference Text (optional — improves quality)</label>
                  <textarea
                    value={cloneReferenceText}
                    onChange={(e) => setCloneReferenceText(e.target.value)}
                    placeholder="Paste the transcript of the uploaded sample here..."
                    rows={3}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--ma-border)',
                      borderRadius: 10, padding: '10px 14px', color: '#FFF', fontSize: 13,
                      outline: 'none', resize: 'none', fontFamily: 'var(--font-body)',
                      WebkitAppRegion: 'no-drag', WebkitUserSelect: 'auto'
                    }}
                  />
                </div>
              </>
            )}

            {cloneStep === 'generate' && (
              <>
                <div style={{
                  background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <Check size={16} color="var(--ma-accent)" />
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#FFF', margin: 0 }}>
                      Voice cloned successfully!
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Now write the script you want spoken in this voice.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Script to Speak</label>
                  <textarea
                    value={cloneScript}
                    onChange={(e) => setCloneScript(e.target.value)}
                    placeholder="Type the script you want spoken in the cloned voice..."
                    rows={5}
                    style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid var(--ma-border)',
                      borderRadius: 10, padding: '12px 14px', color: '#FFF', fontSize: 13, lineHeight: 1.6,
                      outline: 'none', resize: 'none', fontFamily: 'var(--font-body)',
                      WebkitAppRegion: 'no-drag', WebkitUserSelect: 'auto'
                    }}
                  />
                </div>

                <button
                  onClick={() => { setCloneStep('upload'); setSpeakerEmbeddingUrl(null); setCloneFile(null); }}
                  style={{
                    background: 'transparent', border: '1px solid var(--ma-border)',
                    borderRadius: 8, padding: '8px', color: 'rgba(255,255,255,0.4)',
                    fontSize: 12, cursor: 'pointer'
                  }}
                >← Use a different sample</button>
              </>
            )}
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
          disabled={isGenerating 
            || (activeTab === 'tts' && !script.trim()) 
            || (activeTab === 'clone' && cloneStep === 'upload' && !cloneFile) 
            || (activeTab === 'clone' && cloneStep === 'generate' && !cloneScript.trim()) 
            || (activeTab === 's2s' && !sourceAudio)
          }
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
              {activeTab === 'clone' 
                ? (cloneStep === 'upload' ? 'Cloning Voice...' : 'Generating Speech...') 
                : 'Generating...'}
            </>
          ) : (
            <>
              {activeTab === 'tts' && <Sparkles size={18} />}
              {activeTab === 'clone' && <Mic size={18} />}
              {activeTab === 's2s' && <AudioWaveform size={18} />}
              {activeTab === 'tts' ? 'Generate Voiceover' 
                : activeTab === 'clone' 
                  ? (cloneStep === 'upload' ? 'Clone Voice' : 'Generate with Cloned Voice') 
                  : 'Transform Audio'}
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

function AudioLabRightPanel({ results, scriptLength, activeTab }: { results: any[], scriptLength: number, activeTab: string }) {
  // ElevenLabs pricing: $0.1 per 1000 chars for TTS
  const estimatedCost = activeTab === 'tts' ? ((scriptLength / 1000) * 0.1).toFixed(4) : 'N/A (S2S)';

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
            ${estimatedCost !== 'N/A (S2S)' ? estimatedCost : '0.00'}
          </span>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          {activeTab === 'tts' ? 'ElevenLabs v3: $0.1 per 1k characters' : 'Voice-changer billing depends on audio length'}
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
