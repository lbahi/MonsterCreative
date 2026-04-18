import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Zap, Filter, Download, ChevronDown, ChevronUp, ArrowUpDown, Clock, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS: Record<string, string> = {
  Image: '#6C63FF',
  Text: '#22C55E',
  Video: '#EC4899',
};

type SortField = 'model' | 'cost' | 'time' | 'type';
type SortDir = 'asc' | 'desc';

export function ApiCostsScreen() {
  const { setRightPanelContent } = useApp();
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<{ date: string, spend: number }[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [billing, setBilling] = useState<{ balance?: number, currency?: string } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ successRate: number; avgDuration: number } | null>(null);
  const [modelBreakdown, setModelBreakdown] = useState<{ model: string; cost: number; quantity: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const FAL_MODEL_IDS = [
          'fal-ai/flux-pro', 'fal-ai/flux/dev', 'fal-ai/flux/schnell', 'fal-ai/fast-sdxl',
          'fal-ai/kling-video/v1.6/pro/text-to-video', 'fal-ai/wan/v2.1/1.3b/text-to-video'
        ];
        // Fetch billing, usage and analytics sequentially to prevent 429 rate limits from Fal.ai billing APIs
        const usageResponse = await window.api.fal.getUsage('day');
        // Give a tiny buffer specifically because Fal's billing endpoints are strictly rate limited
        await new Promise(r => setTimeout(r, 200));
        const billingResponse = await window.api.fal.getBilling();
        await new Promise(r => setTimeout(r, 200));
        const analyticsResponse = await window.api.fal.getAnalytics(FAL_MODEL_IDS).catch(() => ({ error: 'unavailable' }));
        
        if (usageResponse.error) {
          setError(usageResponse.error);
          setLoading(false);
          return;
        }

        if (!billingResponse.error && !billingResponse.billing_restricted && billingResponse.credits) {
          setBilling({
            balance: billingResponse.credits.current_balance,
            currency: billingResponse.credits.currency
          });
        } else if (billingResponse.billing_restricted) {
          setBilling({ balance: null, currency: null, restricted: true } as any);
        }

        const chartData: any[] = [];
        const txns: any[] = [];
        let requestsCount = 0;

        if (usageResponse.time_series) {
          usageResponse.time_series.forEach((bucket: any) => {
            const dateStr = new Date(bucket.bucket).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            let bucketTotal = 0;
            
            bucket.results.forEach((res: any, idx: number) => {
              bucketTotal += res.cost;
              requestsCount += (res.quantity || res.request_count || 1); // fallback handling if different units
              
              const isVideo = res.endpoint_id.includes('video') || res.endpoint_id.includes('wan') || res.endpoint_id.includes('kling');
              const isText = res.endpoint_id.includes('text') || res.endpoint_id.includes('gpt') || res.endpoint_id.match(/llm|whisper/i);
              const type = isVideo ? 'Video' : isText ? 'Text' : 'Image';
              
              const platform = res.endpoint_id.includes('chatgpt') || res.endpoint_id.includes('openai') ? 'OpenAI' : 'fal.ai';

              // Map properties to our row format
              txns.push({
                id: `txn_${bucket.bucket}_${idx}`,
                model: res.endpoint_id.split('/').pop() || res.endpoint_id,
                operation: `${res.quantity} ${res.unit}s generated`,
                type,
                inputs: '—',
                outputs: `${res.quantity} ${res.unit}s`,
                cost: res.cost,
                time: dateStr,
                timestamp: new Date(bucket.bucket).getTime(),
                platform
              });
            });

            chartData.push({ date: dateStr, spend: bucketTotal, timestamp: new Date(bucket.bucket).getTime() });
          });
        }

        // Sort ascending for chart
        chartData.sort((a, b) => a.timestamp - b.timestamp);
        // Sort descending for recent txns by default
        txns.sort((a, b) => b.timestamp - a.timestamp);

        setUsageData(chartData);
        setTransactions(txns);
        // ── Parse analytics ──
        if (!analyticsResponse.error && analyticsResponse.summary) {
          let totalReqs = 0, successReqs = 0, totalDur = 0, durCount = 0;
          for (const row of analyticsResponse.summary) {
            totalReqs += row.request_count ?? 0;
            successReqs += row.success_count ?? 0;
            if (row.p50_duration) { totalDur += row.p50_duration; durCount++; }
          }
          setAnalyticsData({
            successRate: totalReqs > 0 ? (successReqs / totalReqs) * 100 : 0,
            avgDuration: durCount > 0 ? totalDur / durCount : 0,
          });
        }

        // ── Model breakdown from usage summary ──
        if (!usageResponse.error && usageResponse.summary) {
          const breakdown = usageResponse.summary.map((row: any) => ({
            model: row.endpoint_id?.split('/').slice(-2).join('/') ?? row.endpoint_id,
            cost: row.cost ?? 0,
            quantity: row.quantity ?? 0,
          })).sort((a: any, b: any) => b.cost - a.cost);
          setModelBreakdown(breakdown);
        }

        setTotalRequests(Math.round(requestsCount));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const totalSpend = useMemo(() => transactions.reduce((a, t) => a + t.cost, 0), [transactions]);
  
  // Calculate top model correctly based on total spend
  const topModel = useMemo(() => {
    if (transactions.length === 0) return '—';
    const modelTotals: Record<string, number> = {};
    let top = transactions[0].model;
    let max = 0;
    for (const t of transactions) {
      modelTotals[t.model] = (modelTotals[t.model] || 0) + t.cost;
      if (modelTotals[t.model] > max) { max = modelTotals[t.model]; top = t.model; }
    }
    return top;
  }, [transactions]);
  
  const avgCost = totalRequests > 0 ? totalSpend / totalRequests : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const filtered = useMemo(() => {
    return transactions
      .filter(t => typeFilter === 'All' || t.type === typeFilter)
      .filter(t => platformFilter === 'All' || t.platform === platformFilter)
      .sort((a, b) => {
        let av: any = a[sortField as keyof typeof a];
        let bv: any = b[sortField as keyof typeof b];
        if (sortField === 'cost' || sortField === 'time') {
          av = sortField === 'time' ? a.timestamp : a.cost;
          bv = sortField === 'time' ? b.timestamp : b.cost;
        }
        return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
  }, [transactions, typeFilter, platformFilter, sortField, sortDir]);

  useEffect(() => {
    setRightPanelContent(
      <ApiCostsRightPanel
        totalSpend={totalSpend}
        transactions={transactions}
        billing={billing}
        analyticsData={analyticsData}
        modelBreakdown={modelBreakdown}
      />
    );
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, totalSpend, transactions, billing, analyticsData, modelBreakdown]);

  // Handle loading and error rendering before full UI
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ma-text-muted)' }}>
        <Loader2 className="animate-spin mb-4 text-[var(--ma-accent)]" size={32} />
        <p style={{ fontFamily: 'var(--font-mono)' }}>Syncing with fal.ai Billing API...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(34,197,94,0.12)',
            border: '1px solid rgba(34,197,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--ma-green)',
          }}>
            <BarChart3 size={16} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
            API Consumption
          </h1>
          <div style={{ 
            marginLeft: 12, padding: '3px 8px', borderRadius: 20, 
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.2)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{ 
              width: 5, height: 5, borderRadius: '50%', 
              background: 'var(--ma-green)',
              boxShadow: '0 0 6px var(--ma-green)'
            }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ma-green)', textTransform: 'uppercase' }}>
              Connected to fal.ai
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--ma-border)',
            borderRadius: 8, cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
            fontFamily: 'var(--font-body)',
          }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>Failed to load usage data</p>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 12 }}>{error}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Spend (Week)', value: `$${totalSpend.toFixed(2)}`, icon: <DollarSign size={15} />, color: 'var(--ma-green)', mono: true },
          { label: 'Top Model', value: topModel, icon: <Zap size={15} />, color: 'var(--ma-accent)' },
          { label: 'Total Requests', value: totalRequests.toString(), icon: <BarChart3 size={15} />, color: '#F59E0B' },
          { label: 'Avg. Cost / Unit', value: `$${avgCost.toFixed(4)}`, icon: <TrendingUp size={15} />, color: '#EC4899', mono: true },
        ].map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: 12, padding: '18px 20px',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: `${card.color}18`, border: `1px solid ${card.color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: card.color, marginBottom: 12,
            }}>
              {card.icon}
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700, color: '#FFF',
              fontFamily: card.mono ? 'var(--font-mono)' : 'var(--font-display)',
              letterSpacing: '-0.3px', marginBottom: 4,
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Spend chart */}
      <div style={{
        background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
        borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
              Daily API Spend
            </h3>
            <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--ma-green-light)', borderRadius: 4, color: 'var(--ma-green)', fontFamily: 'var(--font-mono)' }}>LIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['7D', '30D', '90D', 'YTD'].map(p => (
              <button key={p} style={{
                padding: '4px 10px', fontSize: 10, background: p === '7D' ? 'rgba(108,99,255,0.12)' : 'transparent',
                border: '1px solid', borderColor: p === '7D' ? 'rgba(108,99,255,0.25)' : 'transparent',
                borderRadius: 4, color: p === '7D' ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.35)', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontWeight: 600
              }}>{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={usageData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              contentStyle={{ background: '#0C0C1C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-mono)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
              itemStyle={{ color: '#6C63FF' }}
              formatter={(v: any) => [`$${v.toFixed(2)}`, 'Spend']}
            />
            <Area type="monotone" dataKey="spend" stroke="#6C63FF" strokeWidth={2.5} fill="url(#spendGrad)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          <Filter size={13} /> Filters:
        </div>
        <FilterPill label="All Types" options={['All', 'Image', 'Text', 'Video']} value={typeFilter} onChange={setTypeFilter} colors={TYPE_COLORS} />
        <FilterPill label="All Platforms" options={['All', 'fal.ai', 'OpenAI']} value={platformFilter} onChange={setPlatformFilter} />
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} recent sessions
        </div>
      </div>

      {/* Transactions table */}
      <div style={{
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ma-border)', background: 'rgba(255,255,255,0.01)' }}>
              {[
                { label: 'Model', field: 'model' },
                { label: 'Operation', field: null },
                { label: 'Type', field: 'type' },
                { label: 'Cost', field: 'cost' },
                { label: 'Time', field: 'time' },
                { label: 'Status', field: null },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={() => col.field && handleSort(col.field as SortField)}
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 700,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                    cursor: col.field ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {col.field && (
                      sortField === col.field
                        ? (sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />)
                        : <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ position: 'relative' }}>
            <AnimatePresence initial={false}>
              {filtered.map((txn, i) => (
                <motion.tr
                  key={txn.id}
                  layout
                  initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(108,99,255,0.1)' }}
                  animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, color: '#FFF', fontFamily: 'var(--font-mono)' }}>{txn.model}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{txn.operation}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                      background: `${TYPE_COLORS[txn.type] || '#666'}18`,
                      border: `1px solid ${TYPE_COLORS[txn.type] || '#666'}30`,
                      color: TYPE_COLORS[txn.type] || '#FFF',
                      letterSpacing: '0.4px',
                    }}>
                      {txn.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ma-green)', fontWeight: 600 }}>
                      ${txn.cost.toFixed(4)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{txn.time}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ma-green)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Settled</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
                    No usage recorded for this filter.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({ options, value, onChange, colors }: any) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((opt: string) => {
        const color = colors?.[opt] || 'var(--ma-accent)';
        const isActive = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '5px 12px',
              background: isActive ? (opt === 'All' ? 'rgba(108,99,255,0.15)' : `${color}18`) : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isActive ? (opt === 'All' ? 'rgba(108,99,255,0.35)' : color + '35') : 'var(--ma-border)'}`,
              borderRadius: 20,
              color: isActive ? (opt === 'All' ? 'var(--ma-accent-light)' : color) : 'rgba(255,255,255,0.35)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
              transition: 'all 0.15s',
              fontWeight: isActive ? 600 : 400
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ApiCostsRightPanel({ totalSpend, transactions, billing, analyticsData, modelBreakdown }: {
  totalSpend: number;
  transactions: any[];
  billing: any;
  analyticsData: { successRate: number; avgDuration: number } | null;
  modelBreakdown: { model: string; cost: number; quantity: number }[];
}) {
  const byType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.cost;
    return acc;
  }, {} as Record<string, number>);

  const balance = billing?.balance ?? null;
  const isRestricted = billing && (billing as any).restricted;
  // If we have a balance, compute what percentage of the budget we've "used" 
  // Wait, if it's "Available Credits", let's show how much is left.
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
                  onClick={(e) => { e.preventDefault(); window.api.external.open('https://fal.ai/dashboard/billing'); }}
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

        {/* ── Analytics Panel ── */}
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

        {/* ── Model Cost Breakdown ── */}
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
}
