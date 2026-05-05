import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

type Props = {
  dragging: boolean;
  productImageDataUrl: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: (e: React.MouseEvent) => void;
};

export const ProductImageUpload = ({
  dragging,
  productImageDataUrl,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
        1 · Product Image
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !productImageDataUrl && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--ma-accent)' : productImageDataUrl ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 10, flex: 1, minHeight: 200, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: productImageDataUrl ? 'default' : 'pointer',
          background: productImageDataUrl ? '#000' : 'rgba(255,255,255,0.02)',
          position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s'
        }}
      >
        {productImageDataUrl ? (
          <>
            <img src={productImageDataUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Product" />
            <button
              onClick={onClear}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,0.65)', border: 'none', color: '#FFF',
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <Upload size={28} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
            <span style={{ fontSize: 12, color: '#FFF', fontWeight: 600 }}>Drop product image</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>or click to browse</span>
          </>
        )}
      </div>
    </div>
  );
};
