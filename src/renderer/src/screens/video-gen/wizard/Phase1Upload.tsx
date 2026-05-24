/**
 * Ad Maker Wizard — Phase 1: Product Images + Reference Sheet
 */
import React, { useCallback, useRef, useState } from 'react'
import { Upload, X, ImagePlus, Loader2, CheckCircle2, ChevronRight } from 'lucide-react'

interface Phase1Props {
  onApprove: (params: { sourceImageUrls: string[]; referenceSheetUrl: string }) => void
}

export function Phase1Upload({ onApprove }: Phase1Props): React.ReactElement {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [refSheetUrl, setRefSheetUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 5)
    setFiles((prev) => {
      const merged = [...prev, ...valid].slice(0, 5)
      return merged
    })
    const readers = Array.from(incoming)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 5)
      .map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader()
            r.onload = () => res(r.result as string)
            r.readAsDataURL(f)
          })
      )
    Promise.all(readers).then((urls) =>
      setPreviews((prev) => [...prev, ...urls].slice(0, 5))
    )
  }, [])

  const removeFile = (idx: number) => {
    setFiles((p) => p.filter((_, i) => i !== idx))
    setPreviews((p) => p.filter((_, i) => i !== idx))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const handleGenerate = async () => {
    if (files.length < 2) {
      setError('Upload at least 2 product images.')
      return
    }
    setError(null)
    try {
      setUploading(true)
      // Upload all images to fal CDN
      const uploadedUrls: string[] = []
      for (const file of files) {
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((res) => {
          reader.onload = () => res(reader.result as string)
          reader.readAsDataURL(file)
        })
        const result = await window.api.fal.uploadImageFromDataUrl(dataUrl)
        if (result.error || !result.url) throw new Error(result.error || 'Upload failed')
        uploadedUrls.push(result.url)
      }
      setUploading(false)

      // Generate reference sheet via GPT Image 2 (nano-banana edit with all images)
      setGenerating(true)
      const refSheetResult = await window.api.fal.nanoBananaEdit({
        model: 'fal-ai/gpt-image-1',
        prompt:
          'Create a clean, professional product reference sheet collage. Arrange all provided product images in a neat grid layout on a white background. Add subtle labels. High quality, clean studio presentation. No background clutter. Perfect for commercial reference.',
        image_urls: uploadedUrls,
        resolution: '1024x1024',
        output_format: 'webp',
        num_images: 1
      })

      const refUrl =
        refSheetResult?.images?.[0]?.url ??
        refSheetResult?.image?.url ??
        (refSheetResult as any)?.url

      if (!refUrl) throw new Error('Reference sheet generation returned no image.')
      setRefSheetUrl(refUrl)
      setGenerating(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to generate reference sheet.')
      setUploading(false)
      setGenerating(false)
    }
  }

  const busy = uploading || generating

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Drop Zone */}
      {!refSheetUrl && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !busy && inputRef.current?.click()}
          style={{
            border: '2px dashed rgba(139, 92, 246, 0.4)',
            borderRadius: 16,
            padding: files.length === 0 ? '48px 24px' : '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            cursor: busy ? 'default' : 'pointer',
            background: 'rgba(139, 92, 246, 0.04)',
            transition: 'border-color 0.2s, background 0.2s'
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
          {files.length === 0 ? (
            <>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(108, 99, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Upload size={24} color="var(--ma-accent)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF' }}>
                  Drop product images here
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                  Upload 2–5 images · JPEG, PNG, WebP supported
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 10,
                width: '100%'
              }}
            >
              {previews.map((src, i) => (
                <div
                  key={i}
                  style={{ position: 'relative', borderRadius: 10, overflow: 'hidden' }}
                >
                  <img
                    src={src}
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
                    alt={`product-${i + 1}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(i)
                    }}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'rgba(0,0,0,0.7)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={12} color="#FFF" />
                  </button>
                </div>
              ))}
              {files.length < 5 && (
                <div
                  style={{
                    borderRadius: 10,
                    border: '2px dashed rgba(139,92,246,0.3)',
                    aspectRatio: '1/1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ImagePlus size={20} color="rgba(139,22,246,0.6)" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reference Sheet Preview */}
      {refSheetUrl && (
        <div
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(34,197,94,0.3)',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'rgba(34,197,94,0.9)',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 700,
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <CheckCircle2 size={12} /> Reference Sheet Generated
          </div>
          <img
            src={refSheetUrl}
            alt="Reference Sheet"
            style={{ width: '100%', borderRadius: 16, display: 'block' }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: '#FCA5A5'
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      {!refSheetUrl ? (
        <button
          onClick={handleGenerate}
          disabled={busy || files.length < 2}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background:
              busy || files.length < 2
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            color: busy || files.length < 2 ? 'rgba(255,255,255,0.3)' : '#FFF',
            fontSize: 14,
            fontWeight: 700,
            cursor: busy || files.length < 2 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow:
              busy || files.length < 2 ? 'none' : '0 4px 20px rgba(108, 99, 255, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          {busy ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          {uploading
            ? 'Uploading images…'
            : generating
              ? 'Generating Reference Sheet…'
              : `Generate Reference Sheet · ${files.length} image${files.length !== 1 ? 's' : ''}`}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setRefSheetUrl(null)
              setFiles([])
              setPreviews([])
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid var(--ma-border)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Re-Upload
          </button>
          <button
            onClick={() => {
              if (refSheetUrl) {
                onApprove({
                  sourceImageUrls: previews,
                  referenceSheetUrl: refSheetUrl
                })
              }
            }}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#FFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
            }}
          >
            <CheckCircle2 size={16} /> Approve & Continue
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

// Inline style for spinner animation
const _style = document.createElement('style')
_style.textContent = `.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`
if (!document.head.querySelector('style[data-admaker-spin]')) {
  _style.setAttribute('data-admaker-spin', '1')
  document.head.appendChild(_style)
}

function Sparkles({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  )
}
