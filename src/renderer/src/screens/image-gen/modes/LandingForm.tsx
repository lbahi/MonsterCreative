import { LayoutTemplate } from 'lucide-react';

export function LandingForm() {
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
      minHeight: 300
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(108,99,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ma-accent)'
      }}>
        <LayoutTemplate size={28} />
      </div>
      
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: '0 0 8px' }}>Landing Page Wizard</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 auto', maxWidth: 400, lineHeight: 1.6 }}>
          Generate high-conversion, dual-mode (HTML/Image) hero sections automatically synced with your active campaigns.
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
