/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/use[ScreenName].ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useDashboard } from './hooks/useDashboard'
import { StatsRow } from './widgets/StatsRow'
import { RecentActivity } from './widgets/RecentActivity'
import { QuickActions } from './widgets/QuickActions'
import { SystemStatus } from './widgets/SystemStatus'
import { DashboardRightPanel } from './components/DashboardRightPanel'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function DashboardScreen() {
  const navigate = useNavigate()
  const { stats, loading, refreshing, refresh, setRightPanelContent } = useDashboard()

  useEffect(() => {
    setRightPanelContent(
      <DashboardRightPanel navigate={navigate} stats={stats} loading={loading} />
    )
    return () => setRightPanelContent(null)
  }, [setRightPanelContent, navigate, stats, loading])

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <SystemStatus refreshing={refreshing} onRefresh={refresh} formatDate={formatDate} />
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.5px'
          }}
        >
          {getGreeting()}, Creator 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
          You've generated{' '}
          <span style={{ color: 'var(--ma-text-muted)', fontWeight: 500 }}>
            {loading ? '…' : `${stats?.totalGenerations ?? 0} creatives`}
          </span>{' '}
          this month.{' '}
          {(stats?.totalGenerations ?? 0) === 0
            ? 'Ready to make some magic?'
            : 'Keep the momentum going!'}
        </p>
      </div>

      <StatsRow stats={stats} loading={loading} />
      <QuickActions />
      <RecentActivity />
    </div>
  )
}
