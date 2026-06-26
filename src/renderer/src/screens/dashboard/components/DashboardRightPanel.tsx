import { BudgetBurnWidget } from '../widgets/BudgetBurnWidget'

interface DashboardRightPanelProps {
  navigate: (path: string) => void
  stats: any
  loading: boolean
}

export const DashboardRightPanel = ({ navigate, stats, loading }: DashboardRightPanelProps) => {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFF',
            margin: 0
          }}
        >
          Activity Feed
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Live session tracking
        </p>
      </div>

      <div style={{ padding: '16px 0' }}>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            padding: '30px 20px',
            margin: 0
          }}
        >
          No activity in this session.
        </p>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--ma-border)' }}>
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}
        >
          Start generating
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'New Ad Copy', path: '/ad-copy', color: '#6C63FF' },
            { label: 'New Image', path: '/image-gen/generate', color: '#8B5CF6' },
            { label: 'New Video', path: '/video-gen/ad-maker', color: '#EC4899' }
          ].map((btn) => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8,
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)'
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: btn.color,
                  flexShrink: 0
                }}
              />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <BudgetBurnWidget stats={stats} loading={loading} />
    </div>
  )
}
