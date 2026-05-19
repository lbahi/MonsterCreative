import { Check } from 'lucide-react'

interface AiShotsSidebarPanelProps {
  generating: boolean
  generated: boolean
  model: string
  resolution: string
  aspectRatio: string
  imageCount: number
  estimatedCost: string
  productType: string
}

function InfoRow({ label, value, mono, green }: { label: string; value: any; mono?: boolean; green?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: green ? 'var(--ma-green)' : '#FFF',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)'
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function AiShotsSidebarPanel({
  generating,
  generated,
  model,
  resolution,
  aspectRatio,
  imageCount,
  estimatedCost,
  productType
}: AiShotsSidebarPanelProps) {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFF',
            margin: 0
          }}
        >
          AI Product Shots
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Workflow: <span style={{ fontFamily: 'var(--font-mono)' }}>Photoshoot</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#6C63FF',
              fontSize: 12
            }}
          >
            <span style={{ fontSize: 12 }}>⚡ Running Photoshoot...</span>
          </div>
        </div>
      )}

      {generated && (
        <div style={{ padding: '20px 20px 0' }}>
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--ma-green)',
              fontSize: 12
            }}
          >
            <Check size={14} style={{ color: 'var(--ma-green)' }} />
            <span>Photoshoot Complete</span>
          </div>
        </div>
      )}

      <div style={{ padding: 20 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#6C63FF',
            letterSpacing: '1px',
            display: 'block',
            marginBottom: 12,
            fontFamily: 'var(--font-display)'
          }}
        >
          PHOTOSHOOT ESTIMATE
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <InfoRow label="Engine" value={model} mono />
          <InfoRow label="Product Type" value={productType === 'wearable' ? 'Fashion' : 'General'} />
          <InfoRow label="Aspect Ratio" value={aspectRatio} mono />
          <InfoRow label="Resolution" value={resolution} />
          <InfoRow label="Total Photos" value={`${imageCount} images`} />
          <div style={{ height: 1, background: 'var(--ma-border)', margin: '4px 0' }} />
          <InfoRow label="Est. Cost" value={`$${estimatedCost}`} mono green />
        </div>
      </div>
    </div>
  )
}
