import { useState } from 'react'
import { SettingRow } from '../components/SettingRow'
import { Toggle } from '../components/Toggle'

export const DefaultsSection = () => {
  const [autoSave, setAutoSave] = useState(true)
  const [currency, setCurrency] = useState('USD')

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
