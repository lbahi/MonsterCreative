import React, { useCallback, useRef } from 'react';
import { RefreshCw, Upload, Wand2, X } from 'lucide-react';

import { PLATFORM_FORMATS, RESIZE_MODELS, type PlatformFormat } from '../constants';

/* ─── SVG Platform Logos ──────────────────────────────────────────────────── */
function LogoMeta() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M6.915 4.03c-1.968.02-3.3 1.06-4.6 2.9-1.16 1.64-2.25 4.4-2.315 6.5-.017.6.065 1.1.255 1.47.2.39.528.64.965.64.74 0 1.42-.55 2.22-1.65.87-1.194 1.65-3.01 2.22-4.77.44-1.354.845-2.54 1.57-3.19.64-.57 1.36-.78 2.11-.78.44 0 .89.08 1.34.25C9.7 5.816 8.295 4 6.915 4.03zM12 7.05c-1.25 0-2.475 1.53-3.25 3.95-.77 2.41-1.19 5.39-.75 6.6.194.547.556.88.998.88.44 0 .9-.335 1.33-1.045.19-.314.6-1.25.6-1.25s.41.936.6 1.25c.43.71.89 1.045 1.33 1.045.442 0 .804-.333.998-.88.44-1.21.02-4.19-.75-6.6C14.475 8.58 13.25 7.05 12 7.05zM17.085 4.03c-1.38-.03-2.785 1.786-3.765 1.39.45-.17.9-.25 1.34-.25.75 0 1.47.21 2.11.78.725.65 1.13 1.836 1.57 3.19.57 1.76 1.35 3.576 2.22 4.77.8 1.1 1.48 1.65 2.22 1.65.437 0 .764-.25.965-.64.19-.37.272-.87.255-1.47-.065-2.1-1.155-4.86-2.315-6.5-1.3-1.84-2.632-2.88-4.6-2.9z" fill="#0866FF"/>
    </svg>
  );
}
function LogoInstagram() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <defs><radialGradient id="ig2" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig2)"/>
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
  );
}
function LogoTikTok() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <rect width="24" height="24" rx="4" fill="#010101"/>
      <path d="M16.6 7.3c-.9-.6-1.5-1.6-1.6-2.8H12.8v10c-.1.9-.8 1.6-1.8 1.6-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8c.2 0 .4 0 .6.1v-2.4c-.2 0-.4-.1-.6-.1-2.3 0-4.1 1.8-4.1 4.1s1.8 4.1 4.1 4.1 4.1-1.8 4.1-4.1V9.5c.8.6 1.8.9 2.8.9V8.2c-.5 0-1-.3-1.3-.9z" fill="white"/>
    </svg>
  );
}
function LogoFacebook() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0 5.373 0 0 5.405 0 12.073c0 6.028 4.388 11.024 10.125 11.926V15.55H7.078v-3.477h3.047v-2.65c0-3.023 1.79-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.967H15.83c-1.491 0-1.956.93-1.956 1.885v2.26h3.328l-.532 3.477h-2.796v8.449C19.612 23.097 24 18.1 24 12.073z"/></svg>;
}
function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function LogoPinterest() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="#E60023"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
}
function LogoTwitter() {
  return <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.728-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
}
function LogoWooCommerce() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16"><rect width="24" height="24" rx="4" fill="#7F54B3"/><text x="3" y="16" fontSize="8" fontWeight="800" fill="white" fontFamily="sans-serif">Woo</text></svg>
  );
}

const LOGOS: Record<string, JSX.Element> = {
  Meta: <LogoMeta />, Instagram: <LogoInstagram />, TikTok: <LogoTikTok />,
  Facebook: <LogoFacebook />, Google: <LogoGoogle />, Pinterest: <LogoPinterest />,
  Twitter: <LogoTwitter />, WooCommerce: <LogoWooCommerce />,
};

