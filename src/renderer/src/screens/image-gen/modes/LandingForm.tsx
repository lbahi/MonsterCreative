import { RefreshCw } from 'lucide-react';

type LandingFormProps = {
  prompt: string;
  setPrompt: (value: string) => void;
};

export function LandingForm({ prompt, setPrompt }: LandingFormProps) {
  return (
    <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
      <button
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--ma-border)',
          borderRadius: 8,
          color: '#FFF',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'var(--font-body)',
          marginBottom: 20,
        }}
      >
        <RefreshCw size={14} /> Sync from Campaign
      </button>

      <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        Hero Image Concept
      </label>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the hero section of your landing page. Include product, brand feel, and target customer..."
        style={{
          width: '100%',
          minHeight: 100,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--ma-border)',
          borderRadius: 8,
          color: '#FFF',
          fontSize: 13,
          padding: '12px 14px',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          boxSizing: 'border-box',
        }}
      />
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Layout Type
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Split Hero', 'Centered', 'Full Bleed'].map((layout) => (
            <button
              key={layout}
              style={{
                padding: '7px 14px',
                background: layout === 'Split Hero' ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${layout === 'Split Hero' ? 'var(--ma-border-accent)' : 'var(--ma-border)'}`,
                borderRadius: 8,
                color: layout === 'Split Hero' ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.4)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {layout}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
