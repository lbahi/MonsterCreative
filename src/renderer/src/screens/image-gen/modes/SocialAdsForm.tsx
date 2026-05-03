import { useState, useRef } from 'react';
import {
  Loader2, Sparkles, Upload, X, FolderOpen,
  Download, FileSpreadsheet, CheckCircle2
} from 'lucide-react';
import { resolveImageInput } from '../utils/resolveImageInput';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** All models available on the Generate tab — reused here */
export const SOCIAL_MODELS = [
  { id: 'Nano Banana',     label: 'Nano Banana',     desc: 'Fast & affordable',       endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'Nano Banana 2',   label: 'Nano Banana 2',   desc: 'Smart multi-image edit',  endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'Nano Banana Pro', label: 'Nano Banana Pro', desc: 'High-fidelity precision', endpoint: 'fal-ai/ideogram/v3/edit' },
  { id: 'GPT Image 2',     label: 'GPT Image 2',     desc: 'OpenAI quality',          endpoint: 'fal-ai/ideogram/v3/edit' },
];

/** Social media aspect ratios — value injected into the prompt */
export const SOCIAL_RATIOS = [
  { id: '1:1',  label: '1 : 1',  desc: 'Instagram Post',    icon: '▪' },
  { id: '4:5',  label: '4 : 5',  desc: 'Meta Feed',         icon: '▪' },
  { id: '9:16', label: '9 : 16', desc: 'Stories / TikTok',  icon: '▪' },
  { id: '16:9', label: '16 : 9', desc: 'YouTube / Banner',  icon: '▪' },
];

/**
 * PLACEHOLDER templates — will be replaced once the Excel file is provided.
 * Each template has a `prompt` that will be injected with the aspect ratio.
 * Use {{ASPECT_RATIO}} as the token; it will be replaced before sending to the model.
 */
