import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import type { VtonFormProps } from './types'
import { useVton } from './hooks/useVton'
import { GarmentUploadGrid } from './components/GarmentUploadGrid'
import { ModelTypeSelector } from './components/ModelTypeSelector'
import { VibeSelector } from './components/VibeSelector'
import { VtonSettings } from './components/VtonSettings'

export function VtonForm(props: VtonFormProps): React.ReactElement {
  const vton = useVton(props)
  const canGenerate = !props.generating && vton.hasMainGarment && !!vton.selectedModelType

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: 12,
          padding: 20
        }}
      >
        {/* All 3 Steps in one row */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '3fr 4fr 3fr', gap: 24, marginBottom: 20 }}
        >
          <GarmentUploadGrid
            garmentSlots={vton.garmentSlots}
            draggingSlot={vton.draggingSlot}
            setDraggingSlot={vton.setDraggingSlot}
            fileInputRefs={vton.fileInputRefs}
            onDrop={vton.handleSlotDrop}
            onFileSelect={vton.handleSlotFileSelect}
            onClear={vton.clearSlot}
            onClearAll={vton.clearAll}
            filledCount={vton.filledSlots.length}
          />

          <ModelTypeSelector
            modelTemplates={vton.modelTemplates}
            selectedModelType={vton.selectedModelType}
            onSelect={vton.setSelectedModelType}
          />

          <VibeSelector vibe={vton.vibe} onSelect={vton.setVibe} />
        </div>

        {/* Settings row */}
        <VtonSettings
          model={props.model}
          setModel={props.setModel}
          numImages={props.numImages}
          setNumImages={props.setNumImages}
          resolution={props.resolution}
          setResolution={props.setResolution}
          aspectRatio={props.aspectRatio}
          setAspectRatio={props.setAspectRatio}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={vton.generateVton}
        disabled={!canGenerate}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: !canGenerate ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          cursor: !canGenerate ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: !canGenerate ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-body)'
        }}
      >
        {props.generating ? (
          <>
            <Loader2 className="spinner" size={20} /> {vton.progressMsg}
          </>
        ) : (
          <>
            <Sparkles size={20} /> Cast & Fit ({props.numImages} Images)
          </>
        )}
      </button>
    </div>
  )
}
