import { Sparkles, ChevronDown, Zap, Loader2, AlertCircle } from 'lucide-react'
import { useAdCopy } from '../hooks/useAdCopy'

interface AdCopyLeftPanelProps extends ReturnType<typeof useAdCopy> {
  analysisModels: any[]
}

export function AdCopyLeftPanel(props: AdCopyLeftPanelProps) {
  const {
    isGenerating,
    analysisModel,
    setAnalysisModel,
    generationError,
    showResults,
    modelDropdownOpen,
    setModelDropdownOpen,
    handleImageUpload,
    handleStartOver,
    analysisModels
  } = props

  const selectedModelLabel =
    analysisModels.find((m) => m.id === analysisModel)?.label ?? analysisModel

  if (showResults) return null

  if (isGenerating) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)'
        }}
      >
        <Loader2
          className="animate-spin"
          size={48}
          color="var(--ma-accent)"
          style={{ marginBottom: 24 }}
        />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#FFF' }}>Building Your Strategy...</h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            marginTop: 8,
            maxWidth: 400,
            textAlign: 'center',
            lineHeight: 1.6
          }}
        >
          Our AI is analyzing the product visual, determining the optimal audience and pricing tier,
          and writing high-converting ad copy.
        </p>
      </div>
    )
  }

  if (generationError) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          padding: 40
        }}
      >
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: 20 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFF', marginBottom: 12 }}>
          Generation Failed
        </h2>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth: 480,
            lineHeight: 1.6,
            marginBottom: 24
          }}
        >
          {generationError}
        </p>
        <button
          onClick={handleStartOver}
          style={{
            padding: '12px 28px',
            background: 'var(--ma-border)',
            borderRadius: 8,
            color: '#FFF',
            cursor: 'pointer'
          }}
        >
          Back to Start
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        background: 'radial-gradient(circle at top right, rgba(108, 99, 255, 0.05), transparent)'
      }}
    >
      <div style={{ width: '100%', maxWidth: 500, padding: 40, textAlign: 'center' }}>
        <div
          style={{
            width: 80,
            height: 80,
            background: 'rgba(108, 99, 255, 0.1)',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '1px solid rgba(108, 99, 255, 0.2)'
          }}
        >
          <Sparkles size={40} color="var(--ma-accent)" />
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: '#FFF',
            marginBottom: 12,
            letterSpacing: -1
          }}
        >
          AI Creative Strategist
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
            marginBottom: 32
          }}
        >
          Drop an image of your product. The AI will determine the optimal audience, price framing,
          and generate ready-to-run Arabic direct response ads.
        </p>

        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: 8,
              display: 'block'
            }}
          >
            Vision & Strategy Model
          </label>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)',
                borderRadius: 12,
                color: '#FFF',
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            >
              <span>{selectedModelLabel}</span>
              <ChevronDown size={16} color="rgba(255,255,255,0.5)" />
            </div>

            {modelDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 8,
                  background: '#1A1A1A',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}
              >
                {analysisModels.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setAnalysisModel(m.id)
                      setModelDropdownOpen(false)
                    }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      backgroundColor:
                        m.id === analysisModel ? 'rgba(108,99,255,0.1)' : 'transparent'
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF', marginBottom: 2 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      {m.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 32, textAlign: 'left' }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: 8,
              display: 'block'
            }}
          >
            Ad Copy Language
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'arabic', label: 'العربية', flag: '🇦🇪' },
              { id: 'english', label: 'English', flag: '🇺🇸' },
              { id: 'french', label: 'Français', flag: '🇫🇷' }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => props.setAdLanguage(l.id)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    props.adLanguage === l.id
                      ? 'rgba(108, 99, 255, 0.15)'
                      : 'rgba(255,255,255,0.04)',
                  outline:
                    props.adLanguage === l.id
                      ? '1.5px solid var(--ma-accent)'
                      : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 20, lineHeight: 1 }}>{l.flag}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: props.adLanguage === l.id ? '#FFF' : 'rgba(255,255,255,0.7)',
                    marginTop: 6
                  }}
                >
                  {l.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="initial-upload"
        />
        <label
          htmlFor="initial-upload"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '18px 32px',
            background: 'var(--ma-accent)',
            borderRadius: 14,
            color: '#FFF',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={20} /> Generate Launch Plan
        </label>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  )
}
