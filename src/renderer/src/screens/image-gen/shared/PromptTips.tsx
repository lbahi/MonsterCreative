import { PROMPT_TIPS } from '../constants'

export function PromptTips() {
  return (
    <div
      style={{
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 12,
        padding: 20,
        position: 'sticky',
        top: 20
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: 14,
          textTransform: 'uppercase',
          letterSpacing: '0.8px'
        }}
      >
        Prompt Tips
      </p>
      {PROMPT_TIPS.map((tip, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}
        >
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--ma-accent)',
              marginTop: 6,
              flexShrink: 0
            }}
          />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
            {tip}
          </p>
        </div>
      ))}
    </div>
  )
}
