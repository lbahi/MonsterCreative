import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

interface UsageChartProps {
  usageData: { date: string; spend: number }[]
}

export const UsageChart = ({ usageData }: UsageChartProps) => {
  return (
    <div
      style={{
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 600,
              color: '#FFF',
              margin: 0
            }}
          >
            Daily API Spend
          </h3>
          <span
            style={{
              fontSize: 10,
              padding: '2px 6px',
              background: 'var(--ma-green-light)',
              borderRadius: 4,
              color: 'var(--ma-green)',
              fontFamily: 'var(--font-mono)'
            }}
          >
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7D', '30D', '90D', 'YTD'].map((p) => (
            <button
              key={p}
              style={{
                padding: '4px 10px',
                fontSize: 10,
                background: p === '7D' ? 'rgba(108,99,255,0.12)' : 'transparent',
                border: '1px solid',
                borderColor: p === '7D' ? 'rgba(108,99,255,0.25)' : 'transparent',
                borderRadius: 4,
                color: p === '7D' ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            >
              {p}
            </button>
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
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#0C0C1C',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
            itemStyle={{ color: '#6C63FF' }}
            formatter={(v: any) => [`$${v.toFixed(2)}`, 'Spend']}
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#6C63FF"
            strokeWidth={2.5}
            fill="url(#spendGrad)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
