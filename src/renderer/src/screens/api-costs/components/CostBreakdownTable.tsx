import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Image: '#6C63FF',
  Text: '#22C55E',
  Video: '#EC4899',
};

interface CostBreakdownTableProps {
  filtered: any[];
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  platformFilter: string;
  setPlatformFilter: (val: string) => void;
  sortField: string;
  sortDir: string;
  handleSort: (field: any) => void;
}

export const CostBreakdownTable = ({
  filtered,
  typeFilter,
  setTypeFilter,
  platformFilter,
  setPlatformFilter,
  sortField,
  sortDir,
  handleSort
}: CostBreakdownTableProps) => {
  return (
    <>
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
                  onClick={() => col.field && handleSort(col.field)}
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
    </>
  );
};

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
