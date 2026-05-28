import { useState } from 'react'
import { SettingRow } from '../components/SettingRow'
import { Toggle } from '../components/Toggle'

export const StorageSection = () => {
  const [genComplete, setGenComplete] = useState(true)
  const [costAlerts, setCostAlerts] = useState(true)
  const [checking, setChecking] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)

  const handleCheckUpdate = async () => {
    setChecking(true)
    setUpdateStatus(null)
    try {
      const available = await window.api.update.check()
      setUpdateStatus(available ? 'Update available!' : 'App is up to date')
    } catch (e) {
      setUpdateStatus('Failed to check')
    }
    setChecking(false)
    setTimeout(() => setUpdateStatus(null), 3000)
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 700,
          color: '#FFF',
          margin: '0 0 6px'
        }}
      >
        Notifications
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
        Control alerts and system notifications.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SettingRow
          label="Generation complete"
          description="Notify when long generations finish"
          control={<Toggle value={genComplete} onChange={setGenComplete} />}
        />
        <SettingRow
          label="Cost threshold alerts"
          description="Alert when API spend exceeds $50"
          control={<Toggle value={costAlerts} onChange={setCostAlerts} />}
        />

        <div style={{ marginTop: 8, paddingTop: 24, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#FFF' }}>Manual Update</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Check for the latest software updates manually.
              </div>
            </div>
            <button
              onClick={handleCheckUpdate}
              disabled={checking}
              style={{
                background: checking ? 'rgba(255, 255, 255, 0.05)' : 'rgba(108, 99, 255, 0.1)',
                color: checking ? 'rgba(255, 255, 255, 0.5)' : '#6C63FF',
                border: checking ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(108, 99, 255, 0.25)',
                padding: '8px 16px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                cursor: checking ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)',
                minWidth: 140,
                transition: 'all 0.2s ease'
              }}
            >
              {checking ? 'Checking...' : updateStatus ? updateStatus : 'Check for Updates'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
