import { useState } from 'react'
import { Upload, Sparkles, Download, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RightPanelProps {
  currentStep: number
  uploadedImages: string[]
  activeImageIndex: number
  generating: boolean
  statusText: string
  generated: boolean
  generatedImages: string[]
  selectedOutput: number
  setSelectedOutput: (idx: number | ((prev: number) => number)) => void
  shotStyle: string
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
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: "'Outfit', sans-serif" }}>{label}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: green ? '#22C55E' : '#FFF',
          fontFamily: mono ? "'JetBrains Mono', monospace" : "'Outfit', sans-serif"
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function RightPanel({
  uploadedImages,
  activeImageIndex,
  generating,
  statusText,
  generated,
  generatedImages,
  selectedOutput,
  setSelectedOutput,
  shotStyle,
  model,
  resolution,
  aspectRatio,
  imageCount,
  estimatedCost,
  productType
}: RightPanelProps) {
  const [lightboxActive, setLightboxActive] = useState(false)
  const activePreviewImage = uploadedImages[activeImageIndex] || null

  const handleDownload = async (url: string, index: number) => {
    try {
      await window.api.utils.downloadFile({
        url,
        filename: `monstercreative_shot_${index + 1}_${Date.now()}.jpg`
      })
    } catch (err) {
      console.error(err)
      alert('Download failed')
    }
  }

  return (
    <div
      style={{
        flex: 1,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#07070F', // Design brief: Canvas background color
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {generating ? (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(108, 99, 255, 0.08)',
              border: '1px solid rgba(108, 99, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#6C63FF',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          >
            <Sparkles size={20} style={{ animation: 'spin 4s linear infinite' }} />
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#FFF',
              marginBottom: 6,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            Synthesizing Creative Scene
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.4)', lineHeight: 1.5 }}>
            {statusText || 'Executing premium multi-stage product blend. Please wait.'}
          </p>
          <div
            style={{
              width: '100%',
              height: 3,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 1.5,
              marginTop: 16,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: '60%',
                background: '#6C63FF',
                borderRadius: 1.5,
                animation: 'loadingProgress 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      ) : generated && generatedImages.length > 0 ? (
        /* Final Generated Output Layout */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            width: '100%',
            height: '100%',
            maxWidth: 680
          }}
        >
          {/* Main Active Image Box */}
          <div
            onClick={() => setLightboxActive(true)}
            style={{
              position: 'relative',
              width: '100%',
              maxHeight: 320,
              aspectRatio: '16/10',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#11111A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              cursor: 'zoom-in'
            }}
          >
            <img
              src={generatedImages[selectedOutput]}
              alt="Generated photoshoot output"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 6
              }}
            />
            {/* Quick Actions overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                display: 'flex',
                gap: 8
              }}
            >
              <button
                onClick={() => handleDownload(generatedImages[selectedOutput], selectedOutput)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFF',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                className="hover-card-neon"
              >
                <Download size={12} /> Download
              </button>
              <a
                href={generatedImages[selectedOutput]}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFF',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.15s'
                }}
                className="hover-card-neon"
              >
                <ExternalLink size={12} /> View HD
              </a>
            </div>
          </div>

          {/* Grid Selection Carousel */}
          <div>
            <span
              style={{
                fontSize: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '1px',
                display: 'block',
                textAlign: 'center',
                marginBottom: 8
              }}
            >
              SELECT VARIATION
            </span>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {generatedImages.map((imgUrl, idx) => {
                const isSelected = selectedOutput === idx
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOutput(idx)}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      border: `2.5px solid ${isSelected ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                      padding: 2,
                      background: '#11111A',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 10px rgba(108,99,255,0.3)' : 'none',
                      transition: 'all 0.15s',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={imgUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : activePreviewImage ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            width: '100%',
            height: '100%'
          }}
        >
          <div
            style={{
              maxWidth: 300,
              maxHeight: 300,
              width: '100%',
              height: '100%',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: '#11111A', // Design brief: Card Background
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <img
              src={activePreviewImage}
              alt="Product context"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.5))'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                background: 'rgba(0, 0, 0, 0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 8,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              Preview Canvas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.18)',
                borderRadius: 4,
                color: '#22C55E',
                padding: '2px 8px',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              ✓ Ready for photoshoot
            </span>
            {shotStyle === 'model' && (
              <span
                style={{
                  background: 'rgba(108,99,255,0.08)',
                  border: '1px solid rgba(108,99,255,0.18)',
                  borderRadius: 4,
                  color: 'rgba(255,255,255,0.8)',
                  padding: '2px 8px',
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                Model casting active
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '2px dashed rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: 'rgba(255,255,255,0.1)'
            }}
          >
            <Upload size={24} />
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.25)', display: 'block' }}>
            Your product photo preview will appear here
          </span>
        </div>
      )}

      {/* Floating Specs & Price Estimator Card */}
      {!generating && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 240,
            background: 'rgba(11, 11, 23, 0.75)',
            backdropFilter: 'blur(16px)',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: 16,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 10,
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#6C63FF',
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }}
          >
            Photoshoot Estimate
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <InfoRow label="Engine" value={model} mono />
            <InfoRow label="Product Type" value={productType === 'wearable' ? 'Fashion' : 'General'} />
            <InfoRow label="Aspect Ratio" value={aspectRatio} mono />
            <InfoRow label="Resolution" value={resolution} />
            <InfoRow label="Total Photos" value={`${imageCount} images`} />
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <InfoRow label="Est. Cost" value={`$${estimatedCost}`} mono green />
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal with swiping & direct download */}
      {lightboxActive && generatedImages.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 10, 0.95)',
            backdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
          }}
          onClick={() => setLightboxActive(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxActive(false)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            <X size={20} />
          </button>

          {/* Left Arrow */}
          {generatedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOutput((prev) => (prev === 0 ? generatedImages.length - 1 : prev - 1))
              }}
              style={{
                position: 'absolute',
                left: 24,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10000,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Center Image Container */}
          <div
            style={{
              position: 'relative',
              maxHeight: '80vh',
              maxWidth: '80vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={generatedImages[selectedOutput]}
              alt="Fullscreen photoshoot preview"
              style={{
                maxHeight: '70vh',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 14,
                boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />

            {/* Direct download & view HD links */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => handleDownload(generatedImages[selectedOutput], selectedOutput)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#6C63FF',
                  border: 'none',
                  color: '#FFF',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(108,99,255,0.4)',
                  transition: 'all 0.2s',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <Download size={14} /> Download Image
              </button>
              <a
                href={generatedImages[selectedOutput]}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFF',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontFamily: "'Outfit', sans-serif"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              >
                <ExternalLink size={14} /> Open in Browser
              </a>
            </div>
          </div>

          {/* Right Arrow */}
          {generatedImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOutput((prev) => (prev === generatedImages.length - 1 ? 0 : prev + 1))
              }}
              style={{
                position: 'absolute',
                right: 24,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10000,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
