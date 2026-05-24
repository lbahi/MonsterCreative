import React from 'react'
import { Video, Sparkles, Settings2 } from 'lucide-react'
import { ActiveVideoGenMode } from '../types'

interface VideoGenHeaderProps {
  activeMode: ActiveVideoGenMode
  onModeChange: (mode: ActiveVideoGenMode) => void
}

export function VideoGenHeader({
  activeMode,
  onModeChange
}: VideoGenHeaderProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Video size={20} color="#EC4899" />
        </div>
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#FFF',
              margin: 0,
              letterSpacing: '-0.5px'
            }}
          >
            AI Fashion Video
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>
            Animate your garments into cinematic runway and lifestyle videos
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 20,
          padding: 4,
          border: '1px solid var(--ma-border)'
        }}
      >
        {([
          { key: 'templates', label: 'Templates', icon: <Sparkles size={14} /> },
          { key: 'manual', label: 'Manual', icon: <Settings2 size={14} /> }
        ] as { key: ActiveVideoGenMode; label: string; icon: React.ReactNode }[]).map(
          ({ key, label, icon }) => {
            const isActive = activeMode === key
            return (
              <button
                key={key}
                onClick={() => onModeChange(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 16px',
                  borderRadius: 16,
                  border: 'none',
                  background: isActive ? 'var(--ma-accent)' : 'transparent',
                  color: isActive ? '#FFF' : 'rgba(255,255,255,0.5)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'none'
                }}
              >
                {icon} {label}
              </button>
            )
          }
        )}
      </div>
    </div>
  )
}

