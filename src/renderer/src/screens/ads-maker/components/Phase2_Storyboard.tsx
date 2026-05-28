import React, { useState, useRef, useEffect } from 'react';
import { Wand2, RotateCcw, Loader2, Copy, Download, FileText, FlaskConical, Zap, Sparkles, Upload } from 'lucide-react';
import { VibeCard } from './VibeCard';
import type { AdProject } from '../hooks/useAdsMaker';

interface Phase2Props {
  project: AdProject;
  isGenerating: boolean;
  loadingMessage: string;
  storyboardQuality: 'low' | 'medium' | 'high';
  onGenerate: (params: {
    productName: string;
    brandName: string;
    platform: string;
    aspectRatio: string;
    duration: number;
    vibe: string;
    creativeDirection: string;
  }) => void;
  onApprove: () => void;
  onOpenAudioLab: () => void;
  onUpdateProject: (updates: Partial<AdProject>) => void;
  onStoryboardQualityChange: (quality: 'low' | 'medium' | 'high') => void;
}

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', aspect: '9:16', icon: '📱' },
  { id: 'tiktok', label: 'TikTok', aspect: '9:16', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', aspect: '16:9', icon: '▶️' },
  { id: 'tv', label: 'TV', aspect: '16:9', icon: '📺' }
];

const VIBES = [
  { id: 'hyper_motion', icon: '⚡', title: 'Hyper Motion', description: 'Fast cuts. Product hero.' },
  { id: 'tv_spot', icon: '🎬', title: 'TV Spot', description: 'Emotional storytelling.' },
  { id: 'wild_card', icon: '🃏', title: 'Wild Card', description: 'Unexpected creative.' }
];

const DURATIONS = [4, 5, 6, 8, 10, 12, 15];

