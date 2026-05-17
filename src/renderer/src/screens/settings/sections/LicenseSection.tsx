import { useEffect, useState } from 'react'
import { Shield, RefreshCw, Key, Mail, Calendar, HelpCircle } from 'lucide-react'

export const LicenseSection = () => {
  const [details, setDetails] = useState<{
    email?: string
    key?: string
    quota?: string
    lastValidated?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = await window.api.license.getDetails()
        setDetails(data)
      } catch (err) {
        console.error('Failed to get license details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [])

  const handleDeactivate = async () => {
    const confirmDeactivate = confirm(
      'This will remove the license from this PC.\nYou can reactivate on another device.\n\nAre you sure?'
    )
    if (confirmDeactivate) {
      try {
        await window.api.license.deactivate()
        alert('License removed from this device.\nYou can now activate MonsterCreative on another PC using your original license key.')
        window.location.reload()
      } catch (err) {
        console.error('Deactivation failed:', err)
        alert('Failed to deactivate license. Please contact support.')
      }
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
        <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
        Loading license details...
      </div>
    )
  }

  const maskedKey = details?.key
    ? `${details.key.substring(0, 8)}...${details.key.substring(details.key.length - 4)}`
    : 'Not Found'

  const formattedDate = details?.lastValidated
    ? new Date(Number(details.lastValidated)).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never'

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color: '#FFF',
            margin: '0 0 6px'
          }}
        >
          License
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Manage your MonsterCreative software license and active device quota.
        </p>
      </div>

      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
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
            <Shield size={22} color="white" />
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
              MonsterCreative Pro License
            </p>
            <p style={{ fontSize: 12, color: '#22C55E', margin: '2px 0 0', fontWeight: 600 }}>
              Active & Validated
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mail size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Email Address</span>
              <span style={{ fontSize: 13, color: '#FFF' }}>{details?.email || 'N/A'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Key size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>License Key</span>
              <span style={{ fontSize: 13, color: '#FFF', fontFamily: 'var(--font-mono)' }}>{maskedKey}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Activations Limit</span>
              <span style={{ fontSize: 13, color: '#FFF' }}>{details?.quota ? `${details.quota} devices allowed` : 'N/A'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Calendar size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', display: 'block' }}>Last Validated</span>
              <span style={{ fontSize: 13, color: '#FFF' }}>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleDeactivate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 9,
            cursor: 'pointer',
            color: '#EF4444',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.05)'
          }}
        >
          Transfer License <HelpCircle size={14} />
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
