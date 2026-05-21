import React from 'react'
import { TemplateGallery } from '../modes/TemplateGallery'
import { VideoTemplate } from '../types'

interface TemplatesTabProps {
  onTemplateSelect: (
    template: VideoTemplate,
    config: { model: string; duration: number; aspectRatio: string }
  ) => void
  disabled: boolean
}

export function TemplatesTab({ onTemplateSelect, disabled }: TemplatesTabProps): React.ReactElement {
  return <TemplateGallery onSelectTemplate={onTemplateSelect} disabled={disabled} />
}
