import { useEffect, useState } from 'react'
import { DollarSign, Zap } from 'lucide-react'

export function AdCopyRightPanel({ currentModelLabel }: { currentModelLabel: string }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    const api = window.api
    if (api && api.fal && api.fal.getBilling) {
      api.fal
        .getBilling()
        .then((billing: any) => {
          if (!billing) return

          let foundBalance = null
          let foundCurrency = 'USD'

          // Robust parsing matching DashboardScreen
          if (billing.credits?.current_balance !== undefined) {
            foundBalance = billing.credits.current_balance
          } else if (typeof billing.current_balance === 'number') {
            foundBalance = billing.current_balance
          } else if (typeof billing.credits === 'number') {
            foundBalance = billing.credits
          } else if (billing.balance !== undefined) {
            foundBalance = billing.balance
          }

          if (billing.credits?.currency) foundCurrency = billing.credits.currency
          else if (billing.currency) foundCurrency = billing.currency

          if (foundBalance !== null) {
            setBalance(foundBalance)
            setCurrency(foundCurrency)
          }
        })
        .catch((err) => console.error('Could not fetch billing for right panel:', err))
    }
  }, [])

  return (
    <div style={{ padding: '24px 20px', fontFamily: 'var(--font-body)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <DollarSign size={18} color="var(--ma-green)" />
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#FFF', margin: 0 }}>API & Usage</h3>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
            marginTop: 0
          }}
        >
          Strategy Engine
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={14} color="var(--ma-accent)" />
          <span style={{ fontSize: 13, color: '#FFF', fontWeight: 500 }}>{currentModelLabel}</span>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 16
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
            marginTop: 0
          }}
        >
          API Balance
        </p>
        <div
          style={{ fontSize: 24, fontWeight: 700, color: 'var(--ma-green)', letterSpacing: -0.5 }}
        >
          {balance !== null ? `$${balance.toFixed(2)}` : 'Loading...'}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
          {currency} Account
        </div>
      </div>
    </div>
  )
}
