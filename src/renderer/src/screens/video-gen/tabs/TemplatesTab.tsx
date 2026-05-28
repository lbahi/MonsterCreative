import React from 'react'
import type { VideoTemplate } from '../types'

interface TemplatesTabProps {
  onTemplateSelect: (template: VideoTemplate, config: { model: string; duration: number; aspectRatio: string }) => void
  disabled?: boolean
}

export function TemplatesTab({ onTemplateSelect, disabled }: TemplatesTabProps): React.ReactElement {
  const templates: VideoTemplate[] = [
    { id: 'fashion', label: 'Fashion Lookbook', prompt: 'Elegant garment showcase', coverImage: '', recommendedModelId: 'default', recommendedDuration: 10 },
    { id: 'product', label: 'Product Demo', prompt: '360° product rotation', coverImage: '', recommendedModelId: 'default', recommendedDuration: 10 },
    { id: 'lifestyle', label: 'Lifestyle', prompt: 'Real-world usage scenes', coverImage: '', recommendedModelId: 'default', recommendedDuration: 10 }
  ]

  return (
    <div style={{ padding: '20px 0' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '16px' }}>
        Video Templates
      </h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template, { model: template.recommendedModelId, duration: template.recommendedDuration, aspectRatio: '9:16' })}
            disabled={disabled}
            style={{
              padding: '16px',
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              borderRadius: '12px',
              color: 'var(--ma-text)',
              textAlign: 'left',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{template.label}</div>
            <div style={{ fontSize: '12px', color: 'var(--ma-text-muted)' }}>{template.prompt}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
