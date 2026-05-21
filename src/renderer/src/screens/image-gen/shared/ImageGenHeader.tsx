import { Image } from 'lucide-react'

export function ImageGenHeader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ma-accent)'
        }}
      >
        <Image size={16} />
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: '#FFF',
          margin: 0
        }}
      >
        Image Generator
      </h1>
    </div>
  )
}
