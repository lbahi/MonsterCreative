import { useNavigate } from 'react-router'
import { FileText, Image, Video, Music2, ArrowRight } from 'lucide-react'

const QUICK_LAUNCH = [
  {
    id: 'ad-copy',
    label: 'Ad Copy',
    description: 'Generate converting copy with AI frameworks',
    icon: <FileText size={20} />,
    path: '/ad-copy',
    color: '#6C63FF'
  },
  {
    id: 'image-gen',
    label: 'Image Gen',
    description: 'Create stunning ad creatives in seconds',
    icon: <Image size={20} />,
    path: '/image-gen/generate',
    color: '#8B5CF6'
  },
  {
    id: 'video-gen',
    label: 'Video Gen',
    description: 'Produce video ads from text or images',
    icon: <Video size={20} />,
    path: '/video-gen',
    color: '#EC4899'
  },
  {
    id: 'audio-lab',
    label: 'Audio Lab',
    description: 'Create voiceovers & music beds',
    icon: <Music2 size={20} />,
    path: '/audio-lab',
    color: '#F59E0B'
  }
]

export const QuickActions = () => {
  const navigate = useNavigate()

  return (
    <div style={{ marginBottom: 36 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 600,
            color: '#FFF',
            margin: 0
          }}
        >
          Quick Launch
        </h2>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14
        }}
      >
        {QUICK_LAUNCH.map((card) => (
          <button
            key={card.id}
            onClick={() => !card.soon && navigate(card.path)}
            style={{
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: 12,
              padding: '20px',
              cursor: card.soon ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              opacity: card.soon ? 0.55 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!card.soon) {
                ;(e.currentTarget as HTMLElement).style.borderColor = `${card.color}60`
                ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${card.color}20`
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--ma-border)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${card.color}20`,
                border: `1px solid ${card.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                marginBottom: 14
              }}
            >
              {card.icon}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#FFF',
                marginBottom: 6,
                fontFamily: 'var(--font-display)'
              }}
            >
              {card.label}
              {card.soon && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 9,
                    background: 'rgba(245,158,11,0.2)',
                    color: '#F59E0B',
                    padding: '2px 6px',
                    borderRadius: 10,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  Soon
                </span>
              )}
            </div>
            <p
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}
            >
              {card.description}
            </p>
            {!card.soon && (
              <ArrowRight
                size={14}
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  color: `${card.color}70`
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
