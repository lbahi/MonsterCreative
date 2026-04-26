import { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';

type SortField = 'model' | 'cost' | 'time' | 'type';
type SortDir = 'asc' | 'desc';

export const useApiCosts = () => {
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
        
        const usageResponse = await (window as any).api.fal.getUsage('day');
        await new Promise(r => setTimeout(r, 200));
        const billingResponse = await (window as any).api.fal.getBilling();
        await new Promise(r => setTimeout(r, 200));
        const analyticsResponse = await (window as any).api.fal.getAnalytics(FAL_MODEL_IDS).catch(() => ({ error: 'unavailable' }));
        
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
              requestsCount += (res.quantity || res.request_count || 1);
              
              const isVideo = res.endpoint_id.includes('video') || res.endpoint_id.includes('wan') || res.endpoint_id.includes('kling');
              const isText = (res.endpoint_id.includes('text') || res.endpoint_id.includes('gpt') || res.endpoint_id.match(/llm|whisper/i)) && !res.endpoint_id.includes('image');
              const type = isVideo ? 'Video' : isText ? 'Text' : 'Image';
              
              const platform = res.endpoint_id.includes('chatgpt') || res.endpoint_id.includes('openai') ? 'OpenAI' : 'fal.ai';

              txns.push({
                id: `txn_${bucket.bucket}_${idx}`,
                model: res.endpoint_id.includes('/') 
                  ? res.endpoint_id.split('/').slice(-3).join('/') 
                  : res.endpoint_id,
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

        chartData.sort((a, b) => a.timestamp - b.timestamp);
        txns.sort((a, b) => b.timestamp - a.timestamp);

        setUsageData(chartData);
        setTransactions(txns);

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

        if (!usageResponse.error && usageResponse.summary) {
          const breakdown = usageResponse.summary.map((row: any) => ({
            model: row.endpoint_id?.split('/').slice(-3).join('/') ?? row.endpoint_id,
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

  return {
    typeFilter, setTypeFilter,
    platformFilter, setPlatformFilter,
    sortField, setSortField,
    sortDir, setSortDir,
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
  };
};
