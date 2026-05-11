import { useState } from 'react'
import { Check, Download, X } from 'lucide-react'

import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'
import { StepChecklist } from '../../../components/ui/StepChecklist'
import { IMG_STEPS } from '../constants'
import { InfoRow } from '../shared/InfoRow'

type NanoBananaRightPanelProps = {
  generating: boolean
  generated: boolean
  ratio: string
  resolution: string
  numOutputs: number
  safety: number
  search: boolean
  estimatedCost: string
  nbModel: string
  outputs: string[]
  selectedOutput: number
  setSelectedOutput: (value: number) => void
  refImage?: string | null
}

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
  refImage
}: NanoBananaRightPanelProps) {
  const [modalImage, setModalImage] = useState<string | null>(null)

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
          {nbModel}
        </h3>
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
                  animationDelay: `${index * 0.2}s`
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
              marginBottom: 20
            }}
          >
            <Check size={14} style={{ color: 'var(--ma-green)' }} />
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>Generation Complete</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: refImage ? '1fr 1fr' : '1fr',
              gap: 12,
              marginBottom: 16
            }}
          >
            {refImage && (
              <div
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--ma-border)'
                }}
              >
                <div
                  style={{
                    padding: '6px',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--ma-border)'
                  }}
                >
                  Original
                </div>
                <div onClick={() => setModalImage(refImage)} style={{ cursor: 'pointer' }}>
                  <ImageWithFallback
                    src={refImage}
                    alt="Reference"
                    style={{
                      width: '100%',
                      aspectRatio: '1/1',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  />
                </div>
              </div>
            )}
            <div
              style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--ma-border)' }}
            >
              {refImage && (
                <div
                  style={{
                    padding: '6px',
                    fontSize: 10,
                    color: 'var(--ma-accent)',
                    textAlign: 'center',
                    background: 'rgba(108,99,255,0.05)',
                    borderBottom: '1px solid var(--ma-border)'
                  }}
                >
                  Enhanced
                </div>
              )}
              <div
                onClick={() => setModalImage(outputs[selectedOutput])}
                style={{ cursor: 'pointer' }}
              >
                <ImageWithFallback
                  src={outputs[selectedOutput]}
                  alt="Selected output"
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: numOutputs > 1 ? 'repeat(4, 1fr)' : '1fr',
              gap: 6,
              marginBottom: 16
            }}
          >
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
                  transition: 'all 0.15s'
                }}
              >
                <ImageWithFallback
                  src={src}
                  alt={`Thumb ${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
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
                fontFamily: 'var(--font-body)'
              }}
              onClick={async () => {
                try {
                  const url = outputs[selectedOutput]
                  const res = await fetch(url)
                  const blob = await res.blob()
                  const blobUrl = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = blobUrl
                  a.download = `MonsterCreative-Gen-${Date.now()}.png` // Provide default name
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(blobUrl)
                } catch (err) {
                  window.api.external.open(outputs[selectedOutput])
                }
              }}
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
                fontFamily: 'var(--font-body)'
              }}
            >
              <Download size={14} /> Download All (ZIP)
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: 40
          }}
        >
          <button
            onClick={() => setModalImage(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10000
            }}
          >
            <X size={20} />
          </button>
          <img
            src={modalImage}
            alt="Fullscreen"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </div>
  )
}
