import React from 'react'

export function ManualTab(): React.ReactElement {
  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '16px' }}>
        Manual Video Generation
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--ma-text-muted)' }}>
        Configure your video settings in the left panel and click Generate Video.
      </p>
    </div>
  )
}
