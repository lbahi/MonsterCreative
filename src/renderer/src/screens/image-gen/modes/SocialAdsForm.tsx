import { useState, useRef } from 'react';
import { Loader2, Sparkles, Upload, X, FileSpreadsheet } from 'lucide-react';
import { falService } from '../../../services/fal.service';
import { resolveImageInput } from '../utils/resolveImageInput';

// TODO: The prompts database will be provided as an excel file in the Social-Ads folder
// For now, we use a placeholder template array
const PLACEHOLDER_TEMPLATES = [
  { id: 't1', label: 'Neon Cyberpunk', prompt: 'A futuristic luxury product floating in a void, neon accents, high resolution, cyberpunk aesthetic.', coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80' },
  { id: 't2', label: 'Minimalist Studio', prompt: 'The product placed on a clean white marble pedestal. Minimalist studio lighting, soft shadows, high-end editorial.', coverImage: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=400&q=80' },
  { id: 't3', label: 'Nature Lifestyle', prompt: 'The product resting on a mossy rock in a lush forest, dappled sunlight, hyperrealistic nature photography.', coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80' },
];

type SocialAdsFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
  resolution: string;
  model: string;
};

export function SocialAdsForm({ 
  generating, setGenerating, setGeneratedImages, setGenerated,
  refImage, setRefImage, resolution, model
}: SocialAdsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PLACEHOLDER_TEMPLATES[0] | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setRefImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefImage(null);
  };

  const generateSocialAd = async () => {
    if (!refImage) {
      alert('Please upload a product image first.');
      return;
    }
    if (!selectedTemplate) {
      alert('Please select a template design first.');
      return;
    }

    try {
      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);
      setProgressMsg('Uploading product image...');

      // 1. Upload
      const uploadedProduct = await resolveImageInput(refImage, 'Product');
      if (!uploadedProduct) throw new Error('Product upload failed');

      setProgressMsg('Generating social ad design...');

      // 2. Generate via Nano Banana or Kontext
      const result = await falService.nanoBananaEdit({
        model: model,
        prompt: selectedTemplate.prompt,
        image_urls: [uploadedProduct],
        resolution: resolution,
        aspect_ratio: '1:1',
        num_images: 1,
        output_format: 'jpeg',
      });

      if (result.images && result.images.length > 0) {
        setGeneratedImages([result.images[0].url]);
      }
      
      setGenerated(true);
    } catch (err: any) {
      console.error(err);
      alert(`Generation Error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
        
        {/* Instruction Header */}
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: 0 }}>Social Ads Generator</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>Upload your product and select a high-converting template to generate instant social media creatives.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
            <FileSpreadsheet size={14} />
            Waiting for Excel Templates
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 2fr', gap: 24, marginBottom: 24 }}>
          {/* Left Column: Garment Upload */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              1. Upload Product
            </label>
            
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !refImage && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--ma-accent)' : refImage ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 10,
                flex: 1,
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: refImage ? 'default' : 'pointer',
                background: refImage ? '#000' : 'rgba(255,255,255,0.02)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              {refImage ? (
                <>
                  <img src={refImage} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Product" />
                  <button 
                    onClick={clearImage}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
                  <span style={{ fontSize: 13, color: '#FFF', fontWeight: 600 }}>Drop product image</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>or click to browse</span>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Template Selection */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              2. Select Template Design
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, flex: 1, alignContent: 'start', overflowY: 'auto', paddingRight: 4 }}>
              {PLACEHOLDER_TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{ 
                    border: `2px solid ${selectedTemplate?.id === template.id ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '100%', height: 120, background: '#000' }}>
                    <img src={template.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: selectedTemplate?.id === template.id ? 1 : 0.7 }} alt={template.label} />
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#FFF' }}>{template.label}</h4>
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {template.prompt}
                    </p>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: '#3B82F6', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <button
            onClick={generateSocialAd}
            disabled={generating || !refImage || !selectedTemplate}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, border: 'none',
              background: (generating || !refImage || !selectedTemplate) ? 'var(--ma-bg)' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: (generating || !refImage || !selectedTemplate) ? 'rgba(255,255,255,0.3)' : '#FFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 15, fontWeight: 700, cursor: (generating || !refImage || !selectedTemplate) ? 'not-allowed' : 'pointer',
              boxShadow: (generating || !refImage || !selectedTemplate) ? 'none' : '0 4px 20px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {progressMsg || 'Generating Social Ad...'}
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Design ({selectedTemplate ? selectedTemplate.label : 'Select Template'})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
