import { TrendingUp } from 'lucide-react';

interface BudgetBurnWidgetProps {
  stats: any;
  loading: boolean;
}

export const BudgetBurnWidget = ({ stats, loading }: BudgetBurnWidgetProps) => {
  if (loading) return null;

  return (
    <div style={{ padding: '16px 20px', margin: '0 16px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TrendingUp size={13} style={{ color: 'var(--ma-accent-light)' }} />
        <span style={{ fontSize: 11, color: 'var(--ma-accent-light)', fontWeight: 600 }}>Cost Insight</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Avg cost / generation</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF', fontSize: 12 }}>
            {loading ? '…' : stats ? `$${stats.avgCostPerGen.toFixed(4)}` : '$0.0000'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Total MTD spend</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF', fontSize: 12 }}>
            {loading ? '…' : `$${(stats?.mtdSpend ?? 0).toFixed(2)}`}
          </span>
        </div>
        {!loading && stats && stats.credits !== null && stats.credits > 0 && stats.mtdSpend > 0 && (() => {
          const dayOfMonth = new Date().getDate();
          const dailyRate = stats.mtdSpend / dayOfMonth;
          const daysLeft = Math.floor(stats.credits / dailyRate);
          const isUrgent = daysLeft < 14;
          return (
            <div style={{
              marginTop: 6, padding: '8px 10px', borderRadius: 6,
              background: isUrgent ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)',
              border: `1px solid ${isUrgent ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'}`,
            }}>
              <p style={{ margin: 0, fontSize: 11, color: isUrgent ? 'var(--ma-amber)' : '#22C55E', lineHeight: 1.4 }}>
                {isUrgent ? '⚠️' : '✅'} At current pace, credits last ~<strong>{daysLeft} days</strong>
                {isUrgent && ' — consider topping up.'}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
