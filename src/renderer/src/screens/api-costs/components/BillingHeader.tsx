import { BarChart3, Download } from 'lucide-react';

interface BillingHeaderProps {
  onExport?: () => void;
}

export const BillingHeader = ({ onExport }: BillingHeaderProps) => {
  return (
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
        <button 
          onClick={onExport}
          style={{
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
  );
};
