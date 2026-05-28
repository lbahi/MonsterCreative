import React, { useState } from 'react';
import { Play, Download, RotateCcw, Loader2, Copy, Music } from 'lucide-react';
import type { AdProject } from '../hooks/useAdsMaker';

interface Phase3Props {
  project: AdProject;
  isGenerating: boolean;
  loadingMessage: string;
  onGenerate: (editedPrompt?: string, generateAudio?: boolean) => void;
  onOpenAudioLab: () => void;
}

export function Phase3_VideoGen({
  project,
  isGenerating,
  loadingMessage,
  onGenerate,
  onOpenAudioLab
}: Phase3Props): React.ReactElement {
  const [editedPrompt, setEditedPrompt] = useState(project.outputs.seedance_video_prompt || '');
  const [generateAudio, setGenerateAudio] = useState(false);

  const { metadata, outputs } = project;
  const hasVideo = !!outputs.final_video_url;

  const handleGenerate = () => {
    onGenerate(editedPrompt, generateAudio);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', minHeight: '500px' }}>
      {/* Left Panel - Video Prompt */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Section Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '20px', height: '1px', background: '#EC4899' }} />
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              color: '#EC4899',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Video Prompt
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--ma-text-muted)' }}>
          Review and edit the AI-generated prompt before creating your video.
        </p>

        {/* Editable Prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ma-text)' }}>
            SEEDANCE 2.0 VIDEO PROMPT
          </label>
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            onBlur={() => {}}
            rows={10}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--ma-bg)',
              border: '1px solid var(--ma-border)',
              borderRadius: '8px',
              color: 'var(--ma-text)',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono',
              lineHeight: 1.6,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Technical Settings */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '12px',
            background: 'var(--ma-bg)',
            borderRadius: '8px'
          }}
        >
          <span
            style={{
              padding: '4px 10px',
              background: 'rgba(108, 99, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '11px',
              color: 'var(--ma-accent)'
            }}
          >
            Duration: {metadata.duration}s
          </span>
          <span
            style={{
              padding: '4px 10px',
              background: 'rgba(108, 99, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '11px',
              color: 'var(--ma-accent)'
            }}
          >
            Aspect: {metadata.aspect_ratio}
          </span>
          <span
            style={{
              padding: '4px 10px',
              background: 'rgba(108, 99, 255, 0.1)',
              borderRadius: '12px',
              fontSize: '11px',
              color: 'var(--ma-accent)'
            }}
          >
            Model: Seedance 2.0
          </span>
        </div>

        {/* Audio Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'var(--ma-bg)',
            borderRadius: '8px',
            border: '1px solid var(--ma-border)'
          }}
        >
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ma-text)', margin: 0 }}>Generate with Audio</p>
            <p style={{ fontSize: '11px', color: 'var(--ma-text-muted)', margin: '2px 0 0 0' }}>Seedance AI-generated sound</p>
          </div>
          <div
            onClick={() => setGenerateAudio(v => !v)}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: generateAudio ? 'var(--ma-accent)' : 'var(--ma-surface)',
              border: `1px solid ${generateAudio ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: generateAudio ? '22px' : '3px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#FFF',
                transition: 'left 0.2s'
              }}
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || hasVideo}
          style={{
            width: '100%',
            padding: '14px',
            background: !hasVideo ? '#EC4899' : 'var(--ma-surface)',
            border: 'none',
            borderRadius: '10px',
            color: !hasVideo ? '#FFF' : 'rgba(255,255,255,0.3)',
            fontWeight: 600,
            fontFamily: 'Outfit',
            fontSize: '15px',
            cursor: !hasVideo ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: 'auto',
            boxShadow: !hasVideo ? '0 0 30px rgba(236, 72, 153, 0.4)' : 'none'
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {loadingMessage}
            </>
          ) : (
            <>
              <Play size={18} fill="white" />
              🎬 Generate Video
            </>
          )}
        </button>

        {isGenerating && (
          <p style={{ fontSize: '11px', color: 'var(--ma-text-muted)', textAlign: 'center' }}>
            This takes 60-120 seconds
          </p>
        )}
      </div>

      {/* Right Panel - Video Player */}
      <div
        style={{
          background: 'var(--ma-elevated)',
          border: '1px solid var(--ma-border)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '500px',
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'hidden'
        }}
      >
        {isGenerating ? (
          <div style={{ textAlign: 'center', margin: 'auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <Loader2 size={56} color="#EC4899" className="animate-spin" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#EC4899', marginBottom: '12px' }}>
              Generating Your Commercial
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--ma-text-muted)' }}>
              {loadingMessage}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ma-text-subtle)', marginTop: '8px' }}>
              Estimated time: 60-120 seconds
            </p>
          </div>
        ) : hasVideo ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflow: 'hidden' }}>
            {/* Video Player */}
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', flexShrink: 0 }}>
              Final Generated Video
            </h3>
            <div
              style={{
                background: 'var(--ma-bg)',
                borderRadius: '12px',
                overflow: 'hidden',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <video
                src={outputs.final_video_url!}
                controls
                autoPlay
                poster={outputs.storyboard_image_url || undefined}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 'calc(100vh - 380px)',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            {/* Asset Downloads */}
            <div style={{ flexShrink: 0 }}>
            <div
              style={{
                background: 'var(--ma-bg)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <h4
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono',
                  color: 'var(--ma-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '16px', height: '1px', background: 'var(--ma-accent)' }} />
                All Assets
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => downloadFile(outputs.storyboard_image_url!, 'storyboard.jpg')}
                  style={{
                    padding: '10px',
                    background: 'var(--ma-elevated)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: '8px',
                    color: 'var(--ma-text)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Download Storyboard
                </button>
                <button
                  onClick={() => downloadFile(outputs.final_video_url!, 'video.mp4')}
                  style={{
                    padding: '10px',
                    background: 'var(--ma-green)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} /> Download Video
                </button>
                <button
                  onClick={() => copyToClipboard(outputs.voiceover_script || '')}
                  style={{
                    padding: '10px',
                    background: 'var(--ma-elevated)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: '8px',
                    color: 'var(--ma-text)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={14} /> Copy Voiceover
                </button>
                <button
                  onClick={() => copyToClipboard(outputs.music_prompt || '')}
                  style={{
                    padding: '10px',
                    background: 'var(--ma-elevated)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: '8px',
                    color: 'var(--ma-text)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Music size={14} /> Copy Music Prompt
                </button>
                <button
                  onClick={onOpenAudioLab}
                  style={{
                    gridColumn: 'span 2',
                    padding: '10px',
                    background: 'var(--ma-accent)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  Open in Audio Lab →
                </button>
              </div>
            </div>

            {/* Regenerate */}
            <button
              onClick={() => onGenerate(editedPrompt, generateAudio)}
              style={{
                padding: '12px',
                background: 'var(--ma-surface)',
                border: '1px solid var(--ma-border)',
                borderRadius: '8px',
                color: 'var(--ma-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={16} /> Regenerate Video
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
              <Play size={28} color="rgba(255,255,255,0.4)" />
            </div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ma-text)', marginBottom: '8px' }}>
              Your commercial video will appear here
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--ma-text-muted)', maxWidth: '250px' }}>
              Click Generate Video to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
