import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Image: '#6C63FF',
  Text: '#22C55E',
  Video: '#EC4899',
};

interface ApiCostsRightPanelProps {
  totalSpend: number;
  transactions: any[];
  billing: any;
  analyticsData: { successRate: number; avgDuration: number } | null;
  modelBreakdown: { model: string; cost: number; quantity: number }[];
}

export const ApiCostsRightPanel = ({
  totalSpend,
  transactions,
  billing,
  analyticsData,
  modelBreakdown
}: ApiCostsRightPanelProps) => {
  const byType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.cost;
    return acc;
  }, {} as Record<string, number>);

  const balance = billing?.balance ?? null;
  const isRestricted = billing && (billing as any).restricted;
  const isLowBalance = billing && balance !== null && balance < 10 && balance > 0;
  const isOutOfCredits = billing && balance !== null && balance <= 0 && !isRestricted;

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
            Cost Breakdown
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
            Live Sync
          </p>
        </div>
        <Activity size={16} style={{ color: 'var(--ma-accent-light)' }} />
      </div>

      <div style={{ padding: 20 }}>
        {/* Account Credits */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--ma-text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Available fal.ai Credits</span>
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: isOutOfCredits ? '#EF4444' : isLowBalance ? 'var(--ma-amber)' : '#FFF' }}>
              {isRestricted ? '—' : balance !== null ? `${billing?.currency || '$'}${balance.toFixed(2)}` : '…'}
            </span>
          </div>

          {isRestricted && (
            <div style={{
              marginTop: 8, padding: 10, borderRadius: 6,
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', gap: 8, alignItems: 'flex-start'
            }}>
              <AlertTriangle size={13} style={{ color: 'var(--ma-amber)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 11, color: 'var(--ma-amber)', margin: 0, lineHeight: 1.4 }}>
                Billing API access is restricted for this key. View your balance at{' '}
                <a
                  href="https://fal.ai/dashboard/billing"
                  onClick={(e) => { e.preventDefault(); (window as any).api.external.open('https://fal.ai/dashboard/billing'); }}
                  style={{ color: '#FFFFFF', textDecoration: 'underline' }}
                >
                  fal.ai/dashboard/billing
                </a>
              </p>
            </div>
          )}
          
          {(isLowBalance || isOutOfCredits) && (
            <div style={{ 
              marginTop: 8, padding: 8, borderRadius: 6, 
              background: isOutOfCredits ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', 
              border: `1px solid ${isOutOfCredits ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
              display: 'flex', gap: 8, alignItems: 'flex-start'
            }}>
              <AlertTriangle size={14} style={{ color: isOutOfCredits ? '#EF4444' : 'var(--ma-amber)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 11, color: isOutOfCredits ? '#EF4444' : 'var(--ma-amber)', margin: 0, lineHeight: 1.4 }}>
                {isOutOfCredits ? 'Your fal.ai account is out of credits. Generations will fail.' : 'Low credit balance. Top up soon to prevent generation interruptions.'}
              </p>
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
          By Creative Type
        </p>
        {Object.entries<number>(byType).map(([type, cost]) => {
          const pct = totalSpend > 0 ? (cost / totalSpend) * 100 : 0;
          const color = TYPE_COLORS[type] || '#888';
          return (
            <div key={type} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {type}
                </span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#FFF' }}>
                  ${cost.toFixed(3)}
                </span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  style={{
                    height: '100%',
                    background: color,
                    borderRadius: 2,
                    boxShadow: `0 0 8px ${color}60`,
                  }} 
                />
              </div>
            </div>
          );
        })}

        {analyticsData && (
          <>
            <div style={{ height: 1, background: 'var(--ma-border)', margin: '8px 0 20px' }} />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
              API Health (MTD)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: analyticsData.successRate >= 95 ? '#22C55E' : analyticsData.successRate >= 80 ? 'var(--ma-amber)' : '#EF4444' }}>
                  {analyticsData.successRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Success Rate</div>
              </div>
              <div style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#FFF' }}>
                  {analyticsData.avgDuration.toFixed(1)}s
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Avg Gen Time</div>
              </div>
            </div>
          </>
        )}

        {modelBreakdown.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
              By Model
            </p>
            {modelBreakdown.slice(0, 5).map((row) => {
              const pct = totalSpend > 0 ? (row.cost / totalSpend) * 100 : 0;
              return (
                <div key={row.model} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>{row.model}</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#FFF' }}>${row.cost.toFixed(3)}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      style={{ height: '100%', background: 'var(--ma-accent)', borderRadius: 2, boxShadow: '0 0 8px rgba(108,99,255,0.5)' }}
                    />
                  </div>
                </div>
              );
            })}
            <div style={{ height: 1, background: 'var(--ma-border)', margin: '8px 0 20px' }} />
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={14} style={{ color: 'var(--ma-text-muted)' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
            Latest Activity
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {transactions.slice(0, 5).map((txn) => (
              <motion.div 
                key={`${txn.id}_recent`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 8
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: 11, color: '#FFF', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>{txn.model}</p>
                  <p style={{ fontSize: 10, color: 'var(--ma-text-muted)', margin: 0, whiteSpace: 'nowrap' }}>{txn.time}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: 'var(--ma-green)', fontFamily: 'var(--font-mono)', margin: 0 }}>${txn.cost.toFixed(4)}</p>
                </div>
              </motion.div>
            ))}
            {transactions.length === 0 && (
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '10px 0' }}>No recent activity to show</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
