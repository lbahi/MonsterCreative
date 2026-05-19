import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowLeft } from 'lucide-react'
import { useAiShots } from './hooks/useAiShots'
import { ProgressBar } from './components/ProgressBar'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'
import { BottomBar } from './components/BottomBar'

export default function AiShotsScreen() {
  const navigate = useNavigate()
  const state = useAiShots()

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 128px)',
        background: '#07070F',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.07)'
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          height: 48,
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          background: '#0B0B17',
          justifyContent: 'space-between'
        }}
      >
        <button
          onClick={() => navigate('/image-gen')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFF' }}>
          <Sparkles size={14} style={{ color: '#6C63FF' }} />
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
            AI Product Shots Studio
          </span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Control Column */}
        <LeftPanel {...state} />

        {/* Right Preview/Visual Studio Canvas */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Progress Steps header inside visual canvas area */}
          <div
            style={{
              paddingTop: 24,
              background: '#07070F',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
            }}
          >
            <ProgressBar currentStep={state.currentStep} shouldShowStep4={state.shouldShowStep4} />
          </div>

          <RightPanel {...state} />
        </div>
      </div>

      {/* Bottom Control Bar */}
      <BottomBar {...state} onExit={() => navigate('/image-gen')} />
    </div>
  )
}
export { AiShotsScreen }
