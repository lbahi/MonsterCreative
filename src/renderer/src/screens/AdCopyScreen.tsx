import { useEffect, useState } from 'react';
import { FileText, Copy, Wand2, RefreshCw, Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const FRAMEWORKS = [
  { id: 'A_PainKiller', label: 'A — Pain-Killer', color: '#EF4444' },
  { id: 'B_DreamState', label: 'B — Dream-State', color: '#22C55E' },
  { id: 'C_PatternInterrupt', label: 'C — Pattern Interrupt', color: '#6C63FF' },
  { id: 'D_Authority', label: 'D — Authority', color: '#8892B0' }, // Kept neutral/silver for D
  { id: 'E_DirectIntent', label: 'E — Direct Intent', color: '#3B82F6' },
];

const PLATFORMS = ['Meta', 'Google', 'TikTok', 'LinkedIn', 'Twitter'];
const TONES = ['Professional', 'Casual', 'Urgent', 'Playful', 'Bold', 'Empathetic'];

const SAMPLE_COPY: Record<string, any> = {
  A_PainKiller: {
    headlines: ['Tired of generic marketing?', 'Stop wasting ad spend.'],
    hook: "You're pouring money into campaigns that don't convert.",
    body: "Most ad platforms drain your budget with irrelevant clicks. Our AI-driven engine pinpoints your ideal customer instantly.",
    cta: "Start Free Trial",
    triggers: ['Urgency', 'Pain', 'Frustration']
  },
  B_DreamState: {
    headlines: ['Imagine effortless growth.', 'Your sales on autopilot.'],
    hook: "Wake up to a dashboard full of new high-quality leads.",
    body: "We take the guesswork out of lead generation so you can focus on scaling. Picture consistent, predictable revenue every single month.",
    cta: "See How It Works",
    triggers: ['Desire', 'Ease', 'Aspiration']
  },
  C_PatternInterrupt: {
    headlines: ["Wait, you're still doing this manually?", "Everything you know about ads is wrong."],
    hook: "You just lost another customer while writing that last ad.",
    body: "Top agencies aren't guessing anymore. They're using data-backed frameworks to generate 20 variations in seconds. It's time you did too.",
    cta: "Discover the Secret",
    triggers: ['Curiosity', 'Surprise', 'Shock']
  },
  D_Authority: {
    headlines: ["The tool used by 7-figure agencies.", "Join 10,000+ elite marketers."],
    hook: "Amateurs guess. Professionals use optimized frameworks.",
    body: "Built by media buyers who've managed millions in spend. Our platform enforces the exact structures proven to drive the highest ROAS industry wide.",
    cta: "Get Pro Access",
    triggers: ['Trust', 'Status', 'Proof']
  },
  E_DirectIntent: {
    headlines: ["Generate Ad Copy in 30 Seconds.", "Stop Writing. Start Scaling."],
    hook: "Get 5 proven ad frameworks tailored to your product right now.",
    body: "No fluff, just highly converting copy ready to be pasted into your Ads Manager. Generate unlimited variations for one flat monthly price.",
    cta: "Generate Now",
    triggers: ['Logic', 'Clarity', 'Speed']
  }
};

export function AdCopyScreen() {
  const { setRightPanelContent } = useApp();
  
  const [product, setProduct] = useState('');
  const [valueProp, setValueProp] = useState('');
  const [audience, setAudience] = useState('');
  const [action, setAction] = useState('');
  const [platform, setPlatform] = useState('Meta');
  const [tone, setTone] = useState('Professional');
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(['A_PainKiller']);
  
  const [generating, setGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<any[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const toggleFramework = (id: string) => {
    setSelectedFrameworks(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selectedFrameworks.length === 0) return;
    setGenerating(true);
    
    // Simulate API call processing delay before showing variants
    setTimeout(() => {
      const results = selectedFrameworks.map(id => ({
        id,
        ...SAMPLE_COPY[id]
      }));
      setGeneratedResults(results);
      setGenerating(false);
    }, 1500);
  };

  const clearAll = () => {
    setGeneratedResults([]);
  };

  const handleCopy = (text: string, idx: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const InputField = ({ label, value, onChange, isTextarea = false }: any) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{label}</label>
      {isTextarea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', minHeight: 60, padding: '10px 14px',
            background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
            borderRadius: 8, color: '#FFF', fontSize: 13, resize: 'vertical',
            outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
          onBlur={e => e.target.style.borderColor = 'var(--ma-border)'}
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
            borderRadius: 8, color: '#FFF', fontSize: 13,
            outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
          onBlur={e => e.target.style.borderColor = 'var(--ma-border)'}
        />
      )}
    </div>
  );

  useEffect(() => {
    // Clear out the RightPanel since this screen uses a massive split-view layout.
    setRightPanelContent(null);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent]);

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexShrink: 0 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ma-accent)',
        }}>
          <FileText size={16} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
          Ad Copy
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 40, flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Form / Campaign Inputs */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: 8,
          background: 'var(--ma-card)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 24 
        }}>
          
          <h3 style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>
            Campaign Inputs
          </h3>

          <InputField label="Product/Service" value={product} onChange={setProduct} />
          <InputField label="Value Proposition" value={valueProp} onChange={setValueProp} />
          <InputField label="Target Audience" value={audience} onChange={setAudience} />
          <InputField label="Desired Action (CTA)" value={action} onChange={setAction} />

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Platform</label>
            <select
              value={platform} onChange={e => setPlatform(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF',
                fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer', boxSizing: 'border-box'
              }}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Tone</label>
            <select
              value={tone} onChange={e => setTone(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF',
                fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer', boxSizing: 'border-box'
              }}
            >
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <h3 style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>
            Copy Variants
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
            {FRAMEWORKS.map(fw => {
              const isSelected = selectedFrameworks.includes(fw.id);
              return (
                <button
                  key={fw.id}
                  onClick={() => toggleFramework(fw.id)}
                  style={{
                    padding: '8px 12px', textAlign: 'left',
                    background: isSelected ? 'rgba(255,255,255,0.08)' : 'var(--ma-elevated)',
                    border: '1px solid',
                    borderColor: isSelected ? fw.color : 'var(--ma-border)',
                    borderRadius: 8, cursor: 'pointer',
                    fontSize: 12, fontWeight: isSelected ? 500 : 400, color: isSelected ? '#FFF' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.15s'
                  }}
                >
                  {fw.label}
                </button>
              );
            })}
          </div>

          {/* Spacer to push button to bottom if needed */}
          <div style={{ flex: 1 }}></div>

          <button
            onClick={handleGenerate}
            disabled={generating || selectedFrameworks.length === 0}
            style={{
              padding: '16px', background: 'var(--ma-accent)', color: 'white',
              border: 'none', borderRadius: 8, cursor: (generating || selectedFrameworks.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: (generating || selectedFrameworks.length === 0) ? 0.6 : 1, transition: 'all 0.2s', marginTop: 'auto'
            }}
          >
            {generating ? (
              <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating Variants</>
            ) : (
              <><Wand2 size={16} /> Generate Variants</>
            )}
          </button>
        </div>

        {/* Right Column: Results Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Generated Variants</h2>
              {generatedResults.length > 0 && (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{generatedResults.length} variants</span>
              )}
            </div>
            {generatedResults.length > 0 && (
              <button 
                onClick={clearAll}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
                  padding: '4px 12px', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {generatedResults.length === 0 && !generating && (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ma-border)', borderRadius: 12 }}>
                 <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Select variants on the left and click Generate.</p>
               </div>
            )}

            {generating && (
               <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--ma-border)', borderRadius: 12, color: 'rgba(255,255,255,0.5)' }}>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 16, color: 'var(--ma-accent)' }} />
                  <p style={{ fontSize: 14 }}>Drafting multiple copy frameworks...</p>
               </div>
            )}

            {!generating && generatedResults.map(res => {
              const fw = FRAMEWORKS.find(f => f.id === res.id);
              const copyText = `Headline:\n${res.headlines.join('\n')}\n\nHook:\n${res.hook}\n\nBody Copy:\n${res.body}\n\nCTA:\n${res.cta}`;
              
              return (
                <div key={res.id} style={{ 
                  background: 'var(--ma-card)', border: '1px solid var(--ma-border)', 
                  borderLeft: `4px solid ${fw?.color}`, borderRadius: 12, padding: 24, position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div style={{ 
                      background: `${fw?.color}`, color: '#FFF', padding: '6px 14px', 
                      borderRadius: 20, fontSize: 12, fontWeight: 600
                    }}>
                      {fw?.label}
                    </div>
                    <button
                      onClick={() => handleCopy(copyText, res.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedIdx === res.id ? 'var(--ma-green)' : 'rgba(255,255,255,0.4)', padding: 4 }}
                      title="Copy to clipboard"
                    >
                      {copiedIdx === res.id ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  <Section label="Headlines">
                    {res.headlines.map((h: string, i: number) => <div key={i} style={{ fontWeight: 600, color: '#FFF', marginBottom: 4 }}>{h}</div>)}
                  </Section>

                  <Section label="Hook">
                    <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{res.hook}</div>
                  </Section>

                  <Section label="Body Copy">
                    <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{res.body}</div>
                  </Section>

                  <Section label="CTA">
                    <div style={{ 
                      display: 'inline-block', background: 'var(--ma-green)', color: '#000', 
                      padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, marginTop: 4
                    }}>
                      {res.cta}
                    </div>
                  </Section>

                  <Section label="Triggers">
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {res.triggers.map((t: string) => (
                        <span key={t} style={{ 
                          fontSize: 11, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)', 
                          padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' 
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </Section>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Custom scrollbar to match the slick dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 14 }}>
        {children}
      </div>
    </div>
  );
}
