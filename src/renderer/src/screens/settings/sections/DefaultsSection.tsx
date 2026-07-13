import { useState, useEffect } from 'react'
import { SettingRow } from '../components/SettingRow'
import { Toggle } from '../components/Toggle'

export const DefaultsSection = () => {
  const [autoSave, setAutoSave] = useState(true)
  const [currency, setCurrency] = useState('USD')
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [settingsObj, setSettingsObj] = useState<any>(null)

  useEffect(() => {
    window.api.database.getSettings().then((s: any) => {
      if (s) {
        setSettingsObj(s)
        if (s.analytics_enabled !== undefined) {
          setAnalyticsEnabled(s.analytics_enabled !== 0 && s.analytics_enabled !== false)
        }
      }
    })
  }, [])

  const handleAnalyticsChange = (val: boolean) => {
    setAnalyticsEnabled(val)
    if (settingsObj) {
      const updated = { ...settingsObj, analytics_enabled: val ? 1 : 0 }
      setSettingsObj(updated)
      window.api.database.updateSettings(updated)
    }
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
        General
      </h2>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 24px' }}>
        Application preferences and defaults.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SettingRow
          label="Auto-save generations"
          description="Automatically save all outputs to local library"
          control={<Toggle value={autoSave} onChange={setAutoSave} />}
        />
        <SettingRow
          label="Share anonymous usage data"
          description="Help us improve the app by sharing crash reports and basic usage metrics (no API keys, prompts, or personal data)."
          control={<Toggle value={analyticsEnabled} onChange={handleAnalyticsChange} />}
        />
        <SettingRow
          label="Currency display"
          description="Currency for cost estimates and API billing"
          control={
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                padding: '7px 12px',
                background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)',
                borderRadius: 7,
                color: '#FFF',
                fontSize: 12,
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)'
              }}
            >
              {['USD', 'EUR', 'GBP'].map((c) => (
                <option key={c} style={{ background: '#111124' }}>
                  {c}
                </option>
              ))}
            </select>
          }
        />
      </div>
    </div>
  )
}
