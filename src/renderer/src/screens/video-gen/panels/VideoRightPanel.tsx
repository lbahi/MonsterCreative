import React from 'react'
import { Download, Check, Film } from 'lucide-react'
import { StepChecklist } from '../../../components/ui/StepChecklist'
import { VIDEO_STEPS } from '../constants'
import { InfoRow } from '../../image-gen/shared/InfoRow'

interface VideoRightPanelProps {
  selectedModel: {
    label: string
    pricePerSec?: {
      noAudio: number
      withAudio: number
    }
  } | null
  selectedDuration: number
  selectedResolution: string
  audioEnabled: boolean
  isGenerating: boolean
  generatedVideoUrl: string | null
  currentCost?: number
}

export function VideoRightPanel({
  selectedModel,
  selectedDuration,
  selectedResolution,
  audioEnabled,
  isGenerating,
  generatedVideoUrl,
  currentCost
}: VideoRightPanelProps): React.ReactElement {
  const handleDownload = async (): Promise<void> => {
    if (!generatedVideoUrl) return
    try {
      const fileName = `monster-video-${Date.now()}.mp4`
      const result = (await window.api.utils.downloadFile({
        url: generatedVideoUrl,
        filename: fileName
      })) as { success: boolean; cancelled?: boolean; error?: string }

      if (!result.success && !result.cancelled) {
        alert('Failed to download video: ' + (result.error || 'Unknown error'))
      }
    } catch (err: unknown) {
      console.error('Download failed:', err)
      alert('Failed to download video: ' + (err as Error).message)
    }
  }

  const calculateDisplayCost = (): string => {
    if (currentCost) return currentCost.toFixed(3)

    const noAudioRate = selectedModel?.pricePerSec?.noAudio ?? 0.05
    const withAudioRate = selectedModel?.pricePerSec?.withAudio ?? noAudioRate
    const rate = audioEnabled ? withAudioRate : noAudioRate

    return (selectedDuration * rate).toFixed(3)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 24, borderBottom: '1px solid var(--ma-border)' }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#FFF',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Film size={18} color="var(--ma-accent)" /> Generation Pipeline
        </h2>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0' }}>
          Real-time status of your fashion video request.
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 24
        }}
      >
        {/* Checklist */}
        {isGenerating && <StepChecklist steps={VIDEO_STEPS} onComplete={() => {}} />}

        {/* Configuration Summary */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 12,
            border: '1px solid var(--ma-border)',
            padding: 16
          }}
        >
          <h3
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Job Configuration
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="Engine" value={selectedModel?.label || 'Kling v2.1'} />
            <InfoRow label="Duration" value={`${selectedDuration} Seconds`} />
            <InfoRow label="Resolution" value={selectedResolution} />
            <InfoRow label="Audio" value={audioEnabled ? 'Enabled' : 'None'} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 8,
                paddingTop: 12,
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Session Cost</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--ma-accent)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                ${calculateDisplayCost()}
              </span>
            </div>
          </div>
        </div>

        {/* Post-Gen Actions */}
        {generatedVideoUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={handleDownload}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--ma-accent)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Download size={18} /> Download Master
            </button>

            <button
              disabled
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--ma-border)',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'not-allowed'
              }}
            >
              <Check size={18} /> Saved to Campaign
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          padding: 20,
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid var(--ma-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Zap size={16} color="var(--ma-green)" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#FFF' }}>
              Priority Queue Active
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              Credits will be deducted upon success.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Zap({ size, color }: { size: number; color?: string }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
