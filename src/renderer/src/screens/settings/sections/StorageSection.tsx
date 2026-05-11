import { useState } from 'react'
import { SettingRow } from '../components/SettingRow'
import { Toggle } from '../components/Toggle'

export const StorageSection = () => {
  const [genComplete, setGenComplete] = useState(true)
  const [costAlerts, setCostAlerts] = useState(true)

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
      </div>
    </div>
  )
}
