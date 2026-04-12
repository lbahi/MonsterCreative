import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export function ImageWithFallback({ src, alt, style, ...props }: any) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--ma-border)',
        }}
      >
        <ImageIcon size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={style}
      onError={() => setError(true)}
      {...props}
    />
  );
}
