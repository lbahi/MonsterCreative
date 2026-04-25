import { useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { ChevronDown, Image, RefreshCw, Settings2, Upload, Wand2, X } from 'lucide-react';

import { NANO_BANANA_FORMATS, NANO_BANANA_MODELS, NANO_BANANA_RATIOS, NANO_BANANA_RESOLUTIONS } from '../constants';
import type { NanoBananaThinkingLevel } from '../types';

type NanoBananaLayoutProps = {
  refImage: string | null;
  setRefImage: (value: string | null) => void;
  assetImage: string | null;
  setAssetImage: (value: string | null) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  advOpen: boolean;
  setAdvOpen: (value: boolean) => void;
  ratio: string;
  setRatio: (value: string) => void;
  resolution: string;
  setResolution: (value: string) => void;
  format: string;
  setFormat: (value: string) => void;
  numOutputs: number;
  setNumOutputs: (value: number) => void;
  seed: string;
  setSeed: (value: string) => void;
  safety: number;
  setSafety: (value: number) => void;
  searchGround: boolean;
  setSearchGround: (value: boolean) => void;
  limitGen: boolean;
  setLimitGen: (value: boolean) => void;
  thinking: NanoBananaThinkingLevel;
  setThinking: (value: NanoBananaThinkingLevel) => void;
  generating: boolean;
  onGenerate: () => void;
  nbModel: string;
  setNbModel: (value: string) => void;
};

export function NanoBananaLayout({
  refImage,
  setRefImage,
  assetImages,
  setAssetImages,
  prompt,
  setPrompt,
  advOpen,
  setAdvOpen,
  ratio,
  setRatio,
  resolution,
  setResolution,
  format,
  setFormat,
  numOutputs,
  setNumOutputs,
  seed,
  setSeed,
  safety,
  setSafety,
  searchGround,
  setSearchGround,
  limitGen,
  setLimitGen,
  thinking,
  setThinking,
  generating,
  onGenerate,
  nbModel,
  setNbModel,
}: NanoBananaLayoutProps) {
  const [dragRef, setDragRef] = useState(false);
  const [dragAsset, setDragAsset] = useState(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => setter(loadEvent.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>, setter: (value: string) => void, setDragging: (value: boolean) => void) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => setter(loadEvent.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleMultipleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    const maxAllowed = 9 - assetImages.length;
    const filesToProcess = files.slice(0, maxAllowed);
    
    const newImages = await Promise.all(filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }));
    if (newImages.length > 0) setAssetImages([...assetImages, ...newImages]);
    event.target.value = ''; // reset input
  };
  
  const handleMultipleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragAsset(false);

    const files = Array.from(event.dataTransfer.files || []);
    if (files.length === 0) return;
    
    const maxAllowed = 9 - assetImages.length;
    const filesToProcess = files.slice(0, maxAllowed);
    
    const newImages = await Promise.all(filesToProcess.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }));
    if (newImages.length > 0) setAssetImages([...assetImages, ...newImages]);
  };

  const removeAssetImage = (indexToRemove: number) => {
    setAssetImages(assetImages.filter((_, i) => i !== indexToRemove));
  };

  const uploadBoxStyle = (isDragging: boolean, hasImage: boolean) => ({
    border: `2px ${hasImage ? 'solid' : 'dashed'} ${isDragging ? 'var(--ma-accent)' : hasImage ? 'var(--ma-green)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 12,
    padding: 30,
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: isDragging ? 'rgba(108,99,255,0.05)' : hasImage ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.02)',
    transition: 'all 0.2s',
    height: 160,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    overflow: 'hidden',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: 16 }}>
        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF' }}>1</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Reference Style</span>
          </div>
          <label
            style={uploadBoxStyle(dragRef, !!refImage)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragRef(true);
            }}
            onDragLeave={() => setDragRef(false)}
            onDrop={(event) => handleDrop(event, setRefImage as (value: string) => void, setDragRef)}
          >
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => handleImageUpload(event, setRefImage as (value: string) => void)} />
            {refImage ? (
              <>
                <img src={refImage} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                <button onClick={(event) => { event.preventDefault(); setRefImage(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
              </>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Upload size={16} color="rgba(255,255,255,0.5)" /></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#FFF', marginBottom: 4 }}>Clone an Image</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Recreate The same design in 1s</div>
              </>
            )}
          </label>
        </div>

        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF' }}>2</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Your Assets</span>
          </div>

          <div
            style={uploadBoxStyle(dragAsset, assetImages.length > 0)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragAsset(true);
            }}
            onDragLeave={() => setDragAsset(false)}
            onDrop={handleMultipleDrop}
          >
            {assetImages.length > 0 ? (
              <div style={{ display: 'flex', width: '100%', height: '100%', gap: 8, overflowX: 'auto', padding: '0 8px', alignItems: 'center' }}>
                {assetImages.map((asset, index) => (
                  <div key={index} style={{ width: 80, height: 100, flexShrink: 0, position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={asset} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '2px 4px', fontSize: 9, color: 'white', fontWeight: 600 }}>Fig {index + 2}</div>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeAssetImage(index); }} 
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {assetImages.length < 9 && (
                  <label style={{ width: 80, height: 100, flexShrink: 0, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }} className="hover:bg-white/5">
                    <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleMultipleImageUpload} />
                    <Upload size={18} color="rgba(255,255,255,0.4)" />
                  </label>
                )}
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', cursor: 'pointer' }}>
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleMultipleImageUpload} />
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Image size={16} color="rgba(255,255,255,0.5)" /></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#FFF', marginBottom: 4 }}>
                  Upload Assets <span style={{ fontSize: 10, color: 'var(--ma-accent-light)', background: 'rgba(108,99,255,0.15)', borderRadius: 4, padding: '1px 6px', marginLeft: 4 }}>Optional / Multi</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Faces, logos or products (up to 9)</div>
              </label>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#FFF' }}>3</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Instructions</span>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="E.g. Replace the person with my face, change the background to a volcano..."
            style={{
              flex: 1,
              width: '100%',
              resize: 'none',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--ma-border)',
              borderRadius: 12,
              color: '#FFF',
              fontSize: 12,
              padding: '14px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <div style={{ background: 'translate', display: 'flex', gap: 12, padding: '10px 0' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Model Pipeline</label>
          <select value={nbModel} onChange={(event) => setNbModel(event.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 10, color: '#FFF', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            {NANO_BANANA_MODELS.map((model) => (
              <option key={model} value={model} style={{ background: '#111124' }}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, overflow: 'hidden' }}>
        <button
          onClick={() => setAdvOpen(!advOpen)}
          style={{ width: '100%', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings2 size={16} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Advanced Controls</span>
          </div>
          <ChevronDown size={16} color="rgba(255,255,255,0.3)" style={{ transform: advOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
        </button>

        {advOpen && (
          <div style={{ padding: '20px', borderTop: '1px solid var(--ma-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Aspect Ratio</label>
                <select value={ratio} onChange={(event) => setRatio(event.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF', fontSize: 12 }}>
                  {NANO_BANANA_RATIOS.map((item) => (
                    <option key={item} value={item} style={{ background: '#111124' }}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Resolution</label>
                <select value={resolution} onChange={(event) => setResolution(event.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF', fontSize: 12 }}>
                  {NANO_BANANA_RESOLUTIONS.map((item) => (
                    <option key={item} value={item} style={{ background: '#111124' }}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Format</label>
                <select value={format} onChange={(event) => setFormat(event.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF', fontSize: 12 }}>
                  {NANO_BANANA_FORMATS.map((item) => (
                    <option key={item} value={item} style={{ background: '#111124' }}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Outputs ({numOutputs})</label>
                <input type="range" min={1} max={4} value={numOutputs} onChange={(event) => setNumOutputs(Number(event.target.value))} style={{ width: '100%', accentColor: 'var(--ma-accent)' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Safety Tolerance ({safety})</label>
                <input type="range" min={1} max={6} value={safety} onChange={(event) => setSafety(Number(event.target.value))} style={{ width: '100%', accentColor: 'var(--ma-accent)' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Seed (Optional)</label>
                <input type="text" value={seed} onChange={(event) => setSeed(event.target.value)} placeholder="Random" style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF', fontSize: 12, boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={searchGround} onChange={(event) => setSearchGround(event.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ma-accent)' }} />
                <span style={{ fontSize: 13, color: '#FFF' }}>Web Search Grounding</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={limitGen} onChange={(event) => setLimitGen(event.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--ma-accent)' }} />
                <span style={{ fontSize: 13, color: '#FFF' }}>Limit Generations</span>
              </label>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Thinking Level</label>
                <select value={thinking} onChange={(event) => setThinking(event.target.value as NanoBananaThinkingLevel)} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)', borderRadius: 8, color: '#FFF', fontSize: 12 }}>
                  <option value="minimal" style={{ background: '#111124' }}>Minimal</option>
                  <option value="high" style={{ background: '#111124' }}>High</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={generating || (!prompt) || !refImage}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: 12,
          border: 'none',
          cursor: generating || (!prompt) || !refImage ? 'not-allowed' : 'pointer',
          background: generating ? 'rgba(108,99,255,0.3)' : ((!prompt) || !refImage) ? 'rgba(255,255,255,0.1)' : 'var(--ma-accent)',
          color: generating ? '#FFF' : ((!prompt) || !refImage) ? 'rgba(255,255,255,0.3)' : '#FFF',
          fontSize: 15,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: generating || (!prompt) || !refImage ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
          marginTop: 10,
        }}
      >
        {generating ? (
          <>
            <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating Magic...
          </>
        ) : (
          <>
            <Wand2 size={18} />Magic Generation
          </>
        )}
      </button>
    </div>
  );
}
