import React, { useState, useEffect, useCallback } from 'react'
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react'

import { ImageWithFallback } from '../../../components/figma/ImageWithFallback'

type OutputGridProps = {
  outputs: string[]
  selectedOutput: number
  setSelectedOutput: (value: number) => void
  naturalRatio?: boolean
}

export function OutputGrid({
  outputs,
  selectedOutput,
  setSelectedOutput,
  naturalRatio = false
}: OutputGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (selectedOutput < outputs.length - 1) {
        setSelectedOutput(selectedOutput + 1)
      }
    },
    [selectedOutput, outputs.length, setSelectedOutput]
  )

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (selectedOutput > 0) {
        setSelectedOutput(selectedOutput - 1)
      }
    },
    [selectedOutput, setSelectedOutput]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, handleNext, handlePrev])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}
        >
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
            fontFamily: 'var(--font-body)'
          }}
        >
          <Download size={12} /> Download All
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {outputs.map((src, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedOutput(index)
              setLightboxOpen(true)
            }}
            style={{
              borderRadius: 10,
              overflow: 'hidden',
              border: `2px solid ${selectedOutput === index ? 'var(--ma-accent)' : 'transparent'}`,
              cursor: 'zoom-in',
              transition: 'all 0.15s',
              boxShadow: selectedOutput === index ? '0 0 20px rgba(108,99,255,0.3)' : 'none',
              aspectRatio: naturalRatio ? undefined : '1/1'
            }}
          >
            <ImageWithFallback
              src={src}
              alt={`Output ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          {selectedOutput > 0 && (
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: 40,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10000,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Right Arrow */}
          {selectedOutput < outputs.length - 1 && (
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: 40,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10000,
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '85vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <img
              src={outputs[selectedOutput]}
              alt={`Fullscreen ${selectedOutput + 1}`}
              style={{
                maxHeight: '85vh',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 16,
                boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
              }}
            />
            {/* Pagination / Download inside Lightbox */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 24
              }}
            >
              <span
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {selectedOutput + 1} / {outputs.length}
              </span>
              <button
                onClick={async () => {
                  try {
                    const url = outputs[selectedOutput]
                    const res = await fetch(url)
                    const blob = await res.blob()
                    const blobUrl = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = blobUrl
                    a.download = `MonsterCreative-Gen-${Date.now()}.png`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(blobUrl)
                  } catch (err) {
                    window.api.external.open(outputs[selectedOutput])
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--ma-accent)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)'
                }}
              >
                <Download size={14} /> Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
