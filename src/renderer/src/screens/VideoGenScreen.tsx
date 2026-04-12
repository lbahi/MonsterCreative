import { useState, useCallback, useEffect } from 'react';
import { Video, Film, Layers, Play, Pause, Wand2, RefreshCw, Download, Check, Volume2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { StepChecklist, Step } from '../components/ui/StepChecklist';
import { useNavigate, useLocation } from 'react-router';

const MODES = [
  {
    id: 'text',
    path: '/video-gen/text',
    label: 'Text to Video',
    description: 'Generate video from a text prompt',
    icon: <Film size={22} />,
    color: '#EC4899',
  },
  {
    id: 'image',
    path: '/video-gen/image',
    label: 'Image to Video',
    description: 'Animate a static image into video',
    icon: <Layers size={22} />,
    color: '#8B5CF6',
  },
];

const VIDEO_STEPS: Step[] = [
  { label: 'Processing scene description', duration: 900 },
  { label: 'Initializing Kling model', duration: 1400 },
  { label: 'Generating keyframes', duration: 3000 },
  { label: 'Rendering motion sequences', duration: 3500 },
  { label: 'Encoding final video', duration: 1200 },
];

const MODELS = [
  { id: 'kling-1.6', label: 'Kling 1.6 Pro', cost: 0.16, seconds: 45 },
  { id: 'kling-1.5', label: 'Kling 1.5', cost: 0.10, seconds: 35 },
  { id: 'wan-2.1', label: 'Wan 2.1', cost: 0.08, seconds: 55 },
  { id: 'hailuo', label: 'Hailuo-AI', cost: 0.12, seconds: 40 },
];

const DURATIONS = [3, 5, 8, 10];
const MOTION_STYLES = ['Cinematic', 'Dynamic', 'Smooth', 'Handheld', 'Static'];

export function VideoGenScreen() {
  const { setRightPanelContent } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const activeMode = location.pathname.includes('image') ? 'image' : 'text';

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('kling-1.6');
  const [duration, setDuration] = useState(5);
  const [motionStyle, setMotionStyle] = useState('Cinematic');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);

  const currentModel = MODELS.find(m => m.id === model) || MODELS[0];
  const totalCost = currentModel.cost;

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setPlaying(false);
  };

  const handleStepsComplete = useCallback(() => {
    setGenerating(false);
    setGenerated(true);
  }, []);

  const handleModeChange = (mode: typeof MODES[0]) => {
    navigate(mode.path);
  };

  useEffect(() => {
    setRightPanelContent(
      <VideoGenRightPanel
        generating={generating}
        generated={generated}
        steps={VIDEO_STEPS}
        onStepsComplete={handleStepsComplete}
        playing={playing}
        setPlaying={setPlaying}
        model={currentModel}
        duration={duration}
        motionStyle={motionStyle}
      />
    );
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, generating, generated, playing, currentModel, duration, motionStyle, handleStepsComplete]);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(236,72,153,0.15)',
          border: '1px solid rgba(236,72,153,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#EC4899',
        }}>
          <Video size={16} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
          Video Generator
        </h1>
      </div>

      {/* Mode selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode)}
            style={{
              padding: '20px',
              background: activeMode === mode.id ? `${mode.color}12` : 'var(--ma-elevated)',
              border: `1px solid ${activeMode === mode.id ? mode.color + '55' : 'var(--ma-border)'}`,
              borderRadius: 12,
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: activeMode === mode.id ? `0 0 28px ${mode.color}20` : 'none',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: activeMode === mode.id ? `${mode.color}20` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeMode === mode.id ? mode.color + '40' : 'rgba(255,255,255,0.07)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: activeMode === mode.id ? mode.color : 'rgba(255,255,255,0.3)',
              marginBottom: 14,
            }}>
              {mode.icon}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: activeMode === mode.id ? '#FFF' : 'rgba(255,255,255,0.5)', margin: '0 0 6px', fontFamily: 'var(--font-display)' }}>
              {mode.label}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0 }}>{mode.description}</p>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Prompt */}
        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {activeMode === 'text' ? 'Video Prompt' : 'Animation Description'}
          </label>

          {activeMode === 'image' && (
            <div style={{
              border: '2px dashed rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '28px',
              textAlign: 'center', cursor: 'pointer', marginBottom: 14,
            }}>
              <Layers size={28} style={{ color: 'rgba(255,255,255,0.2)', display: 'block', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>Upload source image to animate</p>
            </div>
          )}

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder={activeMode === 'text'
              ? 'A premium skincare product bottle floating in slow motion, dark luxury background, particle effects, cinematic lighting, 4K...'
              : 'Describe how the image should animate: subtle zoom, drift left, particles floating...'
            }
            style={{
              width: '100%', minHeight: 110,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--ma-border)',
              borderRadius: 8, color: '#FFF',
              fontSize: 13, padding: '12px 14px',
              resize: 'vertical', outline: 'none',
              fontFamily: 'var(--font-body)', lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#EC4899')}
            onBlur={e => (e.target.style.borderColor = 'var(--ma-border)')}
          />
        </div>

        {/* Settings row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {/* Model */}
          <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Model</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} style={{
                  padding: '8px 10px',
                  background: model === m.id ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${model === m.id ? 'rgba(236,72,153,0.4)' : 'var(--ma-border)'}`,
                  borderRadius: 7, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 12, color: model === m.id ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: model === m.id ? 'var(--ma-green)' : 'rgba(255,255,255,0.25)' }}>
                    ${m.cost}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Duration</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: '8px 10px',
                  background: duration === d ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${duration === d ? 'rgba(236,72,153,0.4)' : 'var(--ma-border)'}`,
                  borderRadius: 7, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 12, color: duration === d ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{d} seconds</span>
                  {duration === d && <Check size={12} style={{ color: '#EC4899' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Style */}
          <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
            <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Motion Style</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MOTION_STYLES.map(ms => (
                <button key={ms} onClick={() => setMotionStyle(ms)} style={{
                  padding: '8px 10px',
                  background: motionStyle === ms ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${motionStyle === ms ? 'rgba(236,72,153,0.4)' : 'var(--ma-border)'}`,
                  borderRadius: 7, cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--font-body)',
                }}>
                  <span style={{ fontSize: 12, color: motionStyle === ms ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{ms}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%', padding: '14px 24px',
            background: generating ? 'rgba(236,72,153,0.3)' : '#EC4899',
            color: 'white', border: 'none', borderRadius: 10,
            cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: generating ? 'none' : '0 0 28px rgba(236,72,153,0.35)',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-body)',
          }}
        >
          {generating ? (
            <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating video...</>
          ) : (
            <><Wand2 size={16} /> Generate {duration}s Video</>
          )}
          <span style={{
            marginLeft: 'auto', fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(0,0,0,0.2)',
            padding: '2px 8px', borderRadius: 10,
          }}>
            ~${totalCost.toFixed(2)}
          </span>
        </button>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function VideoGenRightPanel({ generating, generated, steps, onStepsComplete, playing, setPlaying, model, duration, motionStyle }: any) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) { setProgress(0); return; }
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { setPlaying(false); return 0; }
        return prev + 100 / (duration * 10);
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, duration, setPlaying]);

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          Video Panel
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Model: <span style={{ fontFamily: 'var(--font-mono)' }}>{model.label}</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '24px 20px' }}>
          {/* Video placeholder skeleton */}
          <div style={{
            width: '100%', aspectRatio: '16/9', borderRadius: 10,
            background: 'rgba(236,72,153,0.06)',
            border: '1px solid rgba(236,72,153,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(236,72,153,0.06), transparent)',
              animation: 'shimmer 1.5s linear infinite',
              backgroundSize: '200% 100%',
            }} />
            <Video size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
          <StepChecklist steps={steps} onComplete={onStepsComplete} estimatedTime={`~${model.seconds} seconds`} />
          <style>{`
            @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
          `}</style>
        </div>
      )}

      {!generating && !generated && (
        <div style={{ padding: 20 }}>
          {/* Empty video player */}
          <div style={{
            width: '100%', aspectRatio: '16/9', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px dashed rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Video size={28} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Preview will appear here</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Model" value={model.label} />
            <InfoRow label="Duration" value={`${duration}s`} mono />
            <InfoRow label="Motion" value={motionStyle} />
            <InfoRow label="Est. cost" value={`$${model.cost.toFixed(2)}`} mono green />
            <InfoRow label="Est. time" value={`~${model.seconds}s`} />
          </div>
        </div>
      )}

      {generated && (
        <div style={{ padding: 20 }}>
          <div style={{
            padding: 10, borderRadius: 8,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
          }}>
            <Check size={13} style={{ color: 'var(--ma-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>Video ready</span>
          </div>

          {/* Inline video player */}
          <div style={{
            width: '100%', aspectRatio: '16/9', borderRadius: 10,
            background: 'linear-gradient(135deg, #0A0A1A 0%, #1A0A2E 50%, #0A0A1A 100%)',
            position: 'relative', overflow: 'hidden', marginBottom: 16,
            cursor: 'pointer',
          }} onClick={() => setPlaying(!playing)}>
            {/* Fake video content */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(236,72,153,0.2) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(139,92,246,0.15) 0%, transparent 60%)',
            }} />

            {/* Video progress overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              background: 'rgba(255,255,255,0.1)',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: '#EC4899',
                transition: 'width 0.1s linear',
              }} />
            </div>

            {/* Play/Pause */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'opacity 0.2s',
                opacity: playing ? 0 : 1,
              }}>
                {playing ? <Pause size={20} color="white" /> : <Play size={20} color="white" style={{ marginLeft: 3 }} />}
              </div>
            </div>

            {/* Duration badge */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              fontSize: 10, fontFamily: 'var(--font-mono)',
              background: 'rgba(0,0,0,0.6)', padding: '3px 7px', borderRadius: 5,
              color: 'rgba(255,255,255,0.8)',
            }}>
              {playing ? `${Math.floor(duration * progress / 100)}s` : `${duration}s`}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button onClick={() => setPlaying(!playing)} style={{
              padding: '8px 14px', background: playing ? 'rgba(236,72,153,0.15)' : 'var(--ma-accent)',
              border: playing ? '1px solid rgba(236,72,153,0.3)' : 'none',
              borderRadius: 7, color: 'white', cursor: 'pointer',
              fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--font-body)',
            }}>
              {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} style={{ marginLeft: 1 }} /> Play</>}
            </button>
            <Volume2 size={16} style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 'auto' }} />
            <input type="range" style={{ width: 60, accentColor: '#EC4899' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{
              width: '100%', padding: '10px', background: '#EC4899',
              border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)',
            }}>
              <Download size={14} /> Download MP4
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{
                flex: 1, padding: '8px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)', borderRadius: 7, color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)',
              }}>
                GIF
              </button>
              <button style={{
                flex: 1, padding: '8px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)', borderRadius: 7, color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-body)',
              }}>
                Frames
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--ma-border)', paddingTop: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoRow label="Model" value={model.label} />
              <InfoRow label="Duration" value={`${duration}s`} mono />
              <InfoRow label="Cost" value={`$${model.cost.toFixed(2)}`} mono green />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, green }: { label: string; value: any; mono?: boolean; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span style={{
        fontSize: 12,
        color: green ? 'var(--ma-green)' : '#FFF',
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      }}>{value}</span>
    </div>
  );
}
