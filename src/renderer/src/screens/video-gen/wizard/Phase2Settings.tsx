/**
 * Ad Maker Wizard — Phase 2: Settings, Storyboard Generation & Approval
 */
import React, { useState } from 'react'
import {
  Loader2,
  CheckCircle2,
  ChevronRight,
  Wand2,
  RefreshCw,
  ImageIcon
} from 'lucide-react'
import { BASE_RULES, VIBE_RULES, buildAdMakerPrompt } from '../prompts/ad-maker-prompts'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram Reels', aspect: '9:16', icon: '📱' },
  { id: 'tiktok', label: 'TikTok', aspect: '9:16', icon: '🎵' },
  { id: 'youtube', label: 'YouTube', aspect: '16:9', icon: '▶️' },
  { id: 'tv', label: 'TV / Streaming', aspect: '16:9', icon: '📺' }
]

const DURATIONS = [5, 10, 15]

const VIBES = [
  {
    id: 'hyper_motion',
    label: 'Hyper Motion',
    desc: 'Fast-paced, kinetic, neon energy',
    color: 'var(--ma-accent)'
  },
  {
    id: 'tv_spot',
    label: 'TV Spot',
    desc: 'Premium, elegant, slow-motion luxury',
    color: '#9B8FFF'
  },
  {
    id: 'wild_card',
    label: 'Wild Card',
    desc: 'Surreal, experimental, gravity-defying',
    color: '#F59E0B'
  }
]

interface Phase2Props {
  referenceSheetUrl: string
  onApprove: (params: {
    platform: string
    aspectRatio: string
    duration: number
    vibe: string
    creativeDirection: string
    productName: string
    brandName: string
    storyboardVisualPrompt: string
    seedanceVideoPrompt: string
    seedanceNegativePrompt: string
    voiceoverScript: string
    musicPrompt: string
    storyboardImageUrl: string
  }) => void
}

