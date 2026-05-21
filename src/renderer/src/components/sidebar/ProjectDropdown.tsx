import React from 'react'

interface ProjectDropdownProps {
  collapsed: boolean
}

export const ProjectDropdown = ({ collapsed }: ProjectDropdownProps): React.ReactElement => {
  if (collapsed) {
    return (
      <div
        style={{
          padding: '12px 0',
          borderTop: '1px solid var(--ma-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ma-accent), #C084FC)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'white'
          }}
        >
          M
        </div>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--ma-green)',
            boxShadow: '0 0 6px var(--ma-green)'
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '12px 12px',
        borderTop: '1px solid var(--ma-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ma-accent), #C084FC)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'white',
            flexShrink: 0
          }}
        >
          M
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p
            style={{
              fontSize: 12,
              color: '#FFFFFF',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              margin: 0
            }}
          >
            Monster Creator
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.35)',
              whiteSpace: 'nowrap',
              margin: 0
            }}
          >
            Unlimited Plan
          </p>
        </div>
      </div>
    </div>
  )
}
