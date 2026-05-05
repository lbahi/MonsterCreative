import { useRef } from 'react';
import { useSocialAds } from './SocialAdsForm/hooks/useSocialAds';
import { Loader2, Sparkles, Upload, X, FolderOpen, Download, CheckCircle2, Zap, Tag } from 'lucide-react';
import { resolveImageInput } from '../utils/resolveImageInput';

import { SOCIAL_MODELS, SOCIAL_RATIOS, SOCIAL_RESOLUTIONS, SOCIAL_LANGUAGES, SOCIAL_TEMPLATES } from './SocialAdsForm/data/social-templates';
import type { Template, SocialAdsFormProps } from './SocialAdsForm/types';

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
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedResolution, setSelectedResolution] = useState('1K');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
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
  const generateSocialAd = async (templateOverride?: Template) => {
    if (!refImage) { alert('Please upload a product image first.'); return; }
    const activeTemplate = templateOverride ?? selectedTemplate;
    if (!activeTemplate) { alert('Please select a template design first.'); return; }

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

      // 2. Build the final prompt with poster directive + language instruction
      const langLabel = SOCIAL_LANGUAGES.find(l => l.id === selectedLanguage);
      const langDirective = selectedLanguage === 'english'
        ? 'All text in the poster must be written in English.'
        : selectedLanguage === 'arabic'
          ? 'All text in the poster must be written in Arabic (عربي). Use Arabic script for every headline, tagline, and call-to-action.'
          : 'All text in the poster must be written in French (Français). Use French for every headline, tagline, and call-to-action.';
      const posterDirective = 'This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy, bold visual impact, and eye-catching composition.';
      const ratioDirective = `Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}.`;
      const basePrompt = activeTemplate.prompt.replace('{{ASPECT_RATIO}}', selectedRatio);
      const finalPrompt = `${basePrompt} ${posterDirective} ${ratioDirective} ${langDirective}`;

      setProgressMsg(`Generating with ${model}...`);

      // 3. Call Nano Banana (same endpoint as Generate tab)
      const result = await (window as any).api.fal.nanoBananaEdit({
        model,
        prompt: finalPrompt,
        image_urls: [uploadedProduct],
        resolution: selectedResolution,
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
      const filename = `SocialAd_${activeTemplate.id}_${selectedRatio.replace(':', 'x')}_${Date.now()}.jpg`;
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

  // ── Lightbox confirm → select + generate ────────────────────────────────
  const handleLightboxGenerate = () => {
    if (previewTemplate) {
      setSelectedTemplate(previewTemplate);
      const tpl = previewTemplate;
      setPreviewTemplate(null);
      generateSocialAd(tpl);
    }
  };

  // Close lightbox on Escape key
  useEffect(() => {
    if (!previewTemplate) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewTemplate(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewTemplate]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const canGenerate = !generating && !!refImage && !!selectedTemplate;

  // Build live prompt preview helper
  const buildPromptPreview = (t: Template) => {
    const langText = selectedLanguage === 'english'
      ? 'All text in the poster must be written in English.'
      : selectedLanguage === 'arabic'
        ? 'All text in the poster must be written in Arabic (عربي).'
        : 'All text in the poster must be written in French (Français).';
    return `${t.prompt} This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy. Aspect ratio: ${selectedRatio}. Resolution: ${selectedResolution}. ${langText}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Lightbox Modal ──────────────────────────────────────────────── */}
      {previewTemplate && (
        <div
          onClick={() => setPreviewTemplate(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 40, animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewTemplate(null)}
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

          {/* Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111318', borderRadius: 16,
              width: '100%', maxWidth: 920, display: 'flex', overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
              animation: 'scaleIn 0.2s ease-out'
            }}
          >
            {/* Left: Large Template Image */}
            <div style={{
              flex: '1.2', background: '#0A0A0A', minHeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12
            }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#000' }}>
                <img
                  src={`/OutputSocialAds/${previewTemplate.id}.png`}
                  onError={(e) => { (e.target as HTMLImageElement).src = previewTemplate.coverImage; }}
                  alt={previewTemplate.label}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>

            {/* Right: Details Panel */}
            <div style={{ flex: '1', padding: '28px 28px', display: 'flex', flexDirection: 'column', color: '#FFF' }}>
              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: 11, fontWeight: 800, color: '#3B82F6',
                  margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  Social Ad Template
                </h2>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0 }}>
                  {previewTemplate.label}
                </h3>
              </div>

              {/* Category + Best For */}
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

              {/* Prompt Preview */}
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

              {/* Bottom: Meta + Generate */}
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
                  onClick={handleLightboxGenerate}
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
      )}

      {/* ── Main layout: upload + template gallery ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

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

          {/* ── Resolution ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            3 · Resolution
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RESOLUTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedResolution(r.id)}
                style={{
                  padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedResolution === r.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedResolution === r.id ? '1.5px solid #8B5CF6' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: selectedResolution === r.id ? '#8B5CF6' : 'rgba(255,255,255,0.7)' }}>
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{r.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Language ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            4 · Ad Language
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIAL_LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedLanguage(l.id)}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: selectedLanguage === l.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: selectedLanguage === l.id ? '1.5px solid #F59E0B' : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s', textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: selectedLanguage === l.id ? '#F59E0B' : 'rgba(255,255,255,0.7)', marginTop: 3 }}>
                  {l.label}
                </div>
              </button>
            ))}
          </div>

          {/* ── Model ── */}
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            5 · Model
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} color="var(--ma-accent)" />
                6 · Select Template
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0 0' }}>
                Click a style to use its prompt with your product image.
              </p>
            </div>
          </div>

          {/* Template grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10,
            overflowY: 'auto',
            maxHeight: 700,
            paddingRight: 4,
          }}>
            {SOCIAL_TEMPLATES.map(t => {
              const isSelected = selectedTemplate?.id === t.id;
              const catColors: Record<string, string> = {
                'Skincare': '#F472B6', 'Beauty': '#EC4899', 'Serums & Oils': '#DB2777',
                'Haircare': '#A855F7', 'Spa & Wellness': '#8B5CF6', 'Fragrance': '#C084FC',
                'Fashion': '#A78BFA', 'Luxury Fashion': '#7C3AED', 'Winter Fashion': '#6366F1',
                'Textiles': '#818CF8', 'Jewelry': '#F59E0B', 'Footwear': '#F97316',
                'Home & Décor': '#8B5CF6', 'Furniture': '#6D28D9',
                'Food & Beverage': '#10B981', 'Food & Condiments': '#34D399', 'Fast Food': '#F97316',
                'Beverage': '#14B8A6', 'Fitness & Supplements': '#22D3EE',
                'Outdoor & Sports': '#06B6D4', 'Suncare': '#FBBF24',
                'Tech & Gadgets': '#3B82F6', 'Tech & SaaS': '#2563EB', 'Gaming': '#EF4444',
                'E-Commerce': '#6B7280', 'Packaging': '#9CA3AF',
                'CGI & Brand': '#EF4444', 'Festive': '#F97316', 'Urban & Retail': '#64748B',
                'Launch & Bold': '#DC2626', 'Art & Print': '#D946EF', 'Design & Events': '#C026D3',
                'Universal': '#6B7280', 'General': '#6B7280', 'Baby Products': '#FDA4AF',
              };
              const catColor = catColors[t.category] ?? '#6B7280';
              return (
                <button
                  key={t.id}
                  onClick={() => setPreviewTemplate(t)}
                  style={{
                    background: 'var(--ma-elevated)',
                    border: `1px solid ${isSelected ? '#3B82F6' : 'var(--ma-border)'}`,
                    borderRadius: 12,
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isSelected ? '0 0 0 2px #3B82F6, 0 0 16px rgba(59,130,246,0.3)' : 'none',
                  }}
                >
                  {/* Thumbnail — poster-proportioned card */}
                  <div style={{ width: '100%', aspectRatio: '4 / 5', position: 'relative', background: '#000' }}>
                    <img
                      src={`/OutputSocialAds/${t.id}.png`}
                      alt={t.label}
                      onError={(e) => { (e.target as HTMLImageElement).src = t.coverImage; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Gradient overlay with label */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 50%)',
                      display: 'flex', alignItems: 'flex-end', padding: 10
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#FFF', lineHeight: 1.3 }}>
                        {t.label}
                      </span>
                    </div>

                    {/* Selected check badge */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        background: '#3B82F6', borderRadius: '50%',
                        width: 20, height: 20,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.7)',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Meta row — category + "1-Click" (mirrors AI Fashion duration/1-click row) */}
                  <div style={{
                    padding: '7px 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderTop: '1px solid var(--ma-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: catColor, display: 'inline-block', flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 9, fontWeight: 600, color: catColor, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {t.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--ma-green, #10B981)' }}>
                      <Sparkles size={9} />
                      <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase' }}>1-Click</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Prompt preview — only when template selected */}
          {selectedTemplate && (
            <div style={{
              background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
                Prompt Preview
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.55 }}>
                {selectedTemplate.prompt}
                {' '}
                <span style={{ color: '#F59E0B' }}>
                  This is a poster design that should be engaging for social media, showing some of the best features of the product with high energy.
                  {' '}Aspect ratio: {selectedRatio}. Resolution: {selectedResolution}.
                  {' '}
                  {selectedLanguage === 'english'
                    ? 'All text in the poster must be written in English.'
                    : selectedLanguage === 'arabic'
                      ? 'All text in the poster must be written in Arabic (عربي).'
                      : 'All text in the poster must be written in French (Français).'}
                </span>
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

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
