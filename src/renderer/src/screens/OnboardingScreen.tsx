import { useState } from 'react';
import { Eye, EyeOff, Key, ChevronRight, X, Zap, Globe, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const STEPS = [
  { title: 'fal.ai API Key', description: 'Powers Image & Video generation via the fal.ai platform.' },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [phase, setPhase] = useState<'welcome' | 'wizard'>('welcome');
  const [falKey, setFalKey] = useState('');
  const [showFal, setShowFal] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7,7,15,0.94)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
    }}>
      {phase === 'welcome' ? (
        <WelcomePhase onGetStarted={() => setPhase('wizard')} onSkip={onComplete} />
      ) : (
        <WizardPhase
          falKey={falKey}
          setFalKey={setFalKey}
          showFal={showFal}
          setShowFal={setShowFal}
          onNext={() => {
            // Here you can save the fal.ai key securely before completing
            onComplete();
          }}
          onSkip={onComplete}
        />
      )}
    </div>
  );
}

function WelcomePhase({ onGetStarted, onSkip }: { onGetStarted: () => void; onSkip: () => void }) {
  return (
    <div style={{
      width: 680,
      background: 'var(--ma-elevated)',
      border: '1px solid var(--ma-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
    }}>
      {/* Video placeholder */}
      <div style={{
        width: '100%',
        height: 320,
        background: 'linear-gradient(135deg, #07070F 0%, #0F0F2A 40%, #1A0F3A 70%, #07070F 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Animated glow orbs */}
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(155,143,255,0.2) 0%, transparent 70%)',
          top: '30%', left: '30%',
        }} />

        {/* Video play area */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(108,99,255,0.2)',
            border: '2px solid rgba(108,99,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(108,99,255,0.3)',
          }}>
            <div style={{
              width: 0, height: 0,
              borderLeft: '26px solid rgba(255,255,255,0.9)',
              borderTop: '16px solid transparent',
              borderBottom: '16px solid transparent',
              marginLeft: 6,
            }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>
            WELCOME TO MOSTERADS — 2:34
          </p>
        </div>

        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '36px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px var(--ma-accent-glow)',
          }}>
            <Zap size={14} color="white" />
          </div>
          <span style={{ color: 'var(--ma-accent-light)', fontSize: 12, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            MosterAds AI Suite
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: '-0.5px',
        }}>
          Build ads that convert.<br />
          <span style={{ color: 'var(--ma-accent-light)' }}>At the speed of AI.</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
          Generate high-converting ad creatives, copy, and videos — powered by the best AI models. Connected to your ad accounts in minutes.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onGetStarted}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 28px',
              background: 'var(--ma-accent)',
              color: 'white', border: 'none',
              borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
              boxShadow: '0 0 24px rgba(108,99,255,0.4)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            Get Started <ArrowRight size={16} />
          </button>
          <button
            onClick={onSkip}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid var(--ma-border)',
              borderRadius: 10, cursor: 'pointer', fontSize: 14,
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function WizardPhase(props: any) {
  const { falKey, setFalKey, showFal, setShowFal, onNext, onSkip } = props;

  return (
    <div style={{
      width: 560,
      background: 'var(--ma-elevated)',
      border: '1px solid var(--ma-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px',
        borderBottom: '1px solid var(--ma-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px var(--ma-accent-glow)',
        }}>
          <Key size={16} color="white" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>
            {STEPS[0].title}
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{STEPS[0].description}</p>
        </div>
        <button onClick={onSkip} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <APIKeyStep
          label="fal.ai API Key"
          value={falKey}
          onChange={setFalKey}
          show={showFal}
          toggleShow={() => setShowFal(!showFal)}
          placeholder="fal-..."
          hint="Found at fal.ai/dashboard/keys"
        />

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
          <button
            onClick={onSkip}
            style={{
              padding: '10px 20px', background: 'transparent',
              color: 'rgba(255,255,255,0.4)', border: '1px solid var(--ma-border)',
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font-body)',
            }}
          >
            Skip setup
          </button>

          <button
            onClick={onNext}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px',
              background: 'var(--ma-accent)', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              boxShadow: '0 0 20px rgba(108,99,255,0.35)',
              fontFamily: 'var(--font-body)',
            }}
          >
            Launch MosterAds <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function APIKeyStep({ label, value, onChange, show, toggleShow, placeholder, hint }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 48px 12px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--ma-border)',
            borderRadius: 10, color: '#FFFFFF',
            fontSize: 13, outline: 'none',
            fontFamily: 'var(--font-mono)',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--ma-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--ma-border)')}
        />
        <button
          onClick={toggleShow}
          style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Globe size={11} /> {hint}
      </p>

      <div style={{
        marginTop: 20, padding: 16, borderRadius: 10,
        background: 'rgba(108,99,255,0.08)',
        border: '1px solid rgba(108,99,255,0.15)',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          🔒 Your API key is stored locally and never sent to MosterAds servers. All requests go directly from your device to the API provider.
        </p>
      </div>
    </div>
  );
}
