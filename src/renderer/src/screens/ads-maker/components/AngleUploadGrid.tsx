import React, { useRef, useCallback } from 'react';
import { Upload, X, Check, Loader2, Lightbulb } from 'lucide-react';
import frontGuide from '../../../assets/angle-guides/front.svg';
import leftGuide from '../../../assets/angle-guides/left.svg';
import rightGuide from '../../../assets/angle-guides/right.svg';
import backGuide from '../../../assets/angle-guides/back.svg';
import topGuide from '../../../assets/angle-guides/top.svg';

export type AngleId = 'front' | 'left' | 'right' | 'back' | 'top';
export type BadgeType = 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';

export interface AngleSlot {
  id: AngleId;
  label: string;
  badge: BadgeType;
  guideImage: string;
  uploadedFile: File | null;
  uploadedPreviewUrl: string | null;
  isUploading?: boolean;
}

interface AngleUploadGridProps {
  slots: AngleSlot[];
  onFileSelect: (slotId: AngleId, file: File) => void;
  onClear: (slotId: AngleId) => void;
  onGenerate?: () => void;
  filledCount: number;
  isGenerating?: boolean;
}

const DEFAULT_SLOTS: Omit<AngleSlot, 'uploadedFile' | 'uploadedPreviewUrl'>[] = [
  { id: 'front', label: 'Front View', badge: 'REQUIRED', guideImage: frontGuide },
  { id: 'left', label: 'Left Side', badge: 'RECOMMENDED', guideImage: leftGuide },
  { id: 'right', label: 'Right Side', badge: 'RECOMMENDED', guideImage: rightGuide },
  { id: 'back', label: 'Back View', badge: 'RECOMMENDED', guideImage: backGuide },
  { id: 'top', label: 'Top View', badge: 'OPTIONAL', guideImage: topGuide }
];

