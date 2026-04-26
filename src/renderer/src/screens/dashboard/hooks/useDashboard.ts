import { useEffect, useState } from 'react';
import { useApp } from '../../../contexts/AppContext';

interface DashStats {
  totalGenerations: number;
  mtdSpend: number;
  credits: number | null;
  creditsRestricted: boolean;
  timeSavedH: number;
  avgCostPerGen: number;
}

function getMtdStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export const useDashboard = () => {
  const { setRightPanelContent } = useApp();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const mtdStart = getMtdStart();

      const [usageRes, billingRes] = await Promise.all([
        (window as any).api.fal.getUsage('day', mtdStart),
        (window as any).api.fal.getBilling(),
      ]);

      let totalGenerations = 0;
      let mtdSpend = 0;

      if (!('error' in usageRes)) {
        if (usageRes.summary && usageRes.summary.length > 0) {
          for (const row of usageRes.summary) {
            totalGenerations += row.quantity ?? 0;
            mtdSpend += row.cost ?? 0;
          }
        } else if (usageRes.time_series) {
          for (const bucket of usageRes.time_series) {
            for (const result of bucket.results) {
              totalGenerations += result.quantity ?? 0;
              mtdSpend += result.cost ?? 0;
            }
          }
        }
      }

      let credits: number | null = null;
      let creditsRestricted = false;

      if (!('error' in billingRes)) {
        if ((billingRes as any).billing_restricted) {
          creditsRestricted = true;
        } else if (billingRes.credits?.current_balance !== undefined) {
          credits = billingRes.credits.current_balance;
        } else if (typeof billingRes.current_balance === 'number') {
          credits = billingRes.current_balance;
        } else if (typeof billingRes.credits === 'number') {
          credits = billingRes.credits;
        } else if (billingRes.balance !== undefined) {
          credits = billingRes.balance;
        } else {
          credits = 0;
        }
      }

      setStats({
        totalGenerations: Math.round(totalGenerations),
        mtdSpend: mtdSpend,
        credits,
        creditsRestricted,
        timeSavedH: Math.round(totalGenerations * 0.15 * 10) / 10, // Round to 1 decimal
        avgCostPerGen: totalGenerations > 0 ? mtdSpend / totalGenerations : 0,
      });
    } catch (err) {
      console.error('Dash fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 2 minutes
    const timer = setInterval(() => fetchData(true), 120000);
    return () => clearInterval(timer);
  }, []);

  return {
    stats,
    loading,
    refreshing,
    refresh: () => fetchData(true),
    setRightPanelContent
  };
};
