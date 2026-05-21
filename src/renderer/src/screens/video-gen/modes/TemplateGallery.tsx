import React, { useState } from 'react'
import { Play, Sparkles, Clock, Zap, X } from 'lucide-react'
import { VIDEO_TEMPLATES } from '../constants'
import type { VideoTemplate } from '../types'

interface TemplateGalleryProps {
  onSelectTemplate: (
    template: VideoTemplate,
    config: { model: string; duration: number; aspectRatio: string }
  ) => void
  disabled?: boolean
}

export function TemplateGallery({
  onSelectTemplate,
  disabled
}: TemplateGalleryProps): React.ReactElement {
  const [previewTemplate, setPreviewTemplate] = useState<VideoTemplate | null>(null)

  const [targetModel, setTargetModel] = useState('')
  const [targetDuration, setTargetDuration] = useState(5)
  const [targetAspect] = useState('16:9')

  const handleTemplateClick = (template: VideoTemplate): void => {
    if (!disabled) {
      setPreviewTemplate(template)
      setTargetModel(template.recommendedModelId)
      setTargetDuration(template.recommendedDuration)
    }
  }

  const handleGenerateConfirm = (): void => {
    if (previewTemplate) {
      onSelectTemplate(previewTemplate, {
        model: targetModel,
        duration: targetDuration,
        aspectRatio: targetAspect
      })
      setPreviewTemplate(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Lightbox Modal */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
          }}
        >
          {/* Close button outside standard flow */}
          <button
            onClick={() => setPreviewTemplate(null)}
            style={{
              position: 'absolute',
              top: 32,
              right: 32,
              zIndex: 10,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#FFF',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="hover:bg-white/40"
          >
            <X size={20} />
          </button>

          <div
            style={{
              background: '#FFF',
              borderRadius: 16,
              width: '100%',
              maxWidth: 900,
              display: 'flex',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
            }}
          >
            {/* Left Box: Video Preview */}
            <div
              style={{
                flex: '1.2',
                background: '#f8f8f8',
                minHeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 8,
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#000'
                }}
              >
                {previewTemplate.previewVideo ? (
                  <video
                    src={encodeURI(previewTemplate.previewVideo)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={previewTemplate.coverImage}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>

            {/* Right Box: Details */}
            <div
              style={{
                flex: '1',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                color: '#1A1A1A'
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#7C3AED',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}
                >
                  AI Video
                </h2>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                  {previewTemplate.label}
                </h3>
              </div>

              <div
                style={{ background: '#F5F3FF', borderRadius: 8, padding: 16, marginBottom: 24 }}
              >
                <p style={{ fontSize: 13, color: '#4c4c4c', margin: 0, lineHeight: 1.6 }}>
                  {previewTemplate.prompt}
                </p>
              </div>

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'auto' }}
              >
                <h3
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B7280',
                    margin: '0',
                    textTransform: 'uppercase'
                  }}
                >
                  SOURCE INSPIRATION
                </h3>
                <div
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#f5f5f5',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <img
                    src="./OutputVideos/MonsterCreative-Gen-1776519653462.png_202604192303.jpeg"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    alt="Source Inspiration"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'center',
                    color: '#666',
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={14} />
                    <span>{previewTemplate.recommendedDuration}s Duration</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}>
                    <Zap size={14} />
                    <span>Instant Execute</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerateConfirm}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#7C3AED', // solid purple like screenshot
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  className="hover:opacity-90"
                >
                  Generate now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 4
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#FFF',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Sparkles size={16} color="var(--ma-accent)" /> Action Templates
          </h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>
            Click a style to instantly orchestrate the optimal AI settings and animate the source
            image.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 16
        }}
      >
        {VIDEO_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            disabled={disabled}
            style={{
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: 12,
              padding: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'left',
              transition: 'all 0.2s',
              position: 'relative',
              opacity: disabled ? 0.5 : 1
            }}
            className={!disabled ? 'hover:border-white/20 hover:ring-2 hover:ring-white/10' : ''}
          >
            {/* Thumbnail */}
            <div style={{ width: '100%', height: 160, position: 'relative', background: '#000' }}>
              {template.previewVideo ? (
                <video
                  src={encodeURI(template.previewVideo) + '#t=0.1'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause()
                    e.currentTarget.currentTime = 0.1
                  }}
                />
              ) : (
                <img
                  src={template.coverImage}
                  alt={template.label}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 10
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FFF' }}>
                  {template.label}
                </span>
              </div>

              {/* Play icon overlay on hover */}
              <div
                className="play-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--ma-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Play size={16} color="white" style={{ marginLeft: 2 }} />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div
              style={{
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--ma-border)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                <Clock size={10} />
                <span style={{ fontSize: 10, fontWeight: 500 }}>
                  {template.recommendedDuration}s
                </span>
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ma-green)' }}
              >
                <Zap size={10} />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>
                  1-Click
                </span>
              </div>
            </div>

            <style>{`
              button:hover .play-overlay { opacity: 1 !important; }
            `}</style>
          </button>
        ))}
      </div>
    </div>
  )
}
