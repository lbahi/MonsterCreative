import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Sparkles, Settings2, Video, Wand2, Upload, CustomIconProvider, Image as ImageIcon, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { falService } from '../../services/fal.service';
import { TemplateGallery } from './modes/TemplateGallery';
import { ManualVideoForm } from './modes/ManualVideoForm';
import { VideoRightPanel } from './panels/VideoRightPanel';
import { VIDEO_MODELS, VIDEO_DURATIONS, VIDEO_ASPECT_RATIOS } from './constants';
import type { VideoTemplate, ActiveVideoGenMode } from './types';
import { resolveImageInput } from '../image-gen/utils/resolveImageInput';

export function VideoGenScreen() {
  const { setRightPanelContent } = useApp();
  const location = useLocation();
  const state = location.state as { sourceImage?: string } | null;

  const [activeMode, setActiveMode] = useState<ActiveVideoGenMode>('templates');
  
  // Universal inputs
  const [sourceImage, setSourceImage] = useState<string | null>(state?.sourceImage || null);
  const [endImage, setEndImage] = useState<string | null>(null);
  
  // Generating state
  const [generating, setGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Manual mode state
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('kling-3');
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [audio, setAudio] = useState(false);

  // Cost calculator based on official Fal API Docs
  const selectedModelInfo = VIDEO_MODELS.find(m => m.id === model);
  const estimatedCost = useMemo(() => {
    if (!selectedModelInfo) return 0;
    
    if (model === 'kling-3') {
      return audio ? (0.168 * duration) : (0.112 * duration);
    } 
    else if (model === 'kling-2.5-turbo') {
      return 0.07 * duration;
    } 
    else if (model === 'seedance-2') {
      // Audio costs the same as without audio for Seedance
      return 0.3024 * duration;
    }
    else if (model === 'veo-3.1') {
      // Assuming 720p/1080p tier
      return audio ? (0.40 * duration) : (0.20 * duration);
    }
    
    // Fallback legacy calculation if model not explicitly defined above
    const audioMultiplier = audio ? 1.5 : 1.0; 
    return selectedModelInfo.pricePerSec * duration * audioMultiplier;
  }, [model, duration, audio, selectedModelInfo]);

  const executeGeneration = async (
    targetModel: string, 
    targetPrompt: string, 
    targetDur: number, 
    targetAspect: string
  ) => {
    if (!sourceImage) {
      alert("Please upload a source image first.");
      return;
    }

    try {
      setGenerating(true);
      setGeneratedVideoUrl(null);
      // Set right panel explicitly via context
      setRightPanelContent(
        <VideoRightPanel 
          generating={true} 
          generatedVideoUrl={null} 
          model={targetModel} 
          duration={targetDur} 
          aspectRatio={targetAspect}
          audio={audio}
          estimatedCost={estimatedCost}
        />
      );

      const uploadedStart = await resolveImageInput(sourceImage, 'Video Source');
      if (!uploadedStart) throw new Error("Failed to upload source image");
      
      const uploadedEnd = endImage ? await resolveImageInput(endImage, 'Video End Frame') : undefined;

      const modelDef = VIDEO_MODELS.find(m => m.id === targetModel);
      if (!modelDef) throw new Error("Invalid model");

      console.log('--- EXECUTING VIDEO GEN ---', {
        endpoint: modelDef.endpoint,
        image_url: uploadedStart,
        end_image_url: uploadedEnd,
        prompt: targetPrompt,
        duration: targetDur.toString(),
        aspect_ratio: targetAspect,
      });

      // Mock completion
      setTimeout(() => {
        const url = 'https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4';
        setGeneratedVideoUrl(url);
        setGenerating(false);
        setRightPanelContent(
          <VideoRightPanel 
            generating={false} 
            generatedVideoUrl={url} 
            model={targetModel} 
            duration={targetDur} 
            aspectRatio={targetAspect}
            audio={audio}
            estimatedCost={estimatedCost}
          />
        );
      }, 3000);

    } catch (err: any) {
      console.error(err);
      alert(`Generation failed: ${err.message}`);
      setGenerating(false);
      setRightPanelContent(null);
    }
  };

  useEffect(() => {
    if (!generating && !generatedVideoUrl) {
      setRightPanelContent(
        <VideoRightPanel 
          generating={false} 
          generatedVideoUrl={null} 
          model={model} 
          duration={duration} 
          aspectRatio={aspectRatio}
          audio={audio}
          estimatedCost={estimatedCost}
        />
      );
    }
  }, [generating, generatedVideoUrl, model, duration, aspectRatio, audio, estimatedCost, setRightPanelContent]);

  const handleTemplateSelect = (template: VideoTemplate, config: { model: string, duration: number, aspectRatio: string }) => {
    if (!sourceImage) {
      alert("Please select a source image before running a template.");
      return;
    }
    // Update local state to match template configs
    setModel(config.model);
    setDuration(config.duration);
    setAspectRatio(config.aspectRatio);
    setPrompt(template.prompt);

    // Auto execute!
    executeGeneration(config.model, template.prompt, config.duration, config.aspectRatio);
  };

  const handleManualGenerate = () => {
    executeGeneration(model, prompt, duration, aspectRatio);
  };

  // Upload Box
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = ev => setter(ev.target?.result as string);
      r.readAsDataURL(file);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 24, background: 'var(--ma-bg)', overflowY: 'auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={20} color="#EC4899" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#FFF', margin: 0, letterSpacing: '-0.5px' }}>AI Fashion Video</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0 0' }}>Animate your garments into cinematic runway and lifestyle videos</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 4, border: '1px solid var(--ma-border)' }}>
          <button 
            onClick={() => setActiveMode('templates')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 16, border: 'none', background: activeMode === 'templates' ? 'var(--ma-accent)' : 'transparent', color: activeMode === 'templates' ? '#FFF' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Sparkles size={14} /> Templates
          </button>
          <button 
            onClick={() => setActiveMode('manual')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 16, border: 'none', background: activeMode === 'manual' ? 'var(--ma-accent)' : 'transparent', color: activeMode === 'manual' ? '#FFF' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Settings2 size={14} /> Manual
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
        
        {/* Left Column: Image Upload (Shared) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Source Image</span>
            </div>
            
            <label style={{ 
              border: `2px ${sourceImage ? 'solid' : 'dashed'} ${sourceImage ? 'var(--ma-green)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: 30, textAlign: 'center', cursor: 'pointer', background: sourceImage ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.02)', height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
            }} className="hover:bg-white/5">
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, setSourceImage)} disabled={generating} />
              {sourceImage ? (
                <>
                  <img src={sourceImage} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: 0, left: 0 }} />
                  <button onClick={(e) => { e.preventDefault(); setSourceImage(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                </>
              ) : (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Upload size={20} color="rgba(255,255,255,0.5)" /></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', marginBottom: 4 }}>Upload Source Image</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Drag and drop or browse</div>
                </>
              )}
            </label>
          </div>

          {activeMode === 'manual' && model === 'seedance-2' && (
            <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>End Frame <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>Optional</span></span>
              </div>
              <label style={{ 
                border: `2px ${endImage ? 'solid' : 'dashed'} ${endImage ? 'var(--ma-accent)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: 30, textAlign: 'center', cursor: 'pointer', background: endImage ? 'rgba(108,99,255,0.03)' : 'rgba(255,255,255,0.02)', height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
              }} className="hover:bg-white/5">
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, setEndImage)} disabled={generating} />
                {endImage ? (
                  <>
                    <img src={endImage} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                    <button onClick={(e) => { e.preventDefault(); setEndImage(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} color="rgba(255,255,255,0.5)" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Upload end frame for Seedance transition</div>
                  </>
                )}
              </label>
            </div>
          )}

          {/* Global Generation Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
            {/* Engine Selection */}
            <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <Settings2 size={16} color="rgba(255,255,255,0.6)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Engine</span>
              </div>
              <select 
                value={model} 
                onChange={e => setModel(e.target.value)}
                disabled={generating}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)', borderRadius: 8, padding: '10px 12px', color: '#FFF', outline: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
              >
                {VIDEO_MODELS.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#111' }}>
                    {m.label} {m.badge ? `(${m.badge})` : ''}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {selectedModelInfo?.desc}
              </div>
            </div>

            {/* Specs */}
            <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Video Specs</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</label>
                  <select value={duration} onChange={e => setDuration(Number(e.target.value))} disabled={generating} style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)', borderRadius: 8, padding: '8px 10px', color: '#FFF', fontSize: 12, outline: 'none' }}>
                    {VIDEO_DURATIONS.map(d => (
                      <option key={d} value={d} disabled={selectedModelInfo && d > selectedModelInfo.maxDur} style={{ background: '#111' }}>
                        {d}s {selectedModelInfo && d > selectedModelInfo.maxDur ? '(Too long)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ratio</label>
                  <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} disabled={generating} style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)', borderRadius: 8, padding: '8px 10px', color: '#FFF', fontSize: 12, outline: 'none' }}>
                    {VIDEO_ASPECT_RATIOS.map(r => (
                      <option key={r} value={r} style={{ background: '#111' }}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Generate Audio</span>
                <button 
                  onClick={() => !generating && selectedModelInfo?.supportsAudio && setAudio(!audio)}
                  disabled={generating || !selectedModelInfo?.supportsAudio}
                  style={{
                    width: 36, height: 20, borderRadius: 10, background: audio ? 'var(--ma-green)' : 'rgba(255,255,255,0.1)',
                    border: 'none', position: 'relative', cursor: (generating || !selectedModelInfo?.supportsAudio) ? 'not-allowed' : 'pointer',
                    opacity: (!selectedModelInfo?.supportsAudio) ? 0.3 : 1, transition: 'background 0.2s'
                  }}
                >
                  <span style={{ position: 'absolute', top: 2, left: audio ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#FFF', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Settings or Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeMode === 'templates' ? (
            <TemplateGallery onSelectTemplate={handleTemplateSelect} disabled={generating || !sourceImage} />
          ) : (
            <>
              <ManualVideoForm 
                prompt={prompt} setPrompt={setPrompt}
                disabled={generating}
              />
              
              <button
                onClick={handleManualGenerate}
                disabled={generating || !sourceImage}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                  background: (generating || !sourceImage) ? 'var(--ma-bg)' : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
                  color: (generating || !sourceImage) ? 'rgba(255,255,255,0.3)' : '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontSize: 15, fontWeight: 700, cursor: (generating || !sourceImage) ? 'not-allowed' : 'pointer',
                  boxShadow: (generating || !sourceImage) ? 'none' : '0 4px 20px rgba(108, 99, 255, 0.4)',
                  transition: 'all 0.2s', marginTop: 'auto'
                }}
              >
                <Wand2 size={18} />
                {generating ? 'Generating...' : `Generate Video • ~$${estimatedCost.toFixed(2)}`}
              </button>
            </>
          )}
        </div>

      </div>
    
    </div>
  );
}
