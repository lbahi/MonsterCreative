import React from 'react';
import { Upload, X } from 'lucide-react';

interface AngleSlotProps {
  index: number;
  label: string;
  emoji: string;
  badge: 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';
  image: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const BADGE_STYLES = {
  REQUIRED: {
    bg: 'rgba(236, 72, 153, 0.15)',
    color: '#EC4899',
    text: 'REQUIRED'
  },
  RECOMMENDED: {
    bg: 'rgba(108, 99, 255, 0.15)',
    color: '#6C63FF',
    text: 'RECOMMENDED'
  },
  OPTIONAL: {
    bg: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
    text: 'OPTIONAL'
  }
};

export function AngleSlot({
  label,
  emoji,
  badge,
  image,
  onUpload,
  onRemove,
  disabled
}: AngleSlotProps): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const badgeStyle = BADGE_STYLES[badge];

  const handleClick = () => {
    if (!image && !disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPG, PNG, WebP images allowed');
        return;
      }
      onUpload(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        border: `2px ${image ? 'solid' : 'dashed'}`,
        borderColor: image ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: '12px',
        padding: '16px',
        background: image ? 'var(--ma-elevated)' : 'transparent',
        cursor: image || disabled ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {image ? (
        <>
          <img
            src={image}
            alt={label}
            style={{
              width: '100%',
              height: '80px',
              objectFit: 'contain',
              borderRadius: '8px',
              marginBottom: '8px'
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#EF4444',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}
          >
            <X size={14} color="#FFF" />
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>{emoji}</div>
          <Upload size={20} color="rgba(255,255,255,0.4)" style={{ marginBottom: '8px' }} />
        </>
      )}

      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--ma-text)',
          textAlign: 'center',
          marginBottom: '4px'
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: '9px',
          fontWeight: 700,
          fontFamily: 'JetBrains Mono',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '2px 6px',
          borderRadius: '4px',
          background: badgeStyle.bg,
          color: badgeStyle.color
        }}
      >
        {badgeStyle.text}
      </span>
    </div>
  );
}