export function Phase2_Storyboard({
  project,
  isGenerating,
  loadingMessage,
  storyboardQuality,
  onGenerate,
  onApprove,
  onOpenAudioLab,
  onUpdateProject,
  onStoryboardQualityChange
}: Phase2Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'storyboard' | 'prompt' | 'voiceover' | 'music'>('storyboard');
  const [editedPrompt, setEditedPrompt] = useState(project.outputs.seedance_video_prompt || '');
  const [editedVoiceover, setEditedVoiceover] = useState(project.outputs.voiceover_script || '');
  const [editedMusic, setEditedMusic] = useState(project.outputs.music_prompt || '');
  const [overrideAspect, setOverrideAspect] = useState(false);
  const storyboardUploadRef = useRef<HTMLInputElement>(null);

  const { metadata, outputs } = project;

  useEffect(() => {
    setEditedPrompt(project.outputs.seedance_video_prompt || '');
    setEditedVoiceover(project.outputs.voiceover_script || '');
    setEditedMusic(project.outputs.music_prompt || '');
  }, [project.outputs.seedance_video_prompt, project.outputs.voiceover_script, project.outputs.music_prompt]);

  const handleStoryboardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProject({ outputs: { ...outputs, storyboard_image_url: reader.result as string } });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasStoryboard = !!outputs.storyboard_image_url;

  const handlePlatformChange = (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (platform && !overrideAspect) {
      onUpdateProject({
        metadata: { ...metadata, platform: platformId, aspect_ratio: platform.aspect }
      });
    } else {
      onUpdateProject({ metadata: { ...metadata, platform: platformId } });
    }
  };

  const handleGenerate = () => {
    onGenerate({
      productName: metadata.product_name || '',
      brandName: metadata.brand_name || '',
      platform: metadata.platform || 'instagram',
      aspectRatio: metadata.aspect_ratio || '9:16',
      duration: metadata.duration || 10,
      vibe: metadata.vibe || 'hyper_motion',
      creativeDirection: metadata.creative_direction || ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', minHeight: '500px' }}>
      {/* Left Panel - Settings */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto'
        }}
      >
        {/* Section Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '1px', background: 'var(--ma-accent)' }} />
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              color: 'var(--ma-accent)',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Ad Settings
          </span>
        </div>

        {/* Product Name */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '6px', display: 'block' }}>
            PRODUCT NAME
          </label>
          <input
            type="text"
            value={metadata.product_name || ''}
            onChange={(e) => onUpdateProject({ metadata: { ...metadata, product_name: e.target.value } })}
            placeholder="e.g. Rose Gold Serum"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--ma-bg)',
              border: '1px solid var(--ma-border)',
              borderRadius: '8px',
              color: 'var(--ma-text)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Brand Name */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '6px', display: 'block' }}>
            BRAND NAME
          </label>
          <input
            type="text"
            value={metadata.brand_name || ''}
            onChange={(e) => onUpdateProject({ metadata: { ...metadata, brand_name: e.target.value } })}
            placeholder="e.g. Lumière Paris"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--ma-bg)',
              border: '1px solid var(--ma-border)',
              borderRadius: '8px',
              color: 'var(--ma-text)',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Platform */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px', display: 'block' }}>
            PLATFORM
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePlatformChange(p.id)}
                style={{
                  padding: '10px',
                  background: metadata.platform === p.id ? 'rgba(108, 99, 255, 0.15)' : 'var(--ma-bg)',
                  border: `1px solid ${metadata.platform === p.id ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                  borderRadius: '8px',
                  color: metadata.platform === p.id ? 'var(--ma-text)' : 'rgba(255,255,255,0.6)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--ma-text-muted)' }}>
              Aspect: <strong>{metadata.aspect_ratio}</strong>
            </span>
            <label style={{ fontSize: '10px', color: 'var(--ma-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={overrideAspect}
                onChange={(e) => setOverrideAspect(e.target.checked)}
              />
              Override
            </label>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px', display: 'block' }}>
            DURATION
          </label>
          <input
            type="range"
            min="4"
            max="15"
            value={metadata.duration}
            onChange={(e) => onUpdateProject({ metadata: { ...metadata, duration: parseInt(e.target.value) } })}
            style={{ width: '100%', marginBottom: '8px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--ma-text-muted)' }}>
            {DURATIONS.filter(d => d % 2 === 0).map(d => (
              <span key={d}>{d}s</span>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--ma-accent)', fontWeight: 700, marginTop: '8px' }}>
            {metadata.duration} seconds
          </p>
        </div>

        {/* Vibe */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px', display: 'block' }}>
            AD VIBE
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {VIBES.map(vibe => (
              <VibeCard
                key={vibe.id}
                id={vibe.id}
                icon={<span style={{ fontSize: '24px' }}>{vibe.icon}</span>}
                title={vibe.title}
                description={vibe.description}
                isActive={metadata.vibe === vibe.id}
                onClick={() => onUpdateProject({ metadata: { ...metadata, vibe: vibe.id } })}
              />
            ))}
          </div>
        </div>

        {/* Creative Direction */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>CREATIVE DIRECTION</span>
            <span style={{ color: 'var(--ma-text-muted)', fontWeight: 400 }}>OPTIONAL</span>
          </label>
          <textarea
            value={metadata.creative_direction || ''}
            onChange={(e) => onUpdateProject({ metadata: { ...metadata, creative_direction: e.target.value } })}
            placeholder="e.g. Include a spray shot. Show the product on marble."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--ma-bg)',
              border: '1px solid var(--ma-border)',
              borderRadius: '8px',
              color: 'var(--ma-text)',
              fontSize: '13px',
              resize: 'none'
            }}
          />
        </div>

        {/* Storyboard Quality */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>STORYBOARD QUALITY</span>
            <span style={{ fontSize: '10px', color: 'var(--ma-accent)', fontWeight: 600 }}>
              {storyboardQuality === 'low' ? '~$0.02' : storyboardQuality === 'medium' ? '~$0.05' : '~$0.10'}
            </span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onStoryboardQualityChange('low')}
              style={{
                flex: 1,
                padding: '12px',
                background: storyboardQuality === 'low' ? 'rgba(108, 99, 255, 0.1)' : 'var(--ma-elevated)',
                border: `1px solid ${storyboardQuality === 'low' ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <FlaskConical size={18} color={storyboardQuality === 'low' ? 'var(--ma-accent)' : 'rgba(255,255,255,0.5)'} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ma-text)' }}>Draft</span>
              <span style={{ fontSize: '9px', color: 'var(--ma-text-muted)' }}>Fastest · Lowest cost</span>
            </button>
            <button
              onClick={() => onStoryboardQualityChange('medium')}
              style={{
                flex: 1,
                padding: '12px',
                background: storyboardQuality === 'medium' ? 'rgba(108, 99, 255, 0.1)' : 'var(--ma-elevated)',
                border: `1px solid ${storyboardQuality === 'medium' ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Zap size={18} color={storyboardQuality === 'medium' ? 'var(--ma-accent)' : 'rgba(255,255,255,0.5)'} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ma-text)' }}>Standard</span>
              <span style={{ fontSize: '9px', color: 'var(--ma-text-muted)' }}>Balanced quality</span>
            </button>
            <button
              onClick={() => onStoryboardQualityChange('high')}
              style={{
                flex: 1,
                padding: '12px',
                background: storyboardQuality === 'high' ? 'rgba(108, 99, 255, 0.1)' : 'var(--ma-elevated)',
                border: `1px solid ${storyboardQuality === 'high' ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={18} color={storyboardQuality === 'high' ? 'var(--ma-accent)' : 'rgba(255,255,255,0.5)'} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ma-text)' }}>High</span>
              <span style={{ fontSize: '9px', color: 'var(--ma-text-muted)' }}>Best detail</span>
            </button>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || hasStoryboard}
          style={{
            width: '100%',
            padding: '14px',
            background: !hasStoryboard ? 'var(--ma-accent)' : 'var(--ma-surface)',
            border: 'none',
            borderRadius: '10px',
            color: !hasStoryboard ? '#FFF' : 'rgba(255,255,255,0.3)',
            fontWeight: 600,
            fontFamily: 'Outfit',
            cursor: !hasStoryboard ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: 'auto',
            boxShadow: !hasStoryboard ? '0 0 24px rgba(108, 99, 255, 0.3)' : 'none'
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Storyboard →
            </>
          )}
        </button>
      </div>

      {/* Right Panel - Outputs */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '500px'
        }}
      >
        {isGenerating ? (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <Loader2 size={48} color="var(--ma-accent)" className="animate-spin" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px' }}>
              Generating Storyboard
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ma-text-muted)' }}>
              {loadingMessage}
            </p>
          </div>
        ) : hasStoryboard ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--ma-border)', paddingBottom: '12px' }}>
              {[
                { id: 'storyboard', label: 'Storyboard' },
                { id: 'prompt', label: 'Video Prompt' },
                { id: 'voiceover', label: 'Voiceover' },
                { id: 'music', label: 'Music' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    padding: '8px 16px',
                    background: activeTab === tab.id ? 'var(--ma-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: '20px',
                    color: activeTab === tab.id ? '#FFF' : 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {activeTab === 'storyboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  <img
                    src={outputs.storyboard_image_url!}
                    alt="Storyboard"
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      display: 'block',
                      maxHeight: 'calc(100vh - 360px)',
                      objectFit: 'contain'
                    }}
                  />
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = outputs.storyboard_image_url!;
                      a.download = 'storyboard.jpg';
                      a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 14px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              )}

              {activeTab === 'prompt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)' }}>
                    Edit this prompt to refine the video output
                  </p>
                  <textarea
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    rows={15}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      lineHeight: 1.6,
                      resize: 'vertical'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(editedPrompt)}
                    style={{
                      padding: '10px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Copy size={14} /> Copy Prompt
                  </button>
                </div>
              )}

              {activeTab === 'voiceover' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)' }}>
                    Edit this script before sending to Audio Lab
                  </p>
                  <textarea
                    value={editedVoiceover}
                    onChange={(e) => {
                      setEditedVoiceover(e.target.value);
                      onUpdateProject({ outputs: { ...outputs, voiceover_script: e.target.value } });
                    }}
                    rows={12}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      resize: 'vertical',
                      fontStyle: 'italic'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => copyToClipboard(editedVoiceover)}
                      style={{
                        padding: '10px 16px',
                        background: 'var(--ma-bg)',
                        border: '1px solid var(--ma-border)',
                        borderRadius: '8px',
                        color: 'var(--ma-text)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Copy size={14} /> Copy Script
                    </button>
                    <button
                      onClick={onOpenAudioLab}
                      style={{
                        padding: '10px 16px',
                        background: 'var(--ma-accent)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      Open Audio Lab →
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'music' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)' }}>
                    Edit this prompt before sending to music generation
                  </p>
                  <textarea
                    value={editedMusic}
                    onChange={(e) => {
                      setEditedMusic(e.target.value);
                      onUpdateProject({ outputs: { ...outputs, music_prompt: e.target.value } });
                    }}
                    rows={12}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono',
                      lineHeight: 1.6,
                      resize: 'vertical',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                  <button
                    onClick={() => copyToClipboard(editedMusic)}
                    style={{
                      padding: '10px 16px',
                      background: 'var(--ma-bg)',
                      border: '1px solid var(--ma-border)',
                      borderRadius: '8px',
                      color: 'var(--ma-text)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Copy size={14} /> Copy Music Prompt
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: '16px',
                borderTop: '1px solid var(--ma-border)',
                display: 'flex',
                gap: '12px'
              }}
            >
              <input
                ref={storyboardUploadRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleStoryboardUpload}
              />
              <button
                onClick={onApprove}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#EC4899',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFF',
                  fontWeight: 600,
                  fontFamily: 'Outfit',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 24px rgba(236, 72, 153, 0.3)'
                }}
              >
                🎬 Generate Video →
              </button>
              <button
                onClick={() => storyboardUploadRef.current?.click()}
                style={{
                  padding: '14px 16px',
                  background: 'var(--ma-surface)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: '10px',
                  color: 'var(--ma-text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Upload size={15} /> Upload
              </button>
              <button
                onClick={() => onUpdateProject({ outputs: { ...outputs, storyboard_image_url: null } })}
                style={{
                  padding: '14px 16px',
                  background: 'var(--ma-surface)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: '10px',
                  color: 'var(--ma-text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RotateCcw size={15} /> Regenerate
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'var(--ma-surface)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              <FileText size={28} color="rgba(255,255,255,0.4)" />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px' }}>
              Your storyboard will appear here
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)', maxWidth: '250px' }}>
              Fill in the settings and click Generate Storyboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
