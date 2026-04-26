import { Zap, DollarSign, CreditCard, Clock } from 'lucide-react';

interface DashStats {
  totalGenerations: number;
  mtdSpend: number;
  credits: number | null;
  creditsRestricted: boolean;
  timeSavedH: number;
  avgCostPerGen: number;
}

interface StatsRowProps {
  stats: DashStats | null;
  loading: boolean;
}

export const StatsRow = ({ stats, loading }: StatsRowProps) => {
  const STATS = [
    {
      label: 'Total Generations',
      value: loading ? '—' : stats?.totalGenerations.toLocaleString() ?? '0',
      delta: 'this month',
      icon: <Zap size={16} />,
      color: '#6C63FF',
      mono: false,
    },
    {
      label: 'API Spend (MTD)',
      value: loading ? '—' : `$${(stats?.mtdSpend ?? 0).toFixed(2)}`,
      delta: 'month to date',
      icon: <DollarSign size={16} />,
      color: '#22C55E',
      mono: true,
    },
    {
      label: 'Available Credits',
      value: loading
        ? '—'
        : stats?.creditsRestricted
        ? 'N/A'
        : stats?.credits !== null
        ? `$${(stats?.credits ?? 0).toFixed(2)}`
        : '0.00',
      delta: stats?.creditsRestricted ? 'admin key needed' : 'fal.ai balance',
      icon: <CreditCard size={16} />,
      color: '#F59E0B',
      mono: true,
    },
    {
      label: 'Time Saved',
      value: loading ? '—' : `${stats?.timeSavedH ?? 0}h`,
      delta: 'this month',
      icon: <Clock size={16} />,
      color: '#EC4899',
      mono: false,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
      {STATS.map((stat, i) => (
        <div key={i} style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12, padding: '20px 22px',
          position: 'relative', overflow: 'hidden',
          opacity: loading ? 0.6 : 1,
          transition: 'opacity 0.3s',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 80, height: 80, borderRadius: '50%',
            background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${stat.color}18`, border: `1px solid ${stat.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
            }}>
              {stat.icon}
            </div>
            <span style={{
              fontSize: 11, color: 'rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.05)',
              padding: '3px 8px', borderRadius: 20,
            }}>
              {stat.delta}
            </span>
          </div>
          <div style={{
            fontSize: 26, fontWeight: 700, color: '#FFFFFF',
            fontFamily: stat.mono ? 'var(--font-mono)' : 'var(--font-display)',
            letterSpacing: '-0.5px',
          }}>
            {stat.value}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
