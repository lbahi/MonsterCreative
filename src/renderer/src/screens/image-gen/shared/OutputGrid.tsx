import { Download } from 'lucide-react';

import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';

type OutputGridProps = {
  outputs: string[];
  selectedOutput: number;
  setSelectedOutput: (value: number) => void;
};

export function OutputGrid({ outputs, selectedOutput, setSelectedOutput }: OutputGridProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {outputs.length} Outputs
        </span>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--ma-border)',
            borderRadius: 7,
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 11,
            fontFamily: 'var(--font-body)',
          }}
        >
          <Download size={12} /> Download All
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {outputs.map((src, index) => (
          <div
            key={index}
            onClick={() => setSelectedOutput(index)}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              border: `2px solid ${selectedOutput === index ? 'var(--ma-accent)' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: selectedOutput === index ? '0 0 20px rgba(108,99,255,0.3)' : 'none',
              aspectRatio: '1/1',
            }}
          >
            <ImageWithFallback src={src} alt={`Output ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
