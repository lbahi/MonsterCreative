import { useEffect, useState, useCallback } from 'react';
import { Image, Wand2, Shirt, Crop, Monitor, RefreshCw, Download, Check, Sliders, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { StepChecklist, Step } from '../components/ui/StepChecklist';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useNavigate, useLocation } from 'react-router';

const MODES = [
  {
    id: 'generate',
    path: '/image-gen',
    label: 'Generate',
    description: 'Create original ad images from text prompts',
    icon: <Wand2 size={22} />,
    color: '#6C63FF',
  },
  {
    id: 'vton',
    path: '/image-gen/vton',
    label: 'Virtual Try-On',
    description: 'AI Casting Director for your garments',
    icon: <Shirt size={22} />,
    color: '#EC4899',
  },
  {
    id: 'resize',
    path: '/image-gen/resize',
    label: 'Format Resizer',
    description: 'Resize and adapt creatives for every platform',
    icon: <Crop size={22} />,
    color: '#F59E0B',
  },
  {
    id: 'landing',
    path: '/image-gen/landing',
    label: 'Landing Page',
    description: 'Generate a hero image for landing pages',
    icon: <Monitor size={22} />,
    color: '#22C55E',
  },
];

const STYLES = ['Photorealistic', 'Studio Lit', 'Cinematic', 'Editorial', 'Flat Design', 'Illustration', 'Dark Premium', 'Vibrant'];
const RATIOS = ['1:1', '4:5', '9:16', '16:9', '2:3', '1.91:1'];
const MODELS = ['FLUX.1 Pro', 'FLUX.1 Dev', 'FLUX Schnell', 'Stable Diffusion XL'];

const IMG_STEPS: Step[] = [
  { label: 'Processing prompt & context', duration: 800 },
  { label: 'Initializing model', duration: 1200 },
  { label: 'Generating base composition', duration: 2000 },
  { label: 'Applying style refinements', duration: 1500 },
  { label: 'Post-processing & upscaling', duration: 900 },
];

const SAMPLE_OUTPUTS = [
  'https://images.unsplash.com/photo-1771762013405-ad64577dfc55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1591348069836-57e47c84c6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1668260920944-ec171ceb8633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
  'https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500',
];

