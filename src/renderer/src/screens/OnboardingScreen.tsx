import React, { useState } from 'react'
import {
  Eye,
  EyeOff,
  Key,
  ChevronRight,
  Zap,
  Globe,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'

interface OnboardingModalProps {
  onComplete: () => void
}

const STEPS = [
  {
    title: 'MonsterCreative License',
    description: 'Activate your license key to unlock the full suite.'
  },
  {
    title: 'fal.ai API Key',
    description: 'Powers Image & Video generation via the fal.ai platform.'
  }
]

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { refreshConnectionStatus, completeOnboarding, isLicenseValid } = useApp()
  const [phase, setPhase] = useState<'welcome' | 'wizard'>('welcome')
  const [currentStep, setCurrentStep] = useState(isLicenseValid ? 1 : 0)

  // License key state
  const [licenseKey, setLicenseKey] = useState('')
  const [licenseValidating, setLicenseValidating] = useState(false)
  const [licenseError, setLicenseError] = useState<string | null>(null)
  const [licenseActivated, setLicenseActivated] = useState(false)
  const [activationDetails, setActivationDetails] = useState<{planName?: string, installId?: string, alreadyActive?: boolean}>({})

  // Fal key state
  const [falKey, setFalKey] = useState('')
  const [showFal, setShowFal] = useState(false)
  const [falValidating, setFalValidating] = useState(false)
  const [falError, setFalError] = useState<string | null>(null)

  const [shake, setShake] = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleActivateLicense = async () => {
    if (!licenseKey.trim()) {
      setLicenseError('Please enter your MonsterCreative license key.')
      triggerShake()
      return
    }
    setLicenseValidating(true)
    setLicenseError(null)
    try {
      const result = await window.api.license.activate(licenseKey.trim())
      if (result.success) {
        setActivationDetails({
          planName: result.planName,
          installId: result.installId,
          alreadyActive: result.alreadyActive
        })
        setLicenseActivated(true)
        setCurrentStep(1)
      } else {
        setLicenseError(result.error || 'License activation failed. Please check your key.')
        triggerShake()
      }
    } catch (err: unknown) {
      setLicenseError('Network error. Please check your connection and try again.')
      triggerShake()
    } finally {
      setLicenseValidating(false)
    }
  }

  const handleLaunch = async () => {
    if (!falKey.trim()) {
      setFalError('Please enter your fal.ai API key to continue.')
      triggerShake()
      return
    }
    setFalValidating(true)
    setFalError(null)
    try {
      // Smoke test BEFORE saving to keystore
      const result = await window.api.fal.validateKey(falKey.trim())
      if (result.valid) {
        // Save to secure store only after validation passes
        await window.api.keystore.setFalKey(falKey.trim())
        // Update context status
        await refreshConnectionStatus()
        completeOnboarding()
        onComplete()
      } else {
        setFalError(result.error || 'Invalid API key. Please check your fal.ai dashboard.')
        triggerShake()
      }
    } catch (err: unknown) {
      setFalError('Network error. Please check your connection and try again.')
      triggerShake()
    } finally {
      setFalValidating(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7,7,15,0.94)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)'
      }}
    >
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
      ) : currentStep === 0 ? (
        <LicenseStep
          licenseKey={licenseKey}
          setLicenseKey={setLicenseKey}
          validating={licenseValidating}
          error={licenseError}
          shake={shake}
          onActivate={handleActivateLicense}
        />
      ) : (
        <FalKeyStep
          falKey={falKey}
          setFalKey={setFalKey}
          showFal={showFal}
          setShowFal={setShowFal}
          validating={falValidating}
          error={falError}
          shake={shake}
          licenseActivated={licenseActivated}
          activationDetails={activationDetails}
          onNext={handleLaunch}
        />
      )}
    </div>
  )
}