/* ─── Ratio preview box ───────────────────────────────────────────────────── */
function RatioBox({ w, h }: { w: number; h: number }) {
  const maxW = 22; const maxH = 28;
  const ratio = w / h;
  let pw: number, ph: number;
  if (ratio >= 1) { pw = maxW; ph = Math.max(8, Math.round(maxW / ratio)); }
  else { ph = maxH; pw = Math.max(8, Math.round(maxH * ratio)); }
  return (
    <div style={{ width: 24, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: pw, height: ph, border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 2, background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

/* ─── Platform Card ───────────────────────────────────────────────────────── */
function PlatformCard({ fmt, selected, onToggle, customW, customH, onCustomW, onCustomH }: {
  fmt: PlatformFormat; selected: boolean; onToggle: () => void;
  customW: number; customH: number; onCustomW: (v: number) => void; onCustomH: (v: number) => void;
}) {
  const isCustom = fmt.aspectRatioEnum === null;
  return (
    <div
      onClick={onToggle}
      style={{
        padding: '6px 8px',
        background: selected ? 'rgba(108,99,255,0.14)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected ? 'var(--ma-border-accent)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.13s',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        userSelect: 'none',
        minHeight: 36,
      }}
    >
      {!isCustom && <RatioBox w={fmt.w} h={fmt.h} />}
      {!isCustom && <span style={{ flexShrink: 0 }}>{LOGOS[fmt.platform]}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: selected ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fmt.label}
          </span>
          {isCustom && (
            <span style={{ fontSize: 9, background: 'rgba(245,158,11,0.18)', color: '#F59E0B', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>Custom</span>
          )}
        </div>
        {!isCustom && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>
            {fmt.w}×{fmt.h}
          </span>
        )}
        {isCustom && selected && (
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 5, marginTop: 5 }}>
            <input
              type="number" value={customW} min={100} max={4000}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onCustomW(parseInt(e.target.value) || fmt.w)}
              placeholder="Width"
              style={{ width: 65, padding: '3px 6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, color: 'white', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, alignSelf: 'center' }}>×</span>
            <input
              type="number" value={customH} min={100} max={4000}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onCustomH(parseInt(e.target.value) || fmt.h)}
              placeholder="Height"
              style={{ width: 65, padding: '3px 6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 5, color: 'white', fontSize: 10, fontFamily: 'var(--font-mono)', outline: 'none' }}
            />
          </div>
        )}
      </div>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${selected ? 'var(--ma-accent)' : 'rgba(255,255,255,0.18)'}`,
        background: selected ? 'var(--ma-accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.13s',
      }}>
        {selected && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white' }} />}
      </div>
    </div>
  );
}

/* ─── Shared Styles ───────────────────────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: 'var(--ma-elevated)',
  border: '1px solid var(--ma-border)',
  borderRadius: 12,
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};
const cardNumRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.85)',
};
const dashedBox: React.CSSProperties = {
  flex: 1,
  border: '1.5px dashed rgba(255,255,255,0.1)',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: '16px 12px',
  minHeight: 120,
};
const infoRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

function NumBadge({ n }: { n: number }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: 'rgba(108,99,255,0.25)',
      border: '1.5px solid rgba(108,99,255,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: 'var(--ma-accent-light)',
      flexShrink: 0,
    }}>
      {n}
    </div>
  );
}

/* ─── Types ───────────────────────────────────────────────────────────────── */
export type ResizeCustomDimensions = Record<string, { w: number; h: number }>;

export type ResizeFormProps = {
  sourceFile: File | null;
  setSourceFile: (f: File | null) => void;
  selectedFormats: string[];
  setSelectedFormats: (ids: string[]) => void;
  resizeModel: string;
  setResizeModel: (m: string) => void;
  customDimensions: ResizeCustomDimensions;
  setCustomDimensions: (d: ResizeCustomDimensions) => void;
  onGenerate: () => void;
  generating: boolean;
  totalCost: string;
};

/* ─── Main Component ──────────────────────────────────────────────────────── */
export function ResizeForm({
  sourceFile, setSourceFile,
  selectedFormats, setSelectedFormats,
  resizeModel, setResizeModel,
  customDimensions, setCustomDimensions,
  onGenerate, generating, totalCost,
}: ResizeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSourceFile(file);
  }, [setSourceFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const toggleFormat = useCallback((id: string) => {
    const fmt = PLATFORM_FORMATS.find((f) => f.id === id);
    if (fmt && fmt.aspectRatioEnum === null && !customDimensions[id]) {
      setCustomDimensions({ ...customDimensions, [id]: { w: fmt.w, h: fmt.h } });
    }
    setSelectedFormats(
      selectedFormats.includes(id)
        ? selectedFormats.filter((x) => x !== id)
        : [...selectedFormats, id],
    );
  }, [selectedFormats, setSelectedFormats, customDimensions, setCustomDimensions]);

  const setCustomW = (id: string, w: number) =>
    setCustomDimensions({ ...customDimensions, [id]: { ...(customDimensions[id] ?? {}), w } });
  const setCustomH = (id: string, h: number) =>
    setCustomDimensions({ ...customDimensions, [id]: { ...(customDimensions[id] ?? {}), h } });

  const previewUrl = sourceFile ? URL.createObjectURL(sourceFile) : null;
  const modelDef = RESIZE_MODELS.find((m) => m.id === resizeModel);
  const isDisabled = generating || !sourceFile || selectedFormats.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-body)' }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

      {/* ── Row 1: Three Numbered Standalone Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>

        {/* 1 — Source Image */}
        <div style={cardStyle}>
          <div style={cardNumRow}><NumBadge n={1} />Source Image</div>
          {sourceFile && previewUrl ? (
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', minHeight: 140, flex: 1 }}>
              <img src={previewUrl} alt="Source" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 140 }} />
              <button
                onClick={(e) => { e.stopPropagation(); setSourceFile(null); }}
                style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
              >
                <X size={11} />
              </button>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.65))', padding: '8px 8px 6px', fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sourceFile.name}
              </div>
            </div>
          ) : (
            <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} style={{ ...dashedBox, cursor: 'pointer' }}>
              <Upload size={24} color="rgba(108,99,255,0.55)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Upload Source</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.4 }}>Drop image or click<br />to browse</span>
            </div>
          )}
        </div>

        {/* 2 — Resize Engine */}
        <div style={cardStyle}>
          <div style={cardNumRow}><NumBadge n={2} />Resize Engine</div>
          <div style={dashedBox}>
            <select
              value={resizeModel}
              onChange={(e) => setResizeModel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: 'rgba(255,255,255,0.9)',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: 36,
              }}
            >
              {RESIZE_MODELS.map((m) => (
                <option key={m.id} value={m.id} style={{ background: '#1a1a2e', color: 'white' }}>
                  {m.label}
                </option>
              ))}
            </select>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={infoRow}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Price / format</span>
                <span style={{ fontSize: 12, color: '#F59E0B', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${modelDef?.price.toFixed(3)}</span>
              </div>
              <div style={infoRow}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Endpoint</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>{modelDef?.endpoint.split('/').slice(-2).join('/')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 — Format Summary */}
        <div style={cardStyle}>
          <div style={cardNumRow}><NumBadge n={3} />Format Summary</div>
          <div style={dashedBox}>
            {selectedFormats.length === 0 ? (
              <>
                <div style={{ fontSize: 32, opacity: 0.15, lineHeight: 1 }}>◻</div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.5 }}>
                  No formats selected.<br />Pick from the grid below.
                </span>
              </>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--ma-accent-light)', lineHeight: 1 }}>{selectedFormats.length}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>formats selected</span>
                </div>
                <div style={infoRow}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Est. total</span>
                  <span style={{ fontSize: 13, color: '#22C55E', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>${totalCost}</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {selectedFormats.slice(0, 6).map((id) => {
                    const f = PLATFORM_FORMATS.find((p) => p.id === id);
                    return f ? (
                      <span key={id} style={{ fontSize: 9, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 4, padding: '2px 6px', color: 'rgba(255,255,255,0.6)' }}>
                        {f.label}
                      </span>
                    ) : null;
                  })}
                  {selectedFormats.length > 6 && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', padding: '2px 4px' }}>+{selectedFormats.length - 6} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Export Formats Grid ── */}
      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.9px', fontWeight: 600 }}>
            Export Formats
          </span>
          <button
            onClick={() => setSelectedFormats(
              selectedFormats.length === PLATFORM_FORMATS.length ? [] : PLATFORM_FORMATS.map((f) => f.id),
            )}
            style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            {selectedFormats.length === PLATFORM_FORMATS.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {PLATFORM_FORMATS.map((fmt) => (
            <PlatformCard
              key={fmt.id} fmt={fmt}
              selected={selectedFormats.includes(fmt.id)}
              onToggle={() => toggleFormat(fmt.id)}
              customW={customDimensions[fmt.id]?.w ?? fmt.w}
              customH={customDimensions[fmt.id]?.h ?? fmt.h}
              onCustomW={(v) => setCustomW(fmt.id, v)}
              onCustomH={(v) => setCustomH(fmt.id, v)}
            />
          ))}
        </div>
      </div>

      {/* ── Resize Button ── */}
      <button
        onClick={onGenerate}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: isDisabled ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, var(--ma-accent) 0%, #8B5CF6 100%)',
          color: isDisabled ? 'rgba(255,255,255,0.3)' : 'white',
          border: 'none',
          borderRadius: 10,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: isDisabled ? 'none' : '0 4px 20px rgba(108,99,255,0.35)',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-body)',
          letterSpacing: '0.3px',
        }}
      >
        {generating ? (
          <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Resizing Formats...</>
        ) : !sourceFile ? (
          <><Upload size={15} /> Upload a source image first</>
        ) : selectedFormats.length === 0 ? (
          <>Select at least one format</>
        ) : (
          <><Wand2 size={15} /> Resize {selectedFormats.length} Format{selectedFormats.length !== 1 ? 's' : ''}</>
        )}
        {!isDisabled && (
          <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.2)', padding: '2px 10px', borderRadius: 10 }}>
            ~${totalCost}
          </span>
        )}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
