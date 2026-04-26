import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useApiCosts } from './hooks/useApiCosts';
import { BillingHeader } from './components/BillingHeader';
import { ModelStatsCard } from './components/ModelStatsCard';
import { UsageChart } from './components/UsageChart';
import { CostBreakdownTable } from './components/CostBreakdownTable';
import { ApiCostsRightPanel } from './components/ApiCostsRightPanel';

export function ApiCostsScreen() {
  const {
    typeFilter, setTypeFilter,
    platformFilter, setPlatformFilter,
    sortField,
    sortDir,
    loading, error,
    usageData,
    transactions,
    totalRequests,
    billing,
    analyticsData,
    modelBreakdown,
    totalSpend,
    topModel,
    avgCost,
    handleSort,
    filtered,
    setRightPanelContent
  } = useApiCosts();

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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ma-text-muted)' }}>
        <Loader2 className="animate-spin mb-4 text-[var(--ma-accent)]" size={32} />
        <p style={{ fontFamily: 'var(--font-mono)' }}>Syncing with fal.ai Billing API...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 36px', fontFamily: 'var(--font-body)', overflowY: 'auto', height: '100%' }}>
      <BillingHeader />

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={20} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>Failed to load usage data</p>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 12 }}>{error}</p>
          </div>
        </div>
      )}

      <ModelStatsCard 
        totalSpend={totalSpend}
        topModel={topModel}
        totalRequests={totalRequests}
        avgCost={avgCost}
      />

      <UsageChart usageData={usageData} />

      <CostBreakdownTable 
        filtered={filtered}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        sortField={sortField}
        sortDir={sortDir}
        handleSort={handleSort}
      />
    </div>
  );
}
