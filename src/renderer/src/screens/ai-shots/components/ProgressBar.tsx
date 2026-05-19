interface ProgressBarProps {
  currentStep: number
  shouldShowStep4: boolean
}

export function ProgressBar({ currentStep, shouldShowStep4 }: ProgressBarProps) {
  const steps = [
    { num: 1, label: 'UPLOAD' },
    { num: 2, label: 'TYPE' },
    { num: 3, label: 'STYLE' },
    { num: 4, label: 'CASTING', conditional: true },
    { num: 5, label: 'GENERATE' }
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 600,
        margin: '0 auto 24px',
        padding: '0 16px',
        position: 'relative'
      }}
    >
      {/* Background Connecting Line */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 36,
          right: 36,
          height: 1,
          background: 'rgba(255, 255, 255, 0.08)',
          zIndex: 1
        }}
      />

      {steps.map((step) => {
        const isSkip4 = step.num === 4 && !shouldShowStep4
        const isCompleted = currentStep > step.num
        const isCurrent = currentStep === step.num

        let pillColor = 'rgba(255,255,255,0.1)'
        let labelColor = 'rgba(255,255,255,0.3)'
        let border = '1px solid transparent'

        if (isCurrent) {
          pillColor = '#6C63FF'
          labelColor = '#FFFFFF'
        } else if (isCompleted) {
          pillColor = '#6C63FF'
          labelColor = 'rgba(255,255,255,0.6)'
        } else if (isSkip4) {
          pillColor = 'rgba(255,255,255,0.03)'
          labelColor = 'rgba(255,255,255,0.1)'
          border = '1px dashed rgba(255,255,255,0.05)'
        }

        return (
          <div
            key={step.num}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              opacity: isSkip4 ? 0.35 : 1,
              transition: 'all 0.2s',
              width: 70
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: pillColor,
                border,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: isCurrent || isCompleted ? '#FFF' : 'rgba(255,255,255,0.4)',
                fontFamily: "'Outfit', sans-serif",
                boxShadow: isCurrent ? '0 0 12px rgba(108, 99, 255, 0.4)' : 'none'
              }}
            >
              {isCompleted ? '✓' : step.num}
            </div>
            <span
              style={{
                fontSize: 8,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: labelColor,
                marginTop: 6,
                letterSpacing: '0.5px'
              }}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
