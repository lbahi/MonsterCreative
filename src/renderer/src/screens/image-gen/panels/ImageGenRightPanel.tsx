import { Check, Download, Video } from 'lucide-react'
import { useNavigate } from 'react-router'

import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'
import { StepChecklist } from '../../../components/ui/StepChecklist'
import { InfoRow } from '../shared/InfoRow'

type ImageGenRightPanelProps = {
  generating: boolean
  generated: boolean
  steps: any[]
  onStepsComplete: () => void
  selectedOutput: number
  setSelectedOutput: (value: number) => void
  outputs: string[]
  model: string
  ratio: string
  style: string
  numImages: number
}

export function ImageGenRightPanel({
  generating,
  generated,
  steps,
  onStepsComplete,
  selectedOutput,
  setSelectedOutput,
  outputs,
  model,
  ratio,
  style,
  numImages
}: ImageGenRightPanelProps) {
  const navigate = useNavigate()

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
          Image Panel
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>
          Model: <span style={{ fontFamily: 'var(--font-mono)' }}>{model}</span>
        </p>
      </div>

      {generating && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {Array.from({ length: numImages }).map((_, index) => (
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
          <StepChecklist steps={steps} onComplete={onStepsComplete} estimatedTime="~14 seconds" />
          <style>{`@keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:0.8 } }`}</style>
        </div>
      )}

      {!generating && !generated && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Model" value={model} mono />
            <InfoRow label="Style" value={style} />
            <InfoRow label="Ratio" value={ratio} mono />
            <InfoRow label="Quantity" value={`${numImages} images`} />
            <InfoRow label="Est. cost" value={`~$${(0.048 * numImages).toFixed(3)}`} mono green />
            <InfoRow label="Est. time" value="~14 seconds" />
          </div>
        </div>
      )}

      {generated && (
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
            <span style={{ fontSize: 12, color: 'var(--ma-green)' }}>4 images generated</span>
          </div>

          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <ImageWithFallback
              src={outputs[selectedOutput]}
              alt="Selected output"
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
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
              onClick={() => {
                navigate('/video-gen', { state: { sourceImage: outputs[selectedOutput] } })
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #EC4899, #A855F7)',
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
                marginBottom: 8
              }}
            >
              <Video size={14} /> Animate Image
            </button>
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

          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Model" value={model} mono />
            <InfoRow label="Cost" value="$0.192" mono green />
          </div>
        </div>
      )}
    </div>
  )
}
