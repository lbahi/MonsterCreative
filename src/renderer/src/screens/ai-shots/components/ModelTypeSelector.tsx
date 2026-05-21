import { User } from 'lucide-react'

export interface ModelTemplate {
  id: string
  label: string
  gender: 'male' | 'female'
  ageRange: string
  ageMin: number
  ageMax: number
  promptFragment: string
  thumbnail: string
  color: string
}

interface ModelTypeSelectorProps {
  modelTemplates: ModelTemplate[]
  selectedModelType: ModelTemplate | null
  onSelect: (template: ModelTemplate) => void
}

export function ModelTypeSelector({
  modelTemplates,
  selectedModelType,
  onSelect
}: ModelTypeSelectorProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          display: 'block',
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace"
        }}
      >
        <User size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} /> SELECT CASTING MODEL
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {modelTemplates.map((tmpl) => {
          const isSelected = selectedModelType?.id === tmpl.id

          return (
            <div
              key={tmpl.id}
              onClick={() => onSelect(tmpl)}
              style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                aspectRatio: '3/4',
                border: `2px solid ${isSelected ? tmpl.color : 'transparent'}`,
                boxShadow: isSelected ? `0 0 16px ${tmpl.color}33` : 'none',
                transition: 'all 0.15s'
              }}
            >
              {/* Thumbnail or Placeholder */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${tmpl.color}22, ${tmpl.color}08)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={tmpl.thumbnail.replace('.png', '.thumb.webp')}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  alt={tmpl.label}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isSelected ? 1 : 0.65,
                    transition: 'opacity 0.15s'
                  }}
                  onError={(e) => {
                    // Fallback to non-web-optimized png path
                    const imgEl = e.target as HTMLImageElement
                    if (!imgEl.src.endsWith(tmpl.thumbnail)) {
                      imgEl.src = tmpl.thumbnail
                    } else {
                      imgEl.style.display = 'none'
                      imgEl.nextElementSibling?.removeAttribute('style')
                    }
                  }}
                />
                {/* Fallback icon (hidden by default, shown on image error) */}
                <div
                  style={{
                    display: 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <User size={28} color={tmpl.color} />
                </div>
              </div>

              {/* Label Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                  padding: '24px 6px 8px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isSelected ? tmpl.color : '#FFF',
                    letterSpacing: '0.5px',
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  {tmpl.label}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {tmpl.ageRange}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: tmpl.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: '#FFF',
                    fontWeight: 700
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
