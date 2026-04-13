import { useState } from 'react';
import { Eye, EyeOff, Key, ChevronRight, Zap, Globe, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

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
  const [validating, setValidating] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const { refreshConnectionStatus, completeOnboarding } = useApp();

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleLaunch = async () => {
    if (!falKey.trim()) {
      setKeyError('Please enter your fal.ai API key to continue.');
      triggerShake();
      return;
    }
    setValidating(true);
    setKeyError(null);
    try {
      // Smoke test BEFORE saving to keystore
      const result = await window.api.fal.validateKey(falKey.trim());
      if (result.valid) {
        // Save to secure store only after validation passes
        await window.api.keystore.setFalKey(falKey.trim());
        // Update context status
        await refreshConnectionStatus();
        completeOnboarding();
        onComplete();
      } else {
        setKeyError(result.error || 'Invalid API key. Please check your fal.ai dashboard.');
        triggerShake();
      }
    } catch {
      setKeyError('Network error. Please check your connection and try again.');
      triggerShake();
    } finally {
      setValidating(false);
    }
  };

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
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        .shake { animation: shake 0.6s ease-out; }
      `}</style>

      {phase === 'welcome' ? (
        <WelcomePhase onGetStarted={() => setPhase('wizard')} />
      ) : (
        <WizardPhase
          falKey={falKey}
          setFalKey={setFalKey}
          showFal={showFal}
          setShowFal={setShowFal}
          validating={validating}
          keyError={keyError}
          shake={shake}
          onNext={handleLaunch}
        />
      )}
    </div>
  );
}

function WelcomePhase({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div style={{
      width: 680,
      background: 'var(--ma-elevated)',
      border: '1px solid var(--ma-border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
    }}>
      {/* Video */}
      <div style={{ width: '100%', height: 382, background: '#000', position: 'relative', overflow: 'hidden' }}>
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/Mlt0BqtmOls?autoplay=1&mute=1&loop=1&playlist=Mlt0BqtmOls&controls=0&modestbranding=1&rel=0"
          title="MonsterCreative Promo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 'none' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ma-elevated), transparent 40%)', pointerEvents: 'none' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '36px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            MonsterCreative AI Suite
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
          color: '#FFFFFF', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.5px',
        }}>
          Build ads that convert.<br />
          <span style={{ color: 'var(--ma-accent-light)' }}>At the speed of AI.</span>
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, marginBottom: 32, maxWidth: 480 }}>
          Generate high-converting ad copy, audio, and videos — powered by the best AI models. Connected to your ad accounts in minutes.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onGetStarted}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 48px',
              background: 'var(--ma-accent)', color: 'white', border: 'none',
              borderRadius: 10, cursor: 'pointer', fontSize: 15, fontWeight: 700,
              boxShadow: '0 0 32px rgba(108,99,255,0.45)', transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function WizardPhase({ falKey, setFalKey, showFal, setShowFal, validating, keyError, shake, onNext }: any) {
  return (
    <div
      className={shake ? 'shake' : ''}
      style={{
        width: 560,
        background: 'var(--ma-elevated)',
        border: `1px solid ${keyError ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: keyError
          ? '0 40px 120px rgba(7,7,15,0.8), 0 0 40px rgba(239,68,68,0.15)'
          : '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--ma-border)', display: 'flex', alignItems: 'center', gap: 16 }}>
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
        <div style={{ marginLeft: 'auto', width: 18 }} />
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <APIKeyStep
          label="fal.ai API Key"
          value={falKey}
          onChange={(v: string) => { setFalKey(v); }}
          show={showFal}
          toggleShow={() => setShowFal(!showFal)}
          placeholder="fal-..."
          hasError={!!keyError}
          hint={
            <span>
              Bring your own fal.ai API key{' '}
              <a
                href="https://fal.ai/dashboard/keys"
                onClick={(e) => {
                  e.preventDefault();
                  window.api.external.open('https://fal.ai/dashboard/keys');
                }}
                style={{ color: '#FFFFFF', textDecoration: 'underline', fontWeight: 600 }}
              >
                click here
              </a>
            </span>
          }
        />

        {/* Error message */}
        {keyError && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#EF4444', margin: 0, lineHeight: 1.5 }}>{keyError}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <button
            onClick={onNext}
            disabled={validating}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 28px',
              background: validating ? 'rgba(108,99,255,0.5)' : 'var(--ma-accent)',
              color: 'white', border: 'none', borderRadius: 8,
              cursor: validating ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 600,
              boxShadow: validating ? 'none' : '0 0 20px rgba(108,99,255,0.35)',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
              minWidth: 200,
              justifyContent: 'center',
            }}
          >
            {validating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                Launch MonsterCreative <ChevronRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function APIKeyStep({ label, value, onChange, show, toggleShow, placeholder, hint, hasError }: any) {
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
            background: hasError ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hasError ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
            borderRadius: 10, color: '#FFFFFF',
            fontSize: 13, outline: 'none',
            fontFamily: 'var(--font-mono)',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.6)' : 'var(--ma-accent)')}
          onBlur={e => (e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)')}
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
        <Globe size={11} />
        {hint}
      </p>

      <div style={{
        marginTop: 20, padding: 16, borderRadius: 10,
        background: 'rgba(108,99,255,0.08)',
        border: '1px solid rgba(108,99,255,0.15)',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          🔒 Your API key is stored locally and never sent to MonsterCreative servers. All requests go directly from your device to the API provider.
        </p>
      </div>
    </div>
  );
}
