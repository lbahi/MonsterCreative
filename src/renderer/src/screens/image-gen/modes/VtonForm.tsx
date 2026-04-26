import { useState, useRef } from 'react';
import { Loader2, Sparkles, Upload, X } from 'lucide-react';
import { falService } from '../../../services/fal.service';
import { anthropicService } from '../../../services/anthropic.service';
import { VIBES, NANO_BANANA_MODELS } from '../constants';
import { resolveImageInput } from '../utils/resolveImageInput';

type VtonFormProps = {
  generating: boolean;
  setGenerating: (val: boolean) => void;
  setGeneratedImages: (images: string[]) => void;
  setGenerated: (val: boolean) => void;
  model: string;
  setModel: (val: string) => void;
  numImages: number;
  setNumImages: (val: number) => void;
  resolution: string;
  setResolution: (val: string) => void;
  refImage: string | null;
  setRefImage: (val: string | null) => void;
};

export function VtonForm({ 
  generating, setGenerating, setGeneratedImages, setGenerated,
  model, setModel, numImages, setNumImages, resolution, setResolution,
  refImage: garmentImage, setRefImage: setGarmentImage
}: VtonFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [vibe, setVibe] = useState('Studio');
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
      setGarmentImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearGarment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGarmentImage(null);
  };

  const generateVton = async () => {
    if (!garmentImage) {
      alert('Please upload a garment image first.');
      return;
    }

    try {
      setGenerating(true);
      setGenerated(false);
      setGeneratedImages([]);
      setProgressMsg('Uploading garment...');

      // 1. Upload Garment
      const uploadedGarment = await resolveImageInput(garmentImage, 'Garment');
      if (!uploadedGarment) throw new Error('Garment upload failed');

      // 2. AI Casting Director
      setProgressMsg('AI Casting Director analyzing...');
      const vibeDesc = VIBES.find((v) => v.id === vibe)?.desc || 'Studio';
      const ideation = await anthropicService.generateVirtualTryOnIdeas(uploadedGarment, vibeDesc, numImages);

      let genImages: string[] = [];
      setProgressMsg('Generating final campaign images...');

      // 3. Generate Scenes via Nano Banana
      for (const scene of ideation.sceneVariations) {
        const prompt = `${ideation.modelPrompt} in a ${scene}`;
        
        const result = await falService.nanoBananaEdit({
          model: model,
          prompt: prompt,
          image_urls: [uploadedGarment],
          resolution: resolution,
          aspect_ratio: '4:5',
          num_images: 1,
          output_format: 'jpeg',
        });

        if (result.images && result.images.length > 0) {
          genImages.push(result.images[0].url);
        }
      }

      setGeneratedImages(genImages);
      setGenerated(true);
    } catch (err: any) {
      console.error(err);
      alert(`VTON Error: ${err.message}`);
    } finally {
      setGenerating(false);
      setProgressMsg('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 20 }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 2fr', gap: 24, marginBottom: 24 }}>
          {/* Left Column: Garment Upload */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              1. Upload Garment
            </label>
            
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !garmentImage && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? 'var(--ma-accent)' : garmentImage ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 10,
                flex: 1,
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: garmentImage ? 'default' : 'pointer',
                background: garmentImage ? '#000' : dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {garmentImage ? (
                <>
                  <img src={garmentImage} alt="Garment" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <button
                    onClick={clearGarment}
                    style={{
                      position: 'absolute', top: 10, right: 10, width: 32, height: 32, 
                      borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', 
                      border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={24} color={dragging ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)'} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center', padding: '0 12px' }}>Drop garment image or click</p>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Vibe Selection & Settings */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              2. Select Casting Vibe
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
              {VIBES.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setVibe(item.id)}
                  style={{
                    position: 'relative',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    aspectRatio: '1/1',
                    border: `2px solid ${vibe === item.id ? 'var(--ma-accent)' : 'transparent'}`,
                  }}
                >
                  <img src={item.image} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: vibe === item.id ? 1 : 0.6 }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    padding: '28px 4px 6px', fontSize: 9.5, fontWeight: 700, color: '#FFF', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 'auto' }}>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  {NANO_BANANA_MODELS.map((m) => <option key={m} value={m} style={{ background: '#11111A' }}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Variants</label>
                <select
                  value={numImages}
                  onChange={(e) => setNumImages(Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  {[1, 2, 3, 4].map((n) => <option key={n} value={n} style={{ background: '#11111A' }}>{n} Images</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}
                >
                  {['0.5K', '1K', '2K', '4K'].map((n) => <option key={n} value={n} style={{ background: '#11111A' }}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={generateVton}
        disabled={generating}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: generating ? 'rgba(108,99,255,0.3)' : 'var(--ma-accent)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          cursor: generating ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: generating ? 'none' : '0 0 28px rgba(108,99,255,0.4)',
          transition: 'all 0.2s',
          fontFamily: 'var(--font-body)',
        }}
      >
        {generating ? (
          <>
            <Loader2 className="spinner" size={20} />
            {progressMsg}
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Cast & Fit ({numImages} Images)
          </>
        )}
      </button>

    </div>
  );
}
