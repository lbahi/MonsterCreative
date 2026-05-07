import { X, Tag, Zap, Sparkles } from 'lucide-react';
import type { Template } from '../types';

type Props = {
  previewTemplate: Template | null;
  selectedRatio: string;
  selectedResolution: string;
  selectedLanguage: string;
  refImage: string | null;
  generating: boolean;
  onClose: () => void;
  onGenerate: () => void;
};

export const TemplatePreviewLightbox = ({
  previewTemplate,
  selectedRatio,
  selectedResolution,
  selectedLanguage,
  refImage,
  generating,
  onClose,
  onGenerate
}: Props) => {
  if (!previewTemplate) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 28, right: 28, zIndex: 10,
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#FFF', width: 38, height: 38, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s'
        }}
      >
        <X size={18} />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111318', borderRadius: 16,
          width: '100%', maxWidth: 920, display: 'flex', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
          animation: 'scaleIn 0.2s ease-out'
        }}
      >
        <div style={{
          flex: '1.2', background: '#0A0A0A', minHeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#000' }}>
            <img
              src={`./OutputSocialAds/${previewTemplate.id}.png`}
              onError={(e) => { (e.target as HTMLImageElement).src = previewTemplate.coverImage; }}
              alt={previewTemplate.category}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>

        <div style={{ flex: '1', padding: '28px 28px', display: 'flex', flexDirection: 'column', color: '#FFF' }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{
              fontSize: 11, fontWeight: 800, color: '#3B82F6',
              margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              Social Ad Template
            </h2>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0 }}>
              {previewTemplate.category}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
              background: 'rgba(59,130,246,0.15)', color: '#60A5FA',
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {previewTemplate.category}
            </span>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 14
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              <Tag size={9} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Best For
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
              {previewTemplate.bestFor}
            </p>
          </div>

          <div style={{
            background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 'auto',
            maxHeight: 180, overflowY: 'auto'
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
              Prompt Preview
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
              {previewTemplate.prompt}
              {' '}
              <span style={{ color: '#F59E0B' }}>
                This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy.
                {' '}Aspect ratio: {selectedRatio}. Resolution: {selectedResolution}.
                {' '}
                {selectedLanguage === 'english'
                  ? 'All text in English.'
                  : selectedLanguage === 'arabic'
                    ? 'All text in Arabic (عربي).'
                    : 'All text in French (Français).'}
              </span>
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>📐</span>
                <span>{selectedRatio}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>🔤</span>
                <span style={{ textTransform: 'capitalize' }}>{selectedLanguage}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981' }}>
                <Zap size={12} />
                <span>Instant Execute</span>
              </div>
            </div>

            <button
              onClick={onGenerate}
              disabled={!refImage || generating}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: refImage ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'rgba(255,255,255,0.08)',
                color: refImage ? '#FFF' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontSize: 14, fontWeight: 700,
                cursor: refImage ? 'pointer' : 'not-allowed',
                boxShadow: refImage ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Sparkles size={16} />
              {refImage ? 'Generate Image' : 'Upload product image first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
