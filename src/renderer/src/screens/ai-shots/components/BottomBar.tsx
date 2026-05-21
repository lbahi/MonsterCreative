import { Sparkles, Loader2 } from 'lucide-react'

interface BottomBarProps {
  currentStep: number
  setCurrentStep: (step: number) => void
  shouldShowStep4: boolean
  uploadedImages: string[]
  generating: boolean
  generateProductShots: () => void
  onExit: () => void
}

export function BottomBar({
  currentStep,
  setCurrentStep,
  shouldShowStep4,
  uploadedImages,
  generating,
  generateProductShots,
  onExit
}: BottomBarProps) {
  const handleBack = () => {
    if (generating) return
    if (currentStep === 1) {
      onExit()
      return
    }

    // Skip step 4 conditionally
    if (currentStep === 5 && !shouldShowStep4) {
      setCurrentStep(3)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleContinue = () => {
    if (generating) return

    if (currentStep === 1) {
      if (uploadedImages.length === 0) {
        alert('Please upload at least one product photo first.')
        return
      }
      setCurrentStep(2)
      return
    }

    if (currentStep === 3) {
      if (!shouldShowStep4) {
        setCurrentStep(5)
      } else {
        setCurrentStep(4)
      }
      return
    }

    if (currentStep === 5) {
      generateProductShots()
      return
    }

    setCurrentStep(currentStep + 1)
  }

  return (
    <div
      style={{
        height: 64,
        minHeight: 64,
        background: '#0B0B17',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}
    >
      {/* Back / Exit Button */}
      <button
        onClick={handleBack}
        disabled={generating}
        style={{
          padding: '8px 24px',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'transparent',
          color: generating ? 'rgba(255,255,255,0.2)' : '#FFF',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "'Outfit', sans-serif",
          cursor: generating ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s'
        }}
        className="hover-card-neon"
      >
        {currentStep === 1 ? 'Exit Feature' : 'Back'}
      </button>

      {/* Continue / Generate Button */}
      <button
        onClick={handleContinue}
        disabled={generating}
        style={{
          padding: currentStep === 5 ? '8px 24px' : '8px 28px',
          borderRadius: 8,
          border: 'none',
          background: generating ? 'rgba(108, 99, 255, 0.35)' : '#6C63FF',
          color: '#FFF',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          cursor: generating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: generating ? 'none' : '0 0 16px rgba(108, 99, 255, 0.4)',
          transition: 'all 0.15s'
        }}
        className="hover-card-neon"
      >
        {generating ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating...
          </>
        ) : currentStep === 5 ? (
          <>
            <Sparkles size={14} /> Generate Photoshoot
          </>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  )
}