export const SOCIAL_TEMPLATES = [
  {
    id: 'cyberpunk',
    label: 'Neon Cyberpunk',
    category: 'Bold',
    coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
    prompt: 'Place this exact product in a futuristic neon-lit cyberpunk scene. Electric blue and magenta glows, chrome reflections, dark atmospheric background. Aspect ratio {{ASPECT_RATIO}}. Photorealistic, high-detail, commercial product photography style.',
  },
  {
    id: 'studio',
    label: 'Minimalist Studio',
    category: 'Clean',
    coverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80',
    prompt: 'Place this exact product on a clean white marble pedestal. Minimalist studio setup, soft directional lighting, long elegant shadow. Aspect ratio {{ASPECT_RATIO}}. High-end editorial photography, ultra sharp.',
  },
  {
    id: 'nature',
    label: 'Nature Lifestyle',
    category: 'Lifestyle',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
    prompt: 'Place this exact product on a mossy rock surrounded by lush forest greenery. Dappled golden sunlight, bokeh background, lifestyle photography. Aspect ratio {{ASPECT_RATIO}}. Warm and organic feel.',
  },
  {
    id: 'luxury',
    label: 'Dark Luxury',
    category: 'Premium',
    coverImage: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&q=80',
    prompt: 'Place this exact product in a dark luxury setting with marble and gold accents. Dramatic moody lighting, deep shadows, premium brand aesthetic. Aspect ratio {{ASPECT_RATIO}}. High-fashion commercial shoot.',
  },
  {
    id: 'vintage',
    label: 'Vintage Retro',
    category: 'Retro',
    coverImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80',
    prompt: 'Place this exact product in a retro vintage setting. 35mm film grain texture, warm amber and sepia tones, old-school typography elements in background. Aspect ratio {{ASPECT_RATIO}}. Nostalgic lifestyle feel.',
  },
  {
    id: 'floating',
    label: 'Zero Gravity Float',
    category: 'Bold',
    coverImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&q=80',
    prompt: 'The product floats in a clean white void with subtle levitation motion blur and shadow beneath. Minimalist product hero shot, no distractions. Aspect ratio {{ASPECT_RATIO}}. Ultra clean, ecommerce ready.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Template = typeof SOCIAL_TEMPLATES[0];

type SocialAdsFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
  resolution: string;
  model: string;
  setModel: (val: string) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function SocialAdsForm({
  generating, setGenerating, setGeneratedImages, setGenerated,
  refImage, setRefImage, model, setModel
}: SocialAdsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [progressMsg, setProgressMsg] = useState('');
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── File handling ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setRefImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const clearImage = (e: React.MouseEvent) => { e.stopPropagation(); setRefImage(null); setSavedPath(null); };

  // ── Generation ─────────────────────────────────────────────────────────────
  const generateSocialAd = async () => {
    if (!refImage) { alert('Please upload a product image first.'); return; }
    if (!selectedTemplate) { alert('Please select a template design first.'); return; }

    setSavedPath(null);
    setSaveError(null);

    try {
      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);
      setProgressMsg('Uploading product image...');

      // 1. Upload product image to Fal CDN
      const uploadedProduct = await resolveImageInput(refImage, 'Product');
      if (!uploadedProduct) throw new Error('Product upload failed');

      // 2. Inject aspect ratio into the prompt
      const finalPrompt = selectedTemplate.prompt.replace('{{ASPECT_RATIO}}', selectedRatio);

      setProgressMsg(`Generating with ${model}...`);

      // 3. Call Nano Banana (same endpoint as Generate tab)
      const result = await (window as any).api.fal.nanoBananaEdit({
        model,
        prompt: finalPrompt,
        image_urls: [uploadedProduct],
        resolution: '1K',
        aspect_ratio: selectedRatio,
        num_images: 1,
        output_format: 'jpeg',
      });

      if (!result?.images?.length) throw new Error('No image returned from model');
      const imageUrl = result.images[0].url;

      setGeneratedImages([imageUrl]);
      setGenerated(true);

      // 4. Save to OutputSocialAds folder
      setProgressMsg('Saving to OutputSocialAds...');
      const filename = `SocialAd_${selectedTemplate.id}_${selectedRatio.replace(':', 'x')}_${Date.now()}.jpg`;
      const saveResult = await (window as any).api.social.saveAdImage({ imageUrl, filename });

      if (saveResult.success) {
        setSavedPath(saveResult.localUrl);
      } else {
        setSaveError(saveResult.error);
      }

    } catch (err: any) {
      console.error(err);
      alert(`Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  const openOutputFolder = () => (window as any).api.social.openOutputFolder();

  // ── Render ─────────────────────────────────────────────────────────────────
  const canGenerate = !generating && !!refImage && !!selectedTemplate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Top info bar ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
        borderRadius: 10, padding: '10px 16px'
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#FFF', margin: 0 }}>Social Ads Generator</h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>
            Upload product → pick template → choose ratio → generate
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
            padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600
          }}>
            <FileSpreadsheet size={12} />
            Excel templates pending
          </div>
          <button
            onClick={openOutputFolder}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', padding: '5px 10px', borderRadius: 6,
              fontSize: 10, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <FolderOpen size={12} />
            OutputSocialAds
          </button>
        </div>
      </div>

      {/* ── Main layout: upload + template gallery ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>

        {/* Left: Product Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            1 · Product Image
          </label>

          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />

          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => !refImage && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--ma-accent)' : refImage ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 10, flex: 1, minHeight: 200, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: refImage ? 'default' : 'pointer',
              background: refImage ? '#000' : 'rgba(255,255,255,0.02)',
              position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s'
            }}
          >
            {refImage ? (
              <>
                <img src={refImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Product" />
                <button onClick={clearImage} style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.65)', border: 'none', color: '#FFF',
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>
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

          {/* ── Aspect Ratio ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            2 · Aspect Ratio
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RATIOS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRatio(r.id)}
                style={{
                  padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedRatio === r.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedRatio === r.id ? '1.5px solid #3B82F6' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedRatio === r.id ? '#3B82F6' : 'rgba(255,255,255,0.7)' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Model ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            3 · Model
          </label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            style={{
              background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
              color: '#FFF', borderRadius: 8, padding: '8px 10px', fontSize: 12,
              cursor: 'pointer', width: '100%'
            }}
          >
            {SOCIAL_MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.label} — {m.desc}</option>
            ))}
          </select>
        </div>

        {/* Right: Template Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            4 · Select Template
          </label>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10, overflowY: 'auto', maxHeight: 360, paddingRight: 4
          }}>
            {SOCIAL_TEMPLATES.map(t => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    border: `1.5px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.06)'}`,
                    background: isSelected ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s', position: 'relative'
                  }}
                >
                  <div style={{ width: '100%', height: 100, background: '#111' }}>
                    <img
                      src={t.coverImage}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isSelected ? 1 : 0.65, transition: 'opacity 0.15s' }}
                      alt={t.label}
                    />
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, color: isSelected ? '#3B82F6' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t.category}
                      </span>
                    </div>
                    <h4 style={{ margin: '3px 0 0', fontSize: 12, fontWeight: 700, color: '#FFF' }}>{t.label}</h4>
                  </div>
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 6, right: 6,
                      background: '#3B82F6', borderRadius: '50%',
                      width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected template prompt preview */}
          {selectedTemplate && (
            <div style={{
              background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 8, padding: '10px 12px', marginTop: 4
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
                Prompt Preview
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                {selectedTemplate.prompt.replace('{{ASPECT_RATIO}}', selectedRatio)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Generate Button + Status ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={generateSocialAd}
          disabled={!canGenerate}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: canGenerate ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'var(--ma-elevated)',
            color: canGenerate ? '#FFF' : 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontSize: 14, fontWeight: 700,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            boxShadow: canGenerate ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {generating ? (
            <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />{progressMsg || 'Generating...'}</>
          ) : (
            <><Sparkles size={16} />Generate Social Ad {selectedTemplate ? `· ${selectedTemplate.label}` : ''} {selectedRatio}</>
          )}
        </button>

        {/* Save status */}
        {savedPath && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 8, padding: '8px 12px'
          }}>
            <CheckCircle2 size={14} color="#22C55E" />
            <span style={{ fontSize: 11, color: '#22C55E', flex: 1 }}>
              Saved to OutputSocialAds folder
            </span>
            <button
              onClick={openOutputFolder}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#22C55E',
                fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <FolderOpen size={11} /> Open
            </button>
            <button
              onClick={() => window.open(savedPath, '_blank')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', color: '#22C55E',
                fontSize: 10, fontWeight: 700, cursor: 'pointer'
              }}
            >
              <Download size={11} /> View
            </button>
          </div>
        )}

        {saveError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#EF4444'
          }}>
            ⚠️ Generated but save failed: {saveError}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
