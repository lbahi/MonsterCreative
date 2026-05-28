import { useEffect, useState, useCallback } from 'react'
import { useApp } from '../../../contexts/AppContext'
import { BillingResponse } from '../types'

export interface DashStats {
  totalGenerations: number
  mtdSpend: number
  credits: number | null
  creditsRestricted: boolean
  timeSavedH: number
  avgCostPerGen: number
}

function getMtdStart(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export const useDashboard = () => {
  const { setRightPanelContent } = useApp()
  const [stats, setStats] = useState<DashStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const mtdStart = getMtdStart()

      const [usageRes, billingRes] = await Promise.all([
        window.api.fal.getUsage('day', mtdStart),
        window.api.fal.getBilling()
      ])

      let totalGenerations = 0
      let mtdSpend = 0

      if (usageRes && typeof usageRes === 'object' && !('error' in usageRes)) {
        const usage = usageRes as any
        if (usage.summary && usage.summary.length > 0) {
          for (const row of usage.summary) {
            totalGenerations += row.quantity ?? 0
            mtdSpend += row.cost ?? 0
          }
        } else if (usage.time_series) {
          for (const bucket of usage.time_series) {
            for (const result of bucket.results) {
              totalGenerations += result.quantity ?? 0
              mtdSpend += result.cost ?? 0
            }
          }
        }
      }

      let credits: number | null = null
      let creditsRestricted = false

      if (!('error' in (billingRes as object))) {
        const b = billingRes as BillingResponse
        if (b.billing_restricted) {
          creditsRestricted = true
        } else if (b.credits?.current_balance !== undefined) {
          credits = b.credits.current_balance
        } else if (typeof b.current_balance === 'number') {
          credits = b.current_balance
        } else if (b.balance !== undefined) {
          credits = b.balance
        } else {
          credits = 0
        }
      }

      setStats({
        totalGenerations: Math.round(totalGenerations),
        mtdSpend: mtdSpend,
        credits,
        creditsRestricted,
        timeSavedH: Math.round(totalGenerations * 0.15 * 10) / 10, // Round to 1 decimal
        avgCostPerGen: totalGenerations > 0 ? mtdSpend / totalGenerations : 0
      })
    } catch (err: unknown) {
      console.error('Dash fetch error:', err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  return {
    stats,
    loading,
    refreshing,
    refresh: () => fetchData(true),
    setRightPanelContent
  }
}
