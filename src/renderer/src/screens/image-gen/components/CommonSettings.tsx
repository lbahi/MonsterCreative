import { RefreshCw, Wand2 } from 'lucide-react'
import { CommonSettings as SharedCommonSettings } from '../shared/CommonSettings'

interface CommonSettingsProps {
  style: string
  setStyle: (v: string) => void
  ratio: string
  setRatio: (v: string) => void
  model: string
  setModel: (v: string) => void
  numImages: number
  setNumImages: (v: number) => void
  modelPrices: Record<string, number>
  handleGenerate: () => void
  generating: boolean
  getGeneratingText: () => string
  getGenerateButtonText: () => string
  totalCost: string
}

export function CommonSettings(props: CommonSettingsProps) {
  const {
    style,
    setStyle,
    ratio,
    setRatio,
    model,
    setModel,
    numImages,
    setNumImages,
    modelPrices,
    handleGenerate,
    generating,
    getGeneratingText,
    getGenerateButtonText,
    totalCost
  } = props

  return (
    <>
      <SharedCommonSettings
        style={style}
        setStyle={setStyle}
        ratio={ratio}
        setRatio={setRatio}
        model={model}
        setModel={setModel}
        numImages={numImages}
        setNumImages={setNumImages}
        modelPrices={modelPrices}
      />

      <button
        onClick={handleGenerate}
        disabled={generating}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: generating ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          cursor: generating ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: generating ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-body)'
        }}
      >
        {generating ? (
          <>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />{' '}
            {getGeneratingText()}
          </>
        ) : (
          <>
            <Wand2 size={16} /> {getGenerateButtonText()}
          </>
        )}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.7)',
            background: 'rgba(0,0,0,0.2)',
            padding: '2px 8px',
            borderRadius: 10
          }}
        >
          ~${totalCost}
        </span>
      </button>
    </>
  )
}
