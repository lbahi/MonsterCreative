import { Upload, X, Shirt } from 'lucide-react'
import type { GarmentSlot } from '../types'

interface GarmentUploadGridProps {
  garmentSlots: GarmentSlot[]
  draggingSlot: number | null
  setDraggingSlot: (val: number | null) => void
  fileInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onDrop: (e: React.DragEvent, slotId: number) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>, slotId: number) => void
  onClear: (e: React.MouseEvent, slotId: number) => void
  onClearAll: () => void
  filledCount: number
}

export function GarmentUploadGrid(props: GarmentUploadGridProps) {
  const {
    garmentSlots,
    draggingSlot,
    setDraggingSlot,
    fileInputRefs,
    onDrop,
    onFileSelect,
    onClear,
    onClearAll,
    filledCount
  } = props

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10
        }}
      >
        <label
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            fontWeight: 600
          }}
        >
          <Shirt size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />1 · Upload Garments (
          {filledCount}/6)
        </label>
        {filledCount > 0 && (
          <button
            onClick={onClearAll}
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {garmentSlots.map((slot, idx) => {
          const isRequired = idx === 0
          const isDragging = draggingSlot === slot.id

          return (
            <div key={slot.id} style={{ position: 'relative' }}>
              <input
                type="file"
                accept="image/*"
                ref={(el) => {
                  fileInputRefs.current[slot.id] = el
                }}
                onChange={(e) => onFileSelect(e, slot.id)}
                style={{ display: 'none' }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDraggingSlot(slot.id)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setDraggingSlot(null)
                }}
                onDrop={(e) => onDrop(e, slot.id)}
                onClick={() => !slot.image && fileInputRefs.current[slot.id]?.click()}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--ma-accent)' : slot.image ? 'transparent' : isRequired ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  aspectRatio: '3/4',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: slot.image ? 'default' : 'pointer',
                  background: slot.image
                    ? '#000'
                    : isDragging
                      ? 'rgba(108,99,255,0.05)'
                      : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {slot.image ? (
                  <>
                    <img
                      src={slot.image}
                      alt={slot.label}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <button
                      onClick={(e) => onClear(e, slot.id)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload
                      size={16}
                      color={isDragging ? 'var(--ma-accent)' : 'rgba(255,255,255,0.15)'}
                      style={{ marginBottom: 4 }}
                    />
                    <p
                      style={{
                        fontSize: 9,
                        color: isRequired ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.25)',
                        margin: 0,
                        textAlign: 'center',
                        padding: '0 4px',
                        lineHeight: 1.3
                      }}
                    >
                      {slot.label}
                    </p>
                    {isRequired && (
                      <span
                        style={{
                          fontSize: 8,
                          color: 'var(--ma-accent)',
                          marginTop: 2,
                          fontWeight: 700
                        }}
                      >
                        REQUIRED
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
