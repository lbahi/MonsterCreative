import { useEffect } from 'react';
import { Music2, Mic, AudioWaveform, Bell } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function AudioLabScreen() {
  const { setRightPanelContent } = useApp();

  useEffect(() => {
    setRightPanelContent(<AudioLabRightPanel />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent]);

  return (
    <div style={{
      padding: '32px 36px',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
    }}>
      {/* Animated background */}
      <div style={{ position: 'relative', marginBottom: 48, textAlign: 'center' }}>
        {/* Pulsing rings */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80 + i * 60,
            height: 80 + i * 60,
            borderRadius: '50%',
            border: `1px solid rgba(245,158,11,${0.15 - i * 0.04})`,
            animation: `ring-pulse 2.5s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }} />
        ))}

        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 2,
          boxShadow: '0 0 60px rgba(245,158,11,0.15)',
          margin: '0 auto',
        }}>
          <Music2 size={40} style={{ color: '#F59E0B' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 20, padding: '6px 16px',
          marginBottom: 20,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px #F59E0B' }} />
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Coming Soon
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 40,
          fontWeight: 800,
          color: '#FFFFFF',
          margin: '0 0 16px',
          letterSpacing: '-1px',
          lineHeight: 1.1,
        }}>
          Audio Lab
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7, margin: '0 0 36px',
        }}>
          AI-powered voiceovers, background music, and sound design for your video ads. We're building something special.
        </p>

        {/* Feature previews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 40, textAlign: 'left' }}>
          {[
            { icon: <Mic size={18} />, title: 'AI Voiceovers', desc: '40+ voices, 20+ languages', color: '#F59E0B' },
            { icon: <Music2 size={18} />, title: 'Music Beds', desc: 'Royalty-free, mood-matched', color: '#EC4899' },
            { icon: <AudioWaveform size={18} />, title: 'Sound Effects', desc: 'Platform-optimized SFX', color: '#6C63FF' },
            { icon: <Bell size={18} />, title: 'Jingle Gen', desc: 'Brand jingles in seconds', color: '#22C55E' },
          ].map((f, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: 12,
              opacity: 0.7,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${f.color}18`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 10,
              }}>
                {f.icon}
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FFF', margin: '0 0 4px' }}>{f.title}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Notify form */}
        <div style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12, padding: 24,
        }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#FFF', margin: '0 0 4px' }}>
            Get notified when it drops
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
            Be first in line. Early access pricing available.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1, padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8, color: '#FFF',
                fontSize: 13, outline: 'none',
                fontFamily: 'var(--font-body)',
              }}
            />
            <button style={{
              padding: '10px 20px',
              background: '#F59E0B', color: '#000',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}>
              Notify Me
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ring-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function AudioLabRightPanel() {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          Audio Lab
        </h3>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '4px 10px' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }} />
          <span style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600 }}>COMING SOON</span>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
          Audio Lab is in active development. Expected launch: Q3 2026.
        </p>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Voiceover generation', 'Music bed selection', 'SFX library', 'Audio mixing', 'Export formats'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