function WelcomePhase({ onGetStarted }: { onGetStarted: () => void }) {

  return (
    <div
      style={{
        width: 840,
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)'
      }}
    >
      {/* Video — webview with spoofed Chrome UA so YouTube allows playback */}
      <div
        style={{
          width: '100%',
          height: 472,
          background: '#000',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* YouTube thumbnail shown while webview loads */}
        <img
          src="https://i.ytimg.com/vi/Mlt0BqtmOls/maxresdefault.jpg"
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.5,
            zIndex: 0
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://i.ytimg.com/vi/Mlt0BqtmOls/hqdefault.jpg'
          }}
        />

        {/* @ts-ignore - webview is an Electron-specific element */}
        <webview
          src="https://www.youtube.com/embed/Mlt0BqtmOls?autoplay=1&mute=1&loop=1&playlist=Mlt0BqtmOls&controls=1&modestbranding=1&rel=0"
          useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
          partition="youtube"
          style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 1 } as React.CSSProperties}
          allowpopups={true}
        />

        {/* Bottom gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, var(--ma-elevated), transparent)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: '36px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--ma-accent-glow)'
            }}
          >
            <Zap size={14} color="white" />
          </div>
          <span
            style={{
              color: 'var(--ma-accent-light)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            MonsterCreative AI Suite
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: 12,
            letterSpacing: '-0.5px'
          }}
        >
          Build ads that convert.
          <br />
          <span style={{ color: 'var(--ma-accent-light)' }}>At the speed of AI.</span>
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
            lineHeight: 1.6,
            marginBottom: 32,
            maxWidth: 480
          }}
        >
          Generate high-converting ad copy, audio, and videos — powered by the best AI models.
          Connected to your ad accounts in minutes.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onGetStarted}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 48px',
              background: 'var(--ma-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 700,
              boxShadow: '0 0 32px rgba(108,99,255,0.45)',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)'
            }}
          >
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function LicenseStep({
  licenseKey,
  setLicenseKey,
  validating,
  error,
  shake,
  onActivate
}: {
  licenseKey: string
  setLicenseKey: (v: string) => void
  validating: boolean
  error: string | null
  shake: boolean
  onActivate: () => void
}) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div
      className={shake ? 'shake' : ''}
      style={{
        width: 560,
        background: 'var(--ma-elevated)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: error
          ? '0 40px 120px rgba(7,7,15,0.8), 0 0 40px rgba(239,68,68,0.15)'
          : '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--ma-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--ma-accent-glow)'
          }}
        >
          <Shield size={16} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFF',
              margin: 0
            }}
          >
            {STEPS[0].title}
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {STEPS[0].description}
          </p>
        </div>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--ma-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: 'white'
            }}
          >
            1
          </div>
          <div style={{ width: 16, height: 1, background: 'var(--ma-border)' }} />
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)'
            }}
          >
            2
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 8
            }}
          >
            License Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              style={{
                width: '100%',
                padding: '12px 48px 12px 16px',
                background: error ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
                borderRadius: 10,
                color: '#FFFFFF',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'var(--ma-accent)')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)')
              }
              onKeyDown={(e) => e.key === 'Enter' && onActivate()}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Globe size={11} />
            <span>Your license key was emailed to you by Freemius after purchase. Check your inbox.</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8
            }}
          >
            <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#EF4444', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            background: 'rgba(108,99,255,0.08)',
            border: '1px solid rgba(108,99,255,0.15)'
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
            🔒 Your license is validated securely with Freemius and stored locally in your OS
            keychain. It is never shared with third parties.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button
            onClick={async () => {
              await window.api.license.getCheckoutUrl()
            }}
            type="button"
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid var(--ma-border)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            Buy MonsterCreative — $39
          </button>
          <button
            onClick={onActivate}
            disabled={validating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 28px',
              background: validating ? 'rgba(108,99,255,0.5)' : 'var(--ma-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: validating ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: validating ? 'none' : '0 0 20px rgba(108,99,255,0.35)',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
              minWidth: 180,
              justifyContent: 'center'
            }}
          >
            {validating ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Activating...
              </>
            ) : (
              <>
                Validate & Activate <ChevronRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function FalKeyStep({
  falKey,
  setFalKey,
  showFal,
  setShowFal,
  validating,
  error,
  shake,
  licenseActivated,
  activationDetails,
  onNext
}: {
  falKey: string
  setFalKey: (v: string) => void
  showFal: boolean
  setShowFal: (v: boolean) => void
  validating: boolean
  error: string | null
  shake: boolean
  licenseActivated: boolean
  activationDetails: {planName?: string, installId?: string, alreadyActive?: boolean}
  onNext: () => void
}) {
  return (
    <div
      className={shake ? 'shake' : ''}
      style={{
        width: 560,
        background: 'var(--ma-elevated)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: error
          ? '0 40px 120px rgba(7,7,15,0.8), 0 0 40px rgba(239,68,68,0.15)'
          : '0 40px 120px rgba(7,7,15,0.8), 0 0 60px rgba(108,99,255,0.1)',
        transition: 'border-color 0.3s, box-shadow 0.3s'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--ma-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--ma-accent-glow)'
          }}
        >
          <Key size={16} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 700,
              color: '#FFF',
              margin: 0
            }}
          >
            {STEPS[1].title}
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {STEPS[1].description}
          </p>
        </div>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={13} style={{ color: '#22C55E' }} />
          </div>
          <div style={{ width: 16, height: 1, background: '#22C55E' }} />
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--ma-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              color: 'white'
            }}
          >
            2
          </div>
        </div>
      </div>

      {/* License success badge */}
      {licenseActivated && (
        <div
          style={{
            margin: '16px 32px 0',
            padding: '12px 16px',
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#22C55E', margin: 0 }}>
              ✓ Activated successfully
            </p>
          </div>
          {activationDetails.planName && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, paddingLeft: 22 }}>
              Plan: <strong>{activationDetails.planName}</strong>
            </p>
          )}
          {activationDetails.alreadyActive && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, paddingLeft: 22 }}>
              This device was already registered.
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '32px' }}>
        <APIKeyStep
          label="fal.ai API Key"
          value={falKey}
          onChange={(v: string) => {
            setFalKey(v)
          }}
          show={showFal}
          toggleShow={() => setShowFal(!showFal)}
          placeholder="fal-..."
          hasError={!!error}
          hint={
            <span>
              Bring your own fal.ai API key{' '}
              <a
                href="https://fal.ai/dashboard/keys"
                onClick={(e) => {
                  e.preventDefault()
                  window.api.external.open('https://fal.ai/dashboard/keys')
                }}
                style={{ color: '#FFFFFF', textDecoration: 'underline', fontWeight: 600 }}
              >
                click here
              </a>
            </span>
          }
        />

        {/* Error message */}
        {error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8
            }}
          >
            <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#EF4444', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <button
            onClick={onNext}
            disabled={validating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 28px',
              background: validating ? 'rgba(108,99,255,0.5)' : 'var(--ma-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: validating ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: validating ? 'none' : '0 0 20px rgba(108,99,255,0.35)',
              fontFamily: 'var(--font-body)',
              transition: 'all 0.2s',
              minWidth: 200,
              justifyContent: 'center'
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
  )
}

function APIKeyStep({
  label,
  value,
  onChange,
  show,
  toggleShow,
  placeholder,
  hint,
  hasError
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  toggleShow: () => void
  placeholder: string
  hint: React.ReactNode
  hasError: boolean
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 8
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 48px 12px 16px',
            background: hasError ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hasError ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)'}`,
            borderRadius: 10,
            color: '#FFFFFF',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'var(--font-mono)',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.6)' : 'var(--ma-accent)')
          }
          onBlur={(e) =>
            (e.target.style.borderColor = hasError ? 'rgba(239,68,68,0.4)' : 'var(--ma-border)')
          }
        />
        <button
          onClick={toggleShow}
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}
      >
        <Globe size={11} />
        {hint}
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 10,
          background: 'rgba(108,99,255,0.08)',
          border: '1px solid rgba(108,99,255,0.15)'
        }}
      >
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
          🔒 Your API key is stored locally and never sent to MonsterCreative servers. All requests
          go directly from your device to the API provider.
        </p>
      </div>
    </div>
  )
}
