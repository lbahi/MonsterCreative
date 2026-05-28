import React, { useState, useCallback, useMemo, useRef } from 'react';
import { RotateCcw, Check, Loader2, Layers, X, Download, Upload } from 'lucide-react';
import { AngleUploadGrid, AngleSlot, DEFAULT_SLOTS, type AngleId } from './AngleUploadGrid';

interface Phase1Props {
  images: string[];
  referenceSheetUrl: string | null;
  isGenerating: boolean;
  loadingMessage: string;
  onImagesChange: (images: string[]) => void;
  onGenerate: () => void;
  onApprove: () => void;
  onRegenerate: () => void;
  onSkipWithStoryboard: (storyboardDataUrl: string) => void;
}

export function Phase1_ProductUpload({
  images,
  referenceSheetUrl,
  isGenerating,
  loadingMessage,
  onImagesChange,
  onGenerate,
  onApprove,
  onRegenerate,
  onSkipWithStoryboard
}: Phase1Props): React.ReactElement {
  const [dragOver, setDragOver] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const storyboardSkipRef = useRef<HTMLInputElement>(null);

  const handleSkipUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onSkipWithStoryboard(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [onSkipWithStoryboard]);

  // Convert images array to slots format
  const slots: AngleSlot[] = useMemo(() => {
    return DEFAULT_SLOTS.map((slot, index) => ({
      ...slot,
      uploadedFile: images[index] ? new File([], 'uploaded') : null,
      uploadedPreviewUrl: images[index] || null,
      isUploading: false
    }));
  }, [images]);

  const filledCount = images.filter(Boolean).length;

  const handleFileSelect = useCallback((slotId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const index = DEFAULT_SLOTS.findIndex(s => s.id === slotId);
      const newImages = [...images];
      newImages[index] = reader.result as string;
      onImagesChange(newImages);
    };
    reader.readAsDataURL(file);
  }, [images, onImagesChange]);

  const handleClear = useCallback((slotId: string) => {
    const index = DEFAULT_SLOTS.findIndex(s => s.id === slotId);
    const newImages = [...images];
    newImages[index] = '';
    onImagesChange(newImages.filter(Boolean));
  }, [images, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const availableSlots = 5 - images.filter(Boolean).length;
    const toAdd = files.slice(0, availableSlots);
    
    // Find empty slots and fill them
    toAdd.forEach((file, i) => {
      const emptyIndex = images.findIndex((img, idx) => !img && idx >= i);
      if (emptyIndex !== -1) {
        const reader = new FileReader();
        reader.onload = () => {
          const newImages = [...images];
          newImages[emptyIndex] = reader.result as string;
          onImagesChange(newImages);
        };
        reader.readAsDataURL(file);
      }
    });
  }, [images, onImagesChange]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', minHeight: '500px' }}>
      {/* Left Panel - Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          background: 'var(--ma-elevated)',
          border: `1px solid ${dragOver ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Angle Upload Grid */}
        <AngleUploadGrid
          slots={slots}
          onFileSelect={(slotId, file) => handleFileSelect(slotId as AngleId, file)}
          onClear={(slotId) => handleClear(slotId as AngleId)}
          onGenerate={onGenerate}
          filledCount={filledCount}
          isGenerating={isGenerating}
        />
      </div>

      {/* Right Panel - Preview */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}
      >
        {isGenerating ? (
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} color="var(--ma-accent)" className="animate-spin" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px' }}>
              Generating Reference Sheet
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ma-text-muted)' }}>
              {loadingMessage}
            </p>
          </div>
        ) : referenceSheetUrl ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)' }}>
                Generated Product Reference Sheet
              </h3>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--ma-green)',
                  background: 'rgba(34, 197, 94, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Check size={12} /> Complete
              </span>
            </div>

            <div
              style={{
                background: 'var(--ma-bg)',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                cursor: 'pointer'
              }}
              onClick={() => setLightboxOpen(true)}
              title="Click to open in browser"
            >
              <img
                src={referenceSheetUrl}
                alt="Reference Sheet"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'contain', pointerEvents: 'none' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--ma-text-muted)', textAlign: 'center', marginTop: '-8px' }}>
              Click image to view in lightbox
            </p>

            {/* Lightbox Modal */}
            {lightboxOpen && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.92)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10000,
                  padding: '40px',
                  cursor: 'pointer'
                }}
                onClick={() => setLightboxOpen(false)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                >
                  <X size={24} color="#FFF" />
                </button>
                <img
                  src={referenceSheetUrl}
                  alt="Reference Sheet - Full Size"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    cursor: 'default'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    fontFamily: 'DM Sans'
                  }}
                >
                  Click anywhere to close
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = referenceSheetUrl;
                link.download = `reference-sheet-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--ma-surface)',
                border: '1px solid var(--ma-border)',
                borderRadius: '8px',
                color: 'var(--ma-text)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '8px'
              }}
            >
              <Download size={14} /> Download Image
            </button>

            {/* Checkpoint */}
            <div
              style={{
                background: 'rgba(108, 99, 255, 0.1)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <p style={{ fontSize: '12px', color: 'var(--ma-accent)', fontWeight: 600 }}>
                USER CHECKPOINT: Does this reference sheet accurately show your product? If not, change your input images.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onApprove}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'var(--ma-accent)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={14} /> Looks Good → Continue
                </button>
                <button
                  onClick={() => {
                    onRegenerate(); // Clear current result & set GPT Image 2 flag
                    onGenerate();   // Immediately trigger new generation
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--ma-surface)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: '8px',
                    color: 'var(--ma-text)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={14} /> Regenerate with GPT-4o
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <input
              ref={storyboardSkipRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleSkipUpload}
            />
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--ma-surface)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={28} color="rgba(255,255,255,0.4)" />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '4px' }}>
              Your product reference sheet will appear here
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)', maxWidth: '250px' }}>
              Upload photos on the left to begin
            </p>
            <div style={{ width: '100%', maxWidth: '280px', height: '1px', background: 'var(--ma-border)', margin: '8px 0' }} />
            <p style={{ fontSize: '11px', color: 'var(--ma-text-muted)' }}>or</p>
            <button
              onClick={() => storyboardSkipRef.current?.click()}
              style={{
                padding: '12px 20px',
                background: 'var(--ma-surface)',
                border: '1px solid var(--ma-border)',
                borderRadius: '10px',
                color: 'var(--ma-text)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Upload size={15} /> Upload Storyboard & Skip to Phase 2
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