export function AngleUploadGrid({
  slots,
  onFileSelect,
  onClear,
  onGenerate,
  filledCount,
  isGenerating = false
}: AngleUploadGridProps): React.ReactElement {
  const fileInputRefs = useRef<Record<AngleId, HTMLInputElement | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
    top: null
  });

  const handleSlotClick = useCallback((slotId: AngleId) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot?.uploadedFile && !slot?.isUploading && !isGenerating) {
      fileInputRefs.current[slotId]?.click();
    }
  }, [slots, isGenerating]);

  const handleFileChange = useCallback((slotId: AngleId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      onFileSelect(slotId, file);
    }
    e.target.value = '';
  }, [onFileSelect]);

  const getBadgeStyles = (badge: BadgeType) => {
    switch (badge) {
      case 'REQUIRED':
        return { bg: 'var(--ma-accent)', color: '#FFF' };
      case 'RECOMMENDED':
        return { bg: 'rgba(108,99,255,0.2)', color: 'var(--ma-accent)' };
      case 'OPTIONAL':
        return { bg: 'rgba(255,255,255,0.06)', color: 'var(--ma-text-muted)' };
    }
  };

  const renderSlot = (slot: AngleSlot) => {
    const hasImage = !!slot.uploadedPreviewUrl;
    const badgeStyle = getBadgeStyles(slot.badge);

    return (
      <div
        key={slot.id}
        onClick={() => handleSlotClick(slot.id)}
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          cursor: hasImage || slot.isUploading || isGenerating ? 'default' : 'pointer',
          aspectRatio: '3/4',
          border: `2px solid ${hasImage ? 'var(--ma-green)' : 'transparent'}`,
          transition: 'all 0.15s'
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: hasImage ? '#141418' : '#141418'
          }}
        >
          <img
            src={slot.uploadedPreviewUrl || slot.guideImage}
            alt={slot.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: hasImage ? 1 : 0.7,
              display: 'block'
            }}
            onError={() => console.error('[AngleUploadGrid] Image failed to load')}
          />
        </div>

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: hasImage
              ? 'linear-gradient(to bottom, transparent 60%, rgba(7,7,15,0.7) 100%)'
              : 'linear-gradient(to bottom, transparent 40%, rgba(7,7,15,0.85) 100%)'
          }}
        />

        {/* Empty State - Upload Icon on Hover */}
        {!hasImage && !slot.isUploading && (
          <div
            className="upload-overlay"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
              background: 'rgba(7,7,15,0.5)'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.opacity = '0';
            }}
          >
            <Upload size={28} color="#FFF" />
          </div>
        )}

        {/* Uploading State */}
        {slot.isUploading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(7,7,15,0.6)'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '3px solid rgba(108,99,255,0.2)',
                borderTopColor: 'var(--ma-accent)',
                animation: 'spin 0.8s linear infinite'
              }}
            />
          </div>
        )}

        {/* Label & Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
            padding: '28px 12px 10px',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#FFF',
              fontFamily: "'Outfit', sans-serif",
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {slot.label}
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              background: badgeStyle.bg,
              color: badgeStyle.color
            }}
          >
            {slot.badge}
          </span>
        </div>

        {/* Filled State - Remove Button */}
        {hasImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear(slot.id);
            }}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <X size={12} color="#FFF" />
          </button>
        )}

        {/* Filled State - Green Checkmark */}
        {hasImage && (
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'var(--ma-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <Check size={11} color="#FFF" strokeWidth={3} />
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={el => { fileInputRefs.current[slot.id] = el }}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(slot.id, e)}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  return (
    <div>
      {/* Section Header */}
      <div style={{ marginBottom: 20 }}>
        {/* Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12
          }}
        >
          <div
            style={{
              width: 20,
              height: 1,
              background: 'var(--ma-accent)'
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--ma-accent)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            Product Angles
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--ma-text)',
            fontFamily: "'Outfit', sans-serif",
            marginBottom: 8
          }}
        >
          How does your product look?
        </h2>

        {/* Subtext */}
        <p
          style={{
            fontSize: 14,
            fontWeight: 300,
            color: 'var(--ma-text-muted)',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 16,
            lineHeight: 1.5
          }}
        >
          Upload photos from different angles. The AI will reconstruct your product accurately from multiple perspectives.
        </p>

        {/* Helper Tip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            background: 'rgba(108,99,255,0.06)',
            border: '1px solid rgba(108,99,255,0.2)',
            borderRadius: 10,
            marginBottom: 20
          }}
        >
          <Lightbulb size={16} color="var(--ma-accent)" style={{ marginTop: 1 }} />
          <p
            style={{
              fontSize: 12,
              color: 'var(--ma-text-muted)',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Include a photo of the packaging label. Clear brand text helps the AI generate more accurate commercial storyboards.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {/* Top Row - 3 slots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {slots.slice(0, 3).map(renderSlot)}
        </div>

        {/* Bottom Row - 2 slots, centered */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12
          }}
        >
          <div /> {/* Empty spacer */}
          {slots.slice(3, 5).map(renderSlot)}
          <div /> {/* Empty spacer */}
        </div>
      </div>

      {/* Helper Text */}
      <p
        style={{
          fontSize: 12,
          color: 'var(--ma-text-muted)',
          textAlign: 'center',
          marginBottom: 20
        }}
      >
        📸 3+ angles recommended for best results
      </p>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={filledCount === 0 || isGenerating}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: filledCount === 0 ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          cursor: filledCount === 0 ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Outfit', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: filledCount === 0 ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
          opacity: filledCount === 0 ? 0.4 : 1
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="spinner" />
            Generating Reference Sheet...
          </>
        ) : filledCount === 0 ? (
          'Upload at least 1 photo to continue'
        ) : (
          <>
            Generate Reference Sheet {filledCount > 0 && `(${filledCount} photo${filledCount > 1 ? 's' : ''})`} →
          </>
        )}
      </button>
    </div>
  );
}

export { DEFAULT_SLOTS, frontGuide, leftGuide, rightGuide, backGuide, topGuide };
