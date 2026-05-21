import { Check, Download } from 'lucide-react'

import { StepChecklist } from '../../../components/ui/StepChecklist'
import { PLATFORM_FORMATS, RESIZE_MODELS, IMG_STEPS } from '../constants'
import { InfoRow } from '../shared/InfoRow'

type ResizeRightPanelProps = {
  generating: boolean
  generated: boolean
  resizeModel: string
  selectedFormats: string[]
  totalCost: string
  outputs: string[]
}

export function ResizeRightPanel({
  generating,
  generated,
  resizeModel,
  selectedFormats,
  totalCost,
  outputs
}: ResizeRightPanelProps) {
  const modelDef = RESIZE_MODELS.find((m) => m.id === resizeModel)
  const modelLabel = modelDef?.label ?? resizeModel
  const pricePerFormat = modelDef?.price ?? 0.04

  const selectedPlatforms = PLATFORM_FORMATS.filter((f) => selectedFormats.includes(f.id))

  const handleDownloadAll = async () => {
    for (let i = 0; i < outputs.length; i++) {
      try {
        const res = await fetch(outputs[i])
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `Resize_${selectedPlatforms[i]?.label ?? i + 1}_${Date.now()}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
        await new Promise((r) => setTimeout(r, 150))
      } catch {
        // fallback to open
        window.api.external.open(outputs[i])
      }
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* ── Header ── */}
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
          Format Resizer
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Engine:{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
            {modelLabel}
          </span>
        </p>
      </div>

      {/* ── Generating animation ── */}
      {generating && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {selectedFormats.map((_, index) => (
              <div
                key={index}
                style={{
                  flex: '1 1 40%',
                  aspectRatio: '1/1',
                  borderRadius: 8,
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  animationDelay: `${index * 0.15}s`
                }}
              />
            ))}
          </div>
          <StepChecklist
            steps={IMG_STEPS}
            onComplete={() => {}}
            estimatedTime={`~${selectedFormats.length * 6}s`}
          />
          <style>{`@keyframes pulse { 0%,100% { opacity:0.35 } 50% { opacity:0.85 } }`}</style>
        </div>
      )}

      {/* ── Idle info ── */}
      {!generating && !generated && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <InfoRow label="Model" value={modelLabel} mono />
            <InfoRow label="Workflow" value="Image Reframe" />
            <InfoRow label="Formats" value={`${selectedFormats.length} selected`} />
            <InfoRow label="Price / format" value={`$${pricePerFormat.toFixed(3)}`} mono />
            <InfoRow label="Est. total" value={`$${totalCost}`} mono green />
          </div>

          {/* Selected formats list */}
          {selectedPlatforms.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: 8
                }}
              >
                Queued Formats
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {selectedPlatforms.map((fmt) => (
                  <div
                    key={fmt.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.12)',
                      borderRadius: 7
                    }}
                  >
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                      {fmt.label}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.3)',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {fmt.w}×{fmt.h}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Done ── */}
      {generated && outputs.length > 0 && (
        <div style={{ padding: 20 }}>
          {/* Success badge */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20
            }}
          >
            <Check size={14} style={{ color: 'var(--ma-green)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>
              {outputs.length} format{outputs.length !== 1 ? 's' : ''} exported
            </span>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <InfoRow label="Model" value={modelLabel} mono />
            <InfoRow label="Generated" value={`${outputs.length} images`} />
            <InfoRow label="Total cost" value={`$${totalCost}`} mono green />
          </div>

          {/* Download All */}
          <button
            onClick={handleDownloadAll}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8,
              color: '#F59E0B',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontFamily: 'var(--font-body)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245,158,11,0.15)'
            }}
          >
            <Download size={14} /> Download All ({outputs.length})
          </button>
        </div>
      )}
    </div>
  )
}
