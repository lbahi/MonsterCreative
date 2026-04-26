import { RefreshCw } from 'lucide-react';

interface SystemStatusProps {
  refreshing: boolean;
  onRefresh: () => void;
  formatDate: () => string;
}

export const SystemStatus = ({ refreshing, onRefresh, formatDate }: SystemStatusProps) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {formatDate()}
        </span>
        <div style={{ height: 1, width: 40, background: 'var(--ma-border)' }} />
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        title="Refresh data"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: '1px solid var(--ma-border)', borderRadius: 6,
          padding: '4px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
          fontSize: 11, fontFamily: 'var(--font-body)',
        }}
      >
        <RefreshCw size={11} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
