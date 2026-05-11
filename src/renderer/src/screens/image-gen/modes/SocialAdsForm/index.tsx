import { useSocialAds } from './hooks/useSocialAds'
import {
  SOCIAL_MODELS,
  SOCIAL_RATIOS,
  SOCIAL_RESOLUTIONS,
  SOCIAL_LANGUAGES
} from './data/social-templates'
import type { SocialAdsFormProps } from './types'
import { TemplatePreviewLightbox } from './components/TemplatePreviewLightbox'
import { ProductImageUpload } from './components/ProductImageUpload'
import { TemplateGrid } from './components/TemplateGrid'
import { PromptPreviewFooter } from './components/PromptPreviewFooter'

export function SocialAdsForm(props: SocialAdsFormProps): JSX.Element {
  const socialAds = useSocialAds(props)
  const { model, setModel } = props

  const canGenerate = !props.generating && !!props.refImage && !!socialAds.selectedTemplate

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TemplatePreviewLightbox
        previewTemplate={socialAds.previewTemplate}
        selectedRatio={socialAds.selectedRatio}
        selectedResolution={socialAds.selectedResolution}
        selectedLanguage={socialAds.selectedLanguage}
        refImage={props.refImage}
        generating={props.generating}
        onClose={() => socialAds.setPreviewTemplate(null)}
        onGenerate={socialAds.handleLightboxGenerate}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ProductImageUpload
            dragging={socialAds.dragging}
            productImageDataUrl={props.refImage}
            onDragOver={socialAds.handleDragOver}
            onDragLeave={socialAds.handleDragLeave}
            onDrop={socialAds.handleDrop}
            onFileSelect={socialAds.handleFileSelect}
            onClear={socialAds.clearImage}
          />

          <label
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 600
            }}
          >
            2 · Aspect Ratio
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RATIOS.map((r) => (
              <button
                key={r.id}
                onClick={() => socialAds.setSelectedRatio(r.id)}
                style={{
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    socialAds.selectedRatio === r.id
                      ? 'rgba(59,130,246,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  outline:
                    socialAds.selectedRatio === r.id
                      ? '1.5px solid #3B82F6'
                      : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: socialAds.selectedRatio === r.id ? '#3B82F6' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {r.desc}
                </div>
              </button>
            ))}
          </div>

          <label
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 600
            }}
          >
            3 · Resolution
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {SOCIAL_RESOLUTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => socialAds.setSelectedResolution(r.id)}
                style={{
                  padding: '7px 6px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    socialAds.selectedResolution === r.id
                      ? 'rgba(139,92,246,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  outline:
                    socialAds.selectedResolution === r.id
                      ? '1.5px solid #8B5CF6'
                      : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s'
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color:
                      socialAds.selectedResolution === r.id ? '#8B5CF6' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {r.label}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  {r.desc}
                </div>
              </button>
            ))}
          </div>

          <label
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 600
            }}
          >
            4 · Ad Language
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {SOCIAL_LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => socialAds.setSelectedLanguage(l.id)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    socialAds.selectedLanguage === l.id
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(255,255,255,0.04)',
                  outline:
                    socialAds.selectedLanguage === l.id
                      ? '1.5px solid #F59E0B'
                      : '1.5px solid rgba(255,255,255,0.06)',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 16, lineHeight: 1 }}>{l.flag}</div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color:
                      socialAds.selectedLanguage === l.id ? '#F59E0B' : 'rgba(255,255,255,0.7)',
                    marginTop: 3
                  }}
                >
                  {l.label}
                </div>
              </button>
            ))}
          </div>

          <label
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 600
            }}
          >
            5 · Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{
              background: 'var(--ma-elevated)',
              border: '1px solid var(--ma-border)',
              color: '#FFF',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 12,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            {SOCIAL_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.desc}
              </option>
            ))}
          </select>
        </div>

        <TemplateGrid
          selectedTemplate={socialAds.selectedTemplate}
          selectedRatio={socialAds.selectedRatio}
          selectedResolution={socialAds.selectedResolution}
          selectedLanguage={socialAds.selectedLanguage}
          onPreviewTemplate={socialAds.setPreviewTemplate}
        />
      </div>

      <PromptPreviewFooter
        canGenerate={canGenerate}
        generating={props.generating}
        progressMsg={socialAds.progressMsg}
        selectedTemplate={socialAds.selectedTemplate}
        selectedRatio={socialAds.selectedRatio}
        savedPath={socialAds.savedPath}
        saveError={socialAds.saveError}
        onGenerate={() => socialAds.generateSocialAd()}
        onOpenFolder={socialAds.openOutputFolder}
      />
    </div>
  )
}
