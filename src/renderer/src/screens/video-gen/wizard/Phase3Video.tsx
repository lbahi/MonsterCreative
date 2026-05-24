/**
 * Ad Maker Wizard — Phase 3: Prompt Sandbox + Seedance 2.0 Video Generation
 */
import React, { useState } from 'react'
import { Loader2, Download, Play, Pause, Copy, Check, Music, Mic } from 'lucide-react'

interface Phase3Props {
  storyboardImageUrl: string
  seedanceVideoPrompt: string
  seedanceNegativePrompt: string
  voiceoverScript: string
  musicPrompt: string
  aspectRatio: string
  duration: number
  onComplete: (videoUrl: string) => void
}

export function Phase3Video({
  storyboardImageUrl,
  seedanceVideoPrompt,
  seedanceNegativePrompt,
  voiceoverScript,
  musicPrompt,
  aspectRatio,
  duration,
  onComplete
}: Phase3Props): React.ReactElement {
  const [prompt, setPrompt] = useState(seedanceVideoPrompt)
  const [negPrompt, setNegPrompt] = useState(seedanceNegativePrompt)
  const [generating, setGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setVideoUrl(null)

    try {
      const result = await window.api.video.generate({
        modelId: 'bytedance/seedance-2.0/image-to-video',
        prompt,
        negativePrompt: negPrompt || undefined,
        imageUrl: storyboardImageUrl,
        duration,
        aspectRatio,
        resolution: '720p',
        audio: true
      })

      if (!result?.url) throw new Error('Video generation returned no URL.')
      setVideoUrl(result.url)
      onComplete(result.url)
    } catch (err: any) {
      setError(err.message || 'Video generation failed.')
    } finally {
      setGenerating(false)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDownload = async () => {
    if (!videoUrl) return
    try {
      const fileName = `ad-maker-${Date.now()}.mp4`
      await window.api.utils.downloadFile({ url: videoUrl, filename: fileName })
    } catch (err: any) {
      console.error('Download failed:', err)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Storyboard preview thumbnail */}
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--ma-border)',
          position: 'relative',
          maxHeight: 180
        }}
      >
        <img
          src={storyboardImageUrl}
          alt="Storyboard source"
          style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 180 }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            background: 'rgba(0,0,0,0.7)',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 700,
            color: '#FFF'
          }}
        >
          Source Frame · {aspectRatio} · {duration}s
        </div>
      </div>

      {/* Prompt Sandbox */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 16
        }}
      >
        <label style={labelStyle}>Seedance Video Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={generating}
          style={{
            ...inputStyle,
            minHeight: 120,
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.6
          }}
        />
      </div>

      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 16
        }}
      >
        <label style={labelStyle}>Negative Prompt</label>
        <textarea
          value={negPrompt}
          onChange={(e) => setNegPrompt(e.target.value)}
          disabled={generating}
          placeholder="deformed, blurry, low quality, watermark, text overlay..."
          style={{
            ...inputStyle,
            minHeight: 60,
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: 1.6
          }}
        />
      </div>

      {/* Copyable Outputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <CopyCard icon={<Mic size={14} />} label="Voiceover Script" text={voiceoverScript} />
        <CopyCard icon={<Music size={14} />} label="Music Prompt" text={musicPrompt} />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: '#FCA5A5'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Video Player */}
      {videoUrl && (
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(34,197,94,0.3)',
            background: '#000'
          }}
        >
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              src={videoUrl}
              style={{ width: '100%', display: 'block' }}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
            />
            <button
              onClick={togglePlay}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.5)',
                border: 'none',
                cursor: 'pointer',
                opacity: isPlaying ? 0 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(108,99,255,0.5)'
                }}
              >
                {isPlaying ? (
                  <Pause size={24} color="white" fill="white" />
                ) : (
                  <Play size={24} color="white" fill="white" style={{ marginLeft: 3 }} />
                )}
              </div>
            </button>
          </div>

          <div
            style={{
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 6px #22c55e'
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FFF' }}>
                Ad Video Ready
              </span>
            </div>
            <button
              onClick={handleDownload}
              style={{
                background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
                color: '#FFF',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(108,99,255,0.3)'
              }}
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!videoUrl && (
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 12,
            border: 'none',
            background:
              generating || !prompt.trim()
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            color: generating || !prompt.trim() ? 'rgba(255,255,255,0.3)' : '#FFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow:
              generating || !prompt.trim()
                ? 'none'
                : '0 4px 20px rgba(108, 99, 255, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          {generating ? (
            <>
              <Loader2 size={18} className="spin" />
              Generating Video with Seedance 2.0…
            </>
          ) : (
            <>
              <Play size={18} />
              Generate Ad Video · Seedance 2.0
            </>
          )}
        </button>
      )}
    </div>
  )
}

function CopyCard({
  icon,
  label,
  text
}: {
  icon: React.ReactNode
  label: string
  text: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div
      style={{
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 12,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {icon}
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
        </div>
        <button
          onClick={copy}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--ma-border)',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 11,
            color: copied ? '#22c55e' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          lineHeight: 1.6,
          maxHeight: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {text}
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 8
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--ma-border)',
  background: 'rgba(255,255,255,0.04)',
  color: '#FFF',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box'
}
