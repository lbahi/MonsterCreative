import { useState } from 'react'
import { ExternalLink, AlertCircle, Globe, Scale } from 'lucide-react'
import packageJson from '../../../../../../package.json'
import { EULA_TEXT, PRIVACY_POLICY_TEXT, OPEN_SOURCE_TEXT } from './LegalContent'

export const AboutSection = () => {
  const [activeModal, setActiveModal] = useState<'none' | 'eula' | 'privacy' | 'licenses'>('none')

  const handleExternalClick = async (url: string) => {
    if (window.api.external?.open) {
      await window.api.external.open(url)
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 700,
          color: '#FFF',
          margin: '0 0 6px'
        }}
      >
        About
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
        MonsterCreative application information and legal compliance details.
      </p>

      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--ma-accent-glow)'
            }}
          >
            <span style={{ fontSize: 22 }}>⚡</span>
          </div>
          <div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#FFF',
                margin: 0,
                fontFamily: 'var(--font-display)'
              }}
            >
              MonsterCreative
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>
              AI-Powered Ad Creative Suite
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Version', value: `${packageJson.version}` },
            { label: 'License', value: 'Pro — Active' },
            { label: 'Plan', value: 'Media Buyer Pro' }
          ].map((item) => (
            <div
              key={item.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: '#FFF', fontFamily: 'var(--font-mono)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Documentation', icon: <ExternalLink size={14} />, action: () => handleExternalClick('https://monstercreative.io/docs') },
          { label: 'View Changelog', icon: <ExternalLink size={14} />, action: () => handleExternalClick('https://monstercreative.io/changelog') },
          { label: 'Report a Bug', icon: <AlertCircle size={14} />, action: () => handleExternalClick('https://monstercreative.io/support') },
          { label: 'Terms of Service / EULA', icon: <Scale size={14} />, action: () => setActiveModal('eula') },
          { label: 'Privacy Policy', icon: <Globe size={14} />, action: () => setActiveModal('privacy') },
          { label: 'Third-Party Open Source Licenses', icon: <Globe size={14} />, action: () => setActiveModal('licenses') }
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--ma-border)',
              borderRadius: 9,
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              transition: 'background 0.2s, color 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = '#FFF'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
            }}
          >
            {item.label}
            {item.icon}
          </button>
        ))}

        <button
          onClick={async () => {
            if (
              confirm(
                'Are you sure you want to transfer your license? This will deactivate it on this device and you will need to enter your key again.'
              )
            ) {
              await window.api.license.deactivate()
              window.location.reload()
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 9,
            cursor: 'pointer',
            color: '#EF4444',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            marginTop: 8
          }}
        >
          Transfer License
          <AlertCircle size={14} />
        </button>

        {import.meta.env.DEV && (
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => {
                ;(window as any).myUndefinedFunction()
              }}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 9,
                cursor: 'pointer',
                color: '#9B8FFF',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                textAlign: 'center'
              }}
            >
              Trigger JS Error
            </button>
            <button
              onClick={() => {
                window.api.sentry.crash()
              }}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 9,
                cursor: 'pointer',
                color: '#EF4444',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                textAlign: 'center'
              }}
            >
              Trigger Native Crash
            </button>
          </div>
        )}
      </div>

      {activeModal !== 'none' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7,7,15,0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
            fontFamily: 'var(--font-body)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 700,
              maxHeight: '80vh',
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--ma-border)'
              }}
            >
              <h3 style={{ color: '#FFF', fontSize: 16, fontWeight: 700, margin: 0 }}>
                {activeModal === 'eula'
                  ? 'End User License Agreement'
                  : activeModal === 'privacy'
                    ? 'Privacy Policy'
                    : 'Third-Party Open Source Notices'}
              </h3>
              <button
                onClick={() => setActiveModal('none')}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 8,
                  color: '#FFF',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Close
              </button>
            </div>
            <div
              style={{
                flex: 1,
                padding: 24,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.5,
                textAlign: 'left'
              }}
            >
              {activeModal === 'eula'
                ? EULA_TEXT
                : activeModal === 'privacy'
                  ? PRIVACY_POLICY_TEXT
                  : OPEN_SOURCE_TEXT}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