export function Phase2Settings({ referenceSheetUrl, onApprove }: Phase2Props): React.ReactElement {
  const [platform, setPlatform] = useState('instagram')
  const [duration, setDuration] = useState(10)
  const [vibe, setVibe] = useState('hyper_motion')
  const [productName, setProductName] = useState('')
  const [brandName, setBrandName] = useState('')
  const [creativeDirection, setCreativeDirection] = useState('')

  const [generating, setGenerating] = useState(false)
  const [outputs, setOutputs] = useState<{
    storyboard_visual_prompt: string
    seedance_video_prompt: string
    seedance_negative_prompt: string
    voiceover_script: string
    music_prompt: string
    storyboard_image_url: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedPlatform = PLATFORMS.find((p) => p.id === platform)!
  const aspectRatio = selectedPlatform.aspect

  const handleGenerate = async () => {
    setGenerating(true)
    setOutputs(null)
    setError(null)

    try {
      const userPrompt = buildAdMakerPrompt({
        productName,
        brandName,
        platform: selectedPlatform.label,
        aspectRatio,
        duration,
        vibe,
        creativeDirection
      })

      const vibeSystemNote = VIBE_RULES[vibe] ?? ''
      const systemPrompt = `${BASE_RULES}\n${vibeSystemNote}`

      // Primary: Gemini 2.5 Pro via vision (analyze reference sheet + generate outputs)
      let raw: string | undefined
      const primaryResult = await window.api.fal.analyzeImageVision(
        referenceSheetUrl,
        userPrompt,
        systemPrompt,
        'google/gemini-2.5-pro'
      )

      if (!primaryResult.error && primaryResult.data) {
        raw = primaryResult.data
      } else {
        console.warn('[AdMaker Phase2] Gemini failed, trying Claude fallback:', primaryResult.error)
        // Fallback: Claude claude-sonnet-4-5 via chatCompletion
        const fallbackResult = await window.api.fal.chatCompletion(
          [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: referenceSheetUrl }
                },
                { type: 'text', text: userPrompt }
              ]
            }
          ],
          'anthropic/claude-sonnet-4-5'
        )
        if (fallbackResult.error || !fallbackResult.data) {
          throw new Error(fallbackResult.error || 'Both LLM calls failed.')
        }
        raw = fallbackResult.data
      }

      // Parse JSON from LLM response
      const cleaned = raw
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim()
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace === -1 || lastBrace === -1) throw new Error('LLM returned no JSON object.')
      const parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1))

      const storyboardVisualPrompt: string = parsed.storyboard_visual_prompt ?? ''
      const seedanceVideoPrompt: string = parsed.seedance_video_prompt ?? ''
      const seedanceNegativePrompt: string = parsed.seedance_negative_prompt ?? ''
      const voiceoverScript: string = parsed.voiceover_script ?? ''
      const musicPrompt: string = parsed.music_prompt ?? ''

      if (!storyboardVisualPrompt) throw new Error('LLM returned empty storyboard prompt.')

      // Generate storyboard image via GPT Image 2
      const imgResult = await window.api.fal.nanoBananaEdit({
        model: 'fal-ai/gpt-image-1',
        prompt: storyboardVisualPrompt,
        image_urls: [referenceSheetUrl],
        resolution: aspectRatio === '9:16' ? '1024x1792' : '1792x1024',
        output_format: 'webp',
        num_images: 1
      })

      const storyboardUrl =
        imgResult?.images?.[0]?.url ?? imgResult?.image?.url ?? (imgResult as any)?.url
      if (!storyboardUrl) throw new Error('Storyboard image generation returned no URL.')

      setOutputs({
        storyboard_visual_prompt: storyboardVisualPrompt,
        seedance_video_prompt: seedanceVideoPrompt,
        seedance_negative_prompt: seedanceNegativePrompt,
        voiceover_script: voiceoverScript,
        music_prompt: musicPrompt,
        storyboard_image_url: storyboardUrl
      })
    } catch (err: any) {
      setError(err.message || 'Generation failed.')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = () => {
    if (!outputs) return
    onApprove({
      platform,
      aspectRatio,
      duration,
      vibe,
      creativeDirection,
      productName,
      brandName,
      storyboardVisualPrompt: outputs.storyboard_visual_prompt,
      seedanceVideoPrompt: outputs.seedance_video_prompt,
      seedanceNegativePrompt: outputs.seedance_negative_prompt,
      voiceoverScript: outputs.voiceover_script,
      musicPrompt: outputs.music_prompt,
      storyboardImageUrl: outputs.storyboard_image_url
    })
  }

  const cardStyle = (active: boolean, color = 'var(--ma-accent)'): React.CSSProperties => ({
    borderRadius: 12,
    border: `1px solid ${active ? color : 'var(--ma-border)'}`,
    background: active ? `${color}18` : 'rgba(255,255,255,0.02)',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    boxShadow: active ? `0 0 0 1px ${color}` : 'none'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Product / Brand */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Product Name (optional)</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Summer Kaftan"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Brand Name (optional)</label>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Maison Elara"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Platform */}
      <div>
        <label style={labelStyle}>Target Platform</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {PLATFORMS.map((p) => (
            <div key={p.id} style={cardStyle(platform === p.id)} onClick={() => setPlatform(p.id)}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FFF' }}>{p.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {p.aspect}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label style={labelStyle}>Duration</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              style={{
                ...cardStyle(duration === d),
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: 'none',
                borderWidth: duration === d ? 1 : 1,
                borderStyle: 'solid',
                borderColor: duration === d ? 'var(--ma-accent)' : 'var(--ma-border)'
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: '#FFF' }}>{d}s</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>seconds</span>
            </button>
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div>
        <label style={labelStyle}>Creative Vibe</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {VIBES.map((v) => (
            <div
              key={v.id}
              onClick={() => setVibe(v.id)}
              style={{ ...cardStyle(vibe === v.id, v.color), flex: 1, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: vibe === v.id ? v.color : '#FFF' }}>
                {v.label}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                {v.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Creative Direction */}
      <div>
        <label style={labelStyle}>Creative Direction Notes (optional)</label>
        <textarea
          value={creativeDirection}
          onChange={(e) => setCreativeDirection(e.target.value)}
          placeholder="e.g. Focus on the embroidery details, use golden hour tones, no mannequin..."
          style={{
            ...inputStyle,
            minHeight: 80,
            resize: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 13,
            color: '#FCA5A5'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Storyboard Output */}
      {outputs && (
        <div
          style={{
            borderRadius: 16,
            border: '1px solid rgba(108,99,255,0.3)',
            background: 'rgba(108,89,255,0.04)',
            overflow: 'hidden'
          }}
        >
          <img
            src={outputs.storyboard_image_url}
            alt="Storyboard"
            style={{ width: '100%', display: 'block' }}
          />
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <OutputBlock label="🎬 Video Prompt" text={outputs.seedance_video_prompt} />
            <OutputBlock label="🎙️ Voiceover Script" text={outputs.voiceover_script} />
            <OutputBlock label="🎵 Music Prompt" text={outputs.music_prompt} />
          </div>
        </div>
      )}

      {/* Generate / Approve Buttons */}
      {!outputs ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            background: generating
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
            color: generating ? 'rgba(255,255,255,0.3)' : '#FFF',
            fontSize: 14,
            fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: generating ? 'none' : '0 4px 20px rgba(108, 99, 255, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          {generating ? <Loader2 size={18} className="spin" /> : <Wand2 size={18} />}
          {generating ? 'Generating Storyboard…' : 'Generate Visual Storyboard'}
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setOutputs(null)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid var(--ma-border)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={14} /> Regenerate
          </button>
          <button
            onClick={handleApprove}
            style={{
              flex: 2,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#FFF',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
            }}
          >
            <CheckCircle2 size={16} /> Approve Storyboard
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

function OutputBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        padding: 14
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <button
          onClick={copy}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid var(--ma-border)',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer'
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 8
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--ma-border)',
  background: 'rgba(255,255,255,0.04)',
  color: '#FFF',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box'
}
