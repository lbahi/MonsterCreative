import { Info, ExternalLink, AlertCircle, Globe } from 'lucide-react';

export const AboutSection = () => {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: '0 0 6px' }}>About</h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>MonsterCreative application information.</p>

      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--ma-accent-glow)',
          }}>
            <span style={{ fontSize: 22 }}>⚡</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0, fontFamily: 'var(--font-display)' }}>MonsterCreative</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>AI-Powered Ad Creative Suite</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Version', value: '1.0.0 (build 20260409)' },
            { label: 'License', value: 'Pro — Active' },
            { label: 'Plan', value: 'Media Buyer Pro' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#FFF', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Documentation', icon: <ExternalLink size={14} /> },
          { label: 'View Changelog', icon: <ExternalLink size={14} /> },
          { label: 'Report a Bug', icon: <AlertCircle size={14} /> },
          { label: 'Privacy Policy', icon: <Globe size={14} /> },
        ].map(item => (
          <button key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--ma-border)', borderRadius: 9,
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13,
            fontFamily: 'var(--font-body)',
          }}>
            {item.label}
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
