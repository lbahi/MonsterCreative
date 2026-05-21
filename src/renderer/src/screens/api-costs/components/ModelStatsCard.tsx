import { DollarSign, Zap, BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface ModelStatsCardProps {
  totalSpend: number
  topModel: string
  totalRequests: number
  avgCost: number
}

export const ModelStatsCard = ({
  totalSpend,
  topModel,
  totalRequests,
  avgCost
}: ModelStatsCardProps) => {
  const cards = [
    {
      label: 'Total Spend (Week)',
      value: `$${totalSpend.toFixed(2)}`,
      icon: <DollarSign size={15} />,
      color: 'var(--ma-green)',
      mono: true
    },
    { label: 'Top Model', value: topModel, icon: <Zap size={15} />, color: 'var(--ma-accent)' },
    {
      label: 'Total Requests',
      value: totalRequests.toString(),
      icon: <BarChart3 size={15} />,
      color: '#F59E0B'
    },
    {
      label: 'Avg. Cost / Unit',
      value: `$${avgCost.toFixed(4)}`,
      icon: <TrendingUp size={15} />,
      color: '#EC4899',
      mono: true
    }
  ]

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{
            background: 'var(--ma-elevated)',
            border: '1px solid var(--ma-border)',
            borderRadius: 12,
            padding: '18px 20px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: `${card.color}18`,
              border: `1px solid ${card.color}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: card.color,
              marginBottom: 12
            }}
          >
            {card.icon}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#FFF',
              fontFamily: card.mono ? 'var(--font-mono)' : 'var(--font-display)',
              letterSpacing: '-0.3px',
              marginBottom: 4
            }}
          >
            {card.value}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{card.label}</div>
        </motion.div>
      ))}
    </div>
  )
}