export function ImageGenScreen() {
  const { setRightPanelContent } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const activeMode = location.pathname.includes('vton') ? 'vton' : location.pathname.includes('resize') ? 'resize' : location.pathname.includes('landing') ? 'landing' : 'generate';

  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [ratio, setRatio] = useState('1:1');
  const [model, setModel] = useState('FLUX.1 Pro');
  const [numImages, setNumImages] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState(0);

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
  };

  const handleStepsComplete = useCallback(() => {
    setGenerating(false);
    setGenerated(true);
    setSelectedOutput(0);
  }, []);

  const handleModeChange = (mode: typeof MODES[0]) => {
    navigate(mode.path);
  };

  const costPerImage = model === 'FLUX.1 Pro' ? 0.048 : model === 'FLUX.1 Dev' ? 0.024 : 0.008;
  const totalCost = (costPerImage * numImages).toFixed(3);

  // Dynamic generate button text based on mode
  const getGenerateButtonText = () => {
    if (activeMode === 'vton') return `Virtual Try-On (${numImages} Images)`;
    if (activeMode === 'resize') return 'Resize All Formats';
    if (activeMode === 'landing') return 'Generate Page Concept';
    return `Generate ${numImages} Images`;
  };

  const getGeneratingText = () => {
    if (activeMode === 'vton') return 'Casting AI & Fitting...';
    if (activeMode === 'resize') return 'Resizing Formats...';
    if (activeMode === 'landing') return 'Designing Hero Layout...';
    return `Generating ${numImages} images...`;
  };

  useEffect(() => {
    setRightPanelContent(
      <ImageGenRightPanel
        generating={generating}
        generated={generated}
        steps={IMG_STEPS}
        onStepsComplete={handleStepsComplete}
        selectedOutput={selectedOutput}
        setSelectedOutput={setSelectedOutput}
        outputs={SAMPLE_OUTPUTS}
        model={model}
        ratio={ratio}
        style={style}
        numImages={numImages}
      />
    );
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, generating, generated, selectedOutput, model, ratio, style, numImages, handleStepsComplete]);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ma-accent)',
        }}>
          <Image size={16} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
          Image Generator
        </h1>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode)}
            style={{
              padding: '16px',
              background: activeMode === mode.id ? `${mode.color}12` : 'var(--ma-elevated)',
              border: `1px solid ${activeMode === mode.id ? mode.color + '55' : 'var(--ma-border)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: activeMode === mode.id ? `0 0 24px ${mode.color}20` : 'none',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: activeMode === mode.id ? `${mode.color}20` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeMode === mode.id ? mode.color + '40' : 'rgba(255,255,255,0.07)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: activeMode === mode.id ? mode.color : 'rgba(255,255,255,0.35)',
              marginBottom: 12,
            }}>
              {mode.icon}
            </div>
            <p style={{
              fontSize: 13, fontWeight: 600, margin: '0 0 4px',
              color: activeMode === mode.id ? '#FFF' : 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-display)',
            }}>
              {mode.label}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: 1.5 }}>
              {mode.description}
            </p>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Form area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeMode === 'generate' && <GenerateForm prompt={prompt} setPrompt={setPrompt} />}
          {activeMode === 'vton' && <VtonForm />}
          {activeMode === 'resize' && <ResizeForm />}
          {activeMode === 'landing' && <LandingForm prompt={prompt} setPrompt={setPrompt} />}

          {/* Common settings */}
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
                    onChange={e => setStyle(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 32px 8px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: 8, color: '#FFF',
                      fontSize: 12, outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {STYLES.map(s => <option key={s} value={s} style={{ background: '#111124' }}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Aspect Ratio</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {RATIOS.map(r => (
                    <button key={r} onClick={() => setRatio(r)} style={{
                      padding: '5px 10px',
                      background: ratio === r ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${ratio === r ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
                      borderRadius: 6, color: ratio === r ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
                      fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Model</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 32px 8px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: 8, color: '#FFF',
                      fontSize: 12, outline: 'none',
                      appearance: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {MODELS.map(m => <option key={m} value={m} style={{ background: '#111124' }}>{m}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 6 }}>Images: {numImages}</label>
                <input
                  type="range" min={1} max={8} value={numImages}
                  onChange={e => setNumImages(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ma-accent)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              width: '100%', padding: '14px 24px',
              background: generating ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
              color: 'white', border: 'none', borderRadius: 10,
              cursor: generating ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: generating ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {generating ? (
              <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> {getGeneratingText()}</>
            ) : (
              <><Wand2 size={16} /> {getGenerateButtonText()}</>
            )}
            <span style={{
              marginLeft: 'auto', fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(0,0,0,0.2)',
              padding: '2px 8px', borderRadius: 10,
            }}>
              ~${totalCost}
            </span>
          </button>

          {/* Output grid */}
          {generated && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {SAMPLE_OUTPUTS.length} Outputs
                </span>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)',
                  borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', fontSize: 11,
                  fontFamily: 'var(--font-body)',
                }}>
                  <Download size={12} /> Download All
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {SAMPLE_OUTPUTS.map((src, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedOutput(i)}
                    style={{
                      borderRadius: 10, overflow: 'hidden',
                      border: `2px solid ${selectedOutput === i ? 'var(--ma-accent)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      boxShadow: selectedOutput === i ? '0 0 20px rgba(108,99,255,0.3)' : 'none',
                      aspectRatio: '1/1',
                    }}
                  >
                    <ImageWithFallback src={src} alt={`Output ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prompt tips */}
        {!generated && (
          <div style={{
            background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
            borderRadius: 12, padding: 20, position: 'sticky', top: 20,
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Prompt Tips
            </p>
            {[
              'Include brand colors and mood',
              'Specify product placement',
              'Mention target demographic',
              'Add lighting preference',
              'Reference visual style (e.g. "studio-lit with soft shadows")',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ma-accent)', marginTop: 6, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function GenerateForm({ prompt, setPrompt }: { prompt: string; setPrompt: (v: string) => void }) {
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Prompt
      </label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="A premium skincare serum product shot on a dark marble surface, studio lighting, shallow depth of field, luxury brand feel, 4K..."
        style={{
          width: '100%', minHeight: 100,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--ma-border)',
          borderRadius: 8, color: '#FFF',
          fontSize: 13, padding: '12px 14px',
          resize: 'vertical', outline: 'none',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--ma-accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--ma-border)')}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Product shot', 'Dark background', 'Luxury', 'Clean composition', 'High contrast'].map(tag => (
          <button
            key={tag}
            onClick={() => setPrompt(prompt + (prompt ? ', ' : '') + tag.toLowerCase())}
            style={{
              padding: '4px 10px', fontSize: 11,
              background: 'rgba(108,99,255,0.1)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 20, color: 'var(--ma-accent-light)',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            + {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function VtonForm() {
  const [dragging, setDragging] = useState(false);
  const [vibe, setVibe] = useState('Studio');
  const VIBES = ['Studio', 'Urban', 'Nature', 'Luxury', 'Vintage', 'Candid'];
  
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Upload Garment
      </label>
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? 'var(--ma-accent)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 10, padding: '28px 20px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 20,
          background: dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
          transition: 'all 0.2s',
        }}
      >
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Drop garment image or click to upload</p>
      </div>

      <label style={{ fontSize: 10, fontWeight: 600, color: '#C1C6D6', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>
        Select Vibe
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {VIBES.map(v => (
          <button
            key={v}
            onClick={() => setVibe(v)}
            style={{
              padding: '6px 0',
              background: vibe === v ? 'var(--ma-accent)' : 'rgba(255,255,255,0.05)',
              color: vibe === v ? '#FFF' : '#B0B3B8',
              borderRadius: 8, border: 'none',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s'
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResizeForm() {
  const TO_FORMATS = ['Meta Feed', 'Meta Story', 'TikTok', 'Google Display', 'Pinterest', 'LinkedIn'];
  const [selected, setSelected] = useState<string[]>(['Meta Feed', 'Meta Story']);
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Upload Source Creative
      </label>
      <div style={{
        border: '2px dashed rgba(255,255,255,0.12)',
        borderRadius: 10, padding: '28px 20px',
        textAlign: 'center', cursor: 'pointer', marginBottom: 16,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Drop image or click to upload</p>
      </div>
      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Export Formats
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TO_FORMATS.map(f => (
          <button key={f} onClick={() => setSelected(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} style={{
            padding: '6px 12px',
            background: selected.includes(f) ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${selected.includes(f) ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
            borderRadius: 20, color: selected.includes(f) ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
            fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>{f}</button>
        ))}
      </div>
    </div>
  );
}

function LandingForm({ prompt, setPrompt }: any) {
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      
      <button style={{
        width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF',
        cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)', marginBottom: 20
      }}>
        <RefreshCw size={14} /> Sync from Campaign
      </button>

      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Hero Image Concept
      </label>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Describe the hero section of your landing page. Include product, brand feel, and target customer..."
        style={{
          width: '100%', minHeight: 100,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--ma-border)',
          borderRadius: 8, color: '#FFF',
          fontSize: 13, padding: '12px 14px',
          resize: 'vertical', outline: 'none',
          fontFamily: 'var(--font-body)', lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      />
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Layout Type
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Split Hero', 'Centered', 'Full Bleed'].map(l => (
            <button key={l} style={{
              padding: '7px 14px',
              background: l === 'Split Hero' ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${l === 'Split Hero' ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
              borderRadius: 8, color: l === 'Split Hero' ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageGenRightPanel({ generating, generated, steps, onStepsComplete, selectedOutput, setSelectedOutput, outputs, model, ratio, style, numImages }: any) {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          Image Panel
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Model: <span style={{ fontFamily: 'var(--font-mono)' }}>{model}</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: numImages }).map((_: any, i: number) => (
              <div key={i} style={{
                flex: 1, aspectRatio: '1/1',
                borderRadius: 8,
                background: 'rgba(108,99,255,0.08)',
                border: '1px solid rgba(108,99,255,0.15)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <StepChecklist steps={steps} onComplete={onStepsComplete} estimatedTime="~14 seconds" />
          <style>{`@keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }`}</style>
        </div>
      )}

      {!generating && !generated && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Model" value={model} mono />
            <InfoRow label="Style" value={style} />
            <InfoRow label="Ratio" value={ratio} mono />
            <InfoRow label="Quantity" value={`${numImages} images`} />
            <InfoRow label="Est. cost" value={`~$${(0.048 * numImages).toFixed(3)}`} mono green />
            <InfoRow label="Est. time" value="~14 seconds" />
          </div>
        </div>
      )}

      {generated && (
        <div style={{ padding: 20 }}>
          <div style={{
            padding: 12, borderRadius: 8,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
          }}>
            <Check size={14} style={{ color: 'var(--ma-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>4 images generated</span>
          </div>

          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <ImageWithFallback
              src={outputs[selectedOutput]}
              alt="Selected output"
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
            {outputs.map((src: string, i: number) => (
              <div
                key={i}
                onClick={() => setSelectedOutput(i)}
                style={{
                  borderRadius: 6, overflow: 'hidden', cursor: 'pointer', aspectRatio: '1/1',
                  border: `2px solid ${selectedOutput === i ? 'var(--ma-accent)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <ImageWithFallback src={src} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{
              width: '100%', padding: '10px', background: 'var(--ma-accent)',
              border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)',
            }}>
              <Download size={14} /> Download Selected
            </button>
            <button style={{
              width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--ma-border)', borderRadius: 8, color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6, fontFamily: 'var(--font-body)',
            }}>
              <Download size={14} /> Download All (ZIP)
            </button>
          </div>

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Model" value={model} mono />
            <InfoRow label="Cost" value="$0.192" mono green />
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
      }}>
        {value}
      </span>
    </div>
  );
}
