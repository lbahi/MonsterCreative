import { Check, Download } from 'lucide-react';

import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { StepChecklist } from '../../../components/ui/StepChecklist';
import { IMG_STEPS } from '../constants';
import { InfoRow } from '../shared/InfoRow';

type NanoBananaRightPanelProps = {
  generating: boolean;
  generated: boolean;
  ratio: string;
  resolution: string;
  numOutputs: number;
  safety: number;
  search: boolean;
  estimatedCost: string;
  nbModel: string;
  outputs: string[];
  selectedOutput: number;
  setSelectedOutput: (value: number) => void;
};

export function NanoBananaRightPanel({
  generating,
  generated,
  ratio,
  resolution,
  numOutputs,
  safety,
  search,
  estimatedCost,
  nbModel,
  outputs,
  selectedOutput,
  setSelectedOutput,
}: NanoBananaRightPanelProps) {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>{nbModel}</h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Workflow: <span style={{ fontFamily: 'var(--font-mono)' }}>Edit</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: numOutputs }).map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  aspectRatio: '1/1',
                  borderRadius: 8,
                  background: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.15)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </div>
          <StepChecklist steps={IMG_STEPS} onComplete={() => {}} estimatedTime="~8 seconds" />
          <style>{`@keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }`}</style>
        </div>
      )}

      {!generating && !generated && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Model" value={nbModel} mono />
            <InfoRow label="Ratio" value={ratio} mono />
            <InfoRow label="Resolution" value={resolution} />
            <InfoRow label="Safety" value={`Level ${safety}`} />
            <InfoRow label="Web Search" value={search ? 'ON' : 'OFF'} green={search} />
            <InfoRow label="Quantity" value={`${numOutputs} images`} />
            <InfoRow label="Est. cost" value={`$${estimatedCost}`} mono green />
          </div>
        </div>
      )}

      {generated && outputs.length > 0 && (
        <div style={{ padding: 20 }}>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Check size={14} style={{ color: 'var(--ma-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>Generation Complete</span>
          </div>

          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <ImageWithFallback
              src={outputs[selectedOutput]}
              alt="Selected output"
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: numOutputs > 1 ? 'repeat(4, 1fr)' : '1fr', gap: 6, marginBottom: 16 }}>
            {outputs.map((src, index) => (
              <div
                key={index}
                onClick={() => setSelectedOutput(index)}
                style={{
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1/1',
                  border: `2px solid ${selectedOutput === index ? 'var(--ma-accent)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <ImageWithFallback src={src} alt={`Thumb ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--ma-accent)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontFamily: 'var(--font-body)',
              }}
              onClick={() => window.api.external.open(outputs[selectedOutput])}
            >
              <Download size={14} /> Download Selected
            </button>
            <button
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontFamily: 'var(--font-body)',
              }}
            >
              <Download size={14} /> Download All (ZIP)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
