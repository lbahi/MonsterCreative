import { Upload, X, ImageIcon, Settings2 } from 'lucide-react';
import { VIDEO_MODELS, VIDEO_DURATIONS, VIDEO_ASPECT_RATIOS, VIDEO_RESOLUTIONS } from '../constants';
import { useVideoGen } from '../hooks/useVideoGen';

interface VideoGenLeftPanelProps extends ReturnType<typeof useVideoGen> {}

export function VideoGenLeftPanel(props: VideoGenLeftPanelProps) {
  const {
    sourceImage, setSourceImage,
    endImage, setEndImage,
    generating,
    modelId, setModelId,
    duration, setDuration,
    aspectRatio, setAspectRatio,
    resolution, setResolution,
    audio, setAudio,
    selectedModelInfo,
    activeMode,
    handleImageUpload
  } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Source Image</span>
        </div>
        
        <label style={{ 
          border: `2px ${sourceImage ? 'solid' : 'dashed'} ${sourceImage ? 'var(--ma-green)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: 30, textAlign: 'center', cursor: 'pointer', background: sourceImage ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.02)', height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
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

      {activeMode === 'manual' && modelId === 'fal-ai/kling-video/v2.6/pro/image-to-video' && (
        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>End Frame <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>Optional</span></span>
          </div>
          <label style={{ 
            border: `2px ${endImage ? 'solid' : 'dashed'} ${endImage ? 'var(--ma-accent)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: 30, textAlign: 'center', cursor: 'pointer', background: endImage ? 'rgba(108,99,255,0.03)' : 'rgba(255,255,255,0.02)', height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, setEndImage)} disabled={generating} />
            {endImage ? (
              <>
                <img src={endImage} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                <button onClick={(e) => { e.preventDefault(); setEndImage(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#FFF', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
              </>
            ) : (
              <>
                <ImageIcon size={20} color="rgba(255,255,255,0.5)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Upload end frame (optional)</div>
              </>
            )}
          </label>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <Settings2 size={16} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Engine</span>
          </div>
          <select 
            value={modelId} 
            onChange={e => setModelId(e.target.value)}
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

        <div style={{ background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FFF' }}>Video Specs</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} disabled={generating} style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)', borderRadius: 8, padding: '8px 10px', color: '#FFF', fontSize: 12, outline: 'none' }}>
                {VIDEO_DURATIONS.map(d => (
                  <option key={d} value={d} disabled={!selectedModelInfo.supportedDurations.includes(d)} style={{ background: '#111' }}>
                    {d}s {!selectedModelInfo.supportedDurations.includes(d) ? '(Unsupported)' : ''}
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
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolution</label>
              <select value={resolution} onChange={e => setResolution(e.target.value)} disabled={generating} style={{ width: '100%', marginTop: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)', borderRadius: 8, padding: '8px 10px', color: '#FFF', fontSize: 12, outline: 'none' }}>
                {VIDEO_RESOLUTIONS.map(res => (
                  <option key={res} value={res} style={{ background: '#111' }}>{res}</option>
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
  );
}
