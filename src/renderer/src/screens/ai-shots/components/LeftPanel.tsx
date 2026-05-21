import React from 'react'
import { Upload, Lightbulb, Check, ChevronDown } from 'lucide-react'
import { PRODUCT_TYPES, SHOT_STYLES, AGE_RANGES, MODEL_STYLES, SKIN_TONES } from '../data/templates'
import { MODEL_TEMPLATES } from '../data/model-templates'
import { ModelTypeSelector, ModelTemplate } from './ModelTypeSelector'

interface LeftPanelProps {
  currentStep: number
  productType: string
  setProductType: (val: string) => void
  shotStyle: string
  setShotStyle: (val: string) => void
  productName: string
  setProductName: (val: string) => void
  productDescription: string
  setProductDescription: (val: string) => void
  ageRange: string
  setAgeRange: (val: string) => void
  modelStyle: string
  setModelStyle: (val: string) => void
  skinTone: number
  setSkinTone: (val: number) => void
  selectedModelType: ModelTemplate | null
  setSelectedModelType: (val: ModelTemplate | null) => void
  model: string
  setModel: (val: string) => void
  imageCount: number
  setImageCount: (val: number) => void
  resolution: string
  setResolution: (val: string) => void
  aspectRatio: string
  setAspectRatio: (val: string) => void
  uploadedImages: string[]
  activeImageIndex: number
  setActiveImageIndex: (val: number) => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleDeleteImage: (idx: number) => void
  shouldShowStep4: boolean
  generating: boolean
}

export function LeftPanel({
  currentStep,
  productType,
  setProductType,
  shotStyle,
  setShotStyle,
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  ageRange,
  setAgeRange,
  modelStyle,
  setModelStyle,
  skinTone,
  setSkinTone,
  selectedModelType,
  setSelectedModelType,
  model,
  setModel,
  imageCount,
  setImageCount,
  resolution,
  setResolution,
  aspectRatio,
  setAspectRatio,
  uploadedImages,
  activeImageIndex,
  setActiveImageIndex,
  handleImageUpload,
  handleDeleteImage,
  shouldShowStep4,
  generating
}: LeftPanelProps) {
  return (
    <div
      style={{
        width: 330,
        minWidth: 330,
        background: '#0B0B17', // Design brief: Sidebar/panel background
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* STEP 1: Upload Your Product */}
      {currentStep === 1 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ height: 1, width: 16, background: '#6C63FF' }} />
            <span
              style={{
                color: '#6C63FF',
                letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700
              }}
            >
              STEP 01 — PRODUCT IMAGE
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            Upload your product
          </h2>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 20,
              lineHeight: 1.4
            }}
          >
            A clean product photo works best. You can select multiple images to batch generate.
          </p>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: uploadedImages.length > 0 ? 110 : 220,
              borderRadius: 12,
              border: '2px dashed rgba(108, 99, 255, 0.3)',
              background: '#11111A', // Design brief: Card background
              cursor: 'pointer',
              transition: 'all 0.2s',
              padding: 16,
              textAlign: 'center',
              marginBottom: 16
            }}
            className="hover-card-neon"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <Upload
              size={uploadedImages.length > 0 ? 20 : 28}
              style={{ color: '#6C63FF', marginBottom: uploadedImages.length > 0 ? 6 : 12 }}
            />
            <span
              style={{
                fontSize: uploadedImages.length > 0 ? 11 : 13,
                fontWeight: 700,
                color: '#FFF',
                marginBottom: 2,
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              {uploadedImages.length > 0 ? 'Upload more images' : 'Drop product image here'}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
              PNG, JPG, WEBP — Multi-select ok
            </span>
          </label>

          {/* Uploaded Thumbnails Collection Grid */}
          {uploadedImages.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 0.5,
                  display: 'block',
                  marginBottom: 6
                }}
              >
                UPLOADED PHOTOS ({uploadedImages.length})
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {uploadedImages.map((img, i) => {
                  const isActive = activeImageIndex === i
                  return (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1/1' }}>
                      <button
                        onClick={() => setActiveImageIndex(i)}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 8,
                          border: `2px solid ${isActive ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                          background: '#11111A',
                          overflow: 'hidden',
                          padding: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive ? '0 0 8px rgba(108,99,255,0.3)' : 'none'
                        }}
                      >
                        <img
                          src={img}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(i)
                        }}
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 15,
                          height: 15,
                          borderRadius: '50%',
                          background: '#EF4444',
                          color: '#FFF',
                          fontSize: 9,
                          fontWeight: 900,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                        title="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(108, 99, 255, 0.06)',
              border: '1px solid rgba(108, 99, 255, 0.12)',
              marginTop: 16
            }}
          >
            <Lightbulb size={14} style={{ color: '#6C63FF', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
              Tip: Uploading multiple images will generate photoshoot backdrops across all items in a
              round-robin cycle!
            </span>
          </div>
        </>
      )}

      {/* STEP 2: Product Type */}
      {currentStep === 2 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ height: 1, width: 16, background: '#6C63FF' }} />
            <span
              style={{
                color: '#6C63FF',
                letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700
              }}
            >
              STEP 02 — PRODUCT TYPE
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            What are you selling?
          </h2>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 20,
              lineHeight: 1.4
            }}
          >
            This informs the AI about structural details, category parameters, and context.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRODUCT_TYPES.map((type) => {
              const isSel = productType === type.id
              return (
                <button
                  key={type.id}
                  onClick={() => setProductType(type.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${isSel ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                    background: isSel ? 'rgba(108, 99, 255, 0.08)' : '#11111A',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: isSel ? '0 0 10px rgba(108, 99, 255, 0.15)' : 'none'
                  }}
                >
                  <span style={{ fontSize: 20 }}>{type.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#FFF',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {type.title}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>
                      {type.subtitle}
                    </div>
                  </div>
                  {isSel && <Check size={14} style={{ color: '#6C63FF' }} />}
                </button>
              )
            })}
          </div>

          {/* Conditional Product Name & Details Compiler Inputs */}
          {productType !== 'wearable' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 16
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: '#6C63FF',
                    letterSpacing: '1px',
                    display: 'block',
                    marginBottom: 6
                  }}
                >
                  PRODUCT NAME
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Organic Lavender Serum"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: '#11111A',
                    color: '#FFF',
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: '#6C63FF',
                    letterSpacing: '1px',
                    display: 'block',
                    marginBottom: 6
                  }}
                >
                  PRODUCT DESCRIPTION
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe unique features, materials, color, or shape..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: '#11111A',
                    color: '#FFF',
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 3: Choose Shot Style */}
      {currentStep === 3 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ height: 1, width: 16, background: '#6C63FF' }} />
            <span
              style={{
                color: '#6C63FF',
                letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700
              }}
            >
              STEP 03 — SHOT STYLE
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            Choose your scene
          </h2>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 20,
              lineHeight: 1.4
            }}
          >
            Select the backdrop aesthetic, mood, and camera setup for your campaign.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {SHOT_STYLES.map((style) => {
              const isSel = shotStyle === style.id
              return (
                <div
                  key={style.id}
                  onClick={() => setShotStyle(style.id)}
                  style={{
                    position: 'relative',
                    borderRadius: 10,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    aspectRatio: '3/4',
                    border: `2px solid ${isSel ? style.color : 'transparent'}`,
                    boxShadow: isSel ? `0 0 16px ${style.color}33` : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {/* Thumbnail Image */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${style.color}22, ${style.color}08)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={style.thumbnail}
                      loading="lazy"
                      alt={style.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: isSel ? 1 : 0.65,
                        transition: 'opacity 0.15s'
                      }}
                    />
                  </div>

                  {/* Gradient Overlay & Text Labels */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.88))',
                      padding: '24px 6px 8px',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: isSel ? style.color : '#FFF',
                        letterSpacing: '0.5px',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {style.title}
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {style.subtitle}
                    </div>
                  </div>

                  {/* Selected Tick Indicator */}
                  {isSel && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: style.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: '#FFF',
                        fontWeight: 700
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* STEP 4: Casting / Customize model */}
      {currentStep === 4 && shouldShowStep4 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ height: 1, width: 16, background: '#6C63FF' }} />
            <span
              style={{
                color: '#6C63FF',
                letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700
              }}
            >
              STEP 04 — CASTING
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            {productType === 'wearable' ? 'Casting options' : 'Customise model'}
          </h2>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 20,
              lineHeight: 1.4
            }}
          >
            {productType === 'wearable'
              ? 'Select an AI demographic profile from our high-end models roster.'
              : 'Tune demographic, age range, style, and skin tones for the beauty model.'}
          </p>

          {/* BRANCH A: Wearable casting demographic grid */}
          {productType === 'wearable' ? (
            <ModelTypeSelector
              modelTemplates={MODEL_TEMPLATES}
              selectedModelType={selectedModelType}
              onSelect={setSelectedModelType}
            />
          ) : (
            /* BRANCH B: Beauty customizable sliders */
            <>
              {/* Age select */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: 0.5,
                    display: 'block',
                    marginBottom: 8
                  }}
                >
                  MODEL AGE RANGE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {AGE_RANGES.map((item) => {
                    const isSel = ageRange === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setAgeRange(item.id)}
                        style={{
                          padding: '6px 4px',
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: `1px solid ${isSel ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                          background: isSel ? '#6C63FF' : '#11111A',
                          color: '#FFF',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Style select */}
              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: 0.5,
                    display: 'block',
                    marginBottom: 8
                  }}
                >
                  AESTHETIC STYLE
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
                  {MODEL_STYLES.map((styleItem) => {
                    const isSel = modelStyle === styleItem.id
                    return (
                      <button
                        key={styleItem.id}
                        onClick={() => setModelStyle(styleItem.id)}
                        style={{
                          padding: '6px 2px',
                          borderRadius: 6,
                          border: `1px solid ${isSel ? '#6C63FF' : 'rgba(255,255,255,0.06)'}`,
                          background: isSel ? 'rgba(108,99,255,0.08)' : '#11111A',
                          color: '#FFF',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 700 }}>{styleItem.title}</div>
                        <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)' }}>
                          {styleItem.subtitle}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: 0.5,
                    display: 'block',
                    marginBottom: 8
                  }}
                >
                  SKIN TONE
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {SKIN_TONES.map((tone, idx) => {
                    const isSel = skinTone === idx
                    return (
                      <button
                        key={idx}
                        onClick={() => setSkinTone(idx)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: tone.color,
                          border: isSel ? '2px solid #6C63FF' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          transform: isSel ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s',
                          boxShadow: isSel ? '0 0 8px #6C63FF' : 'none'
                        }}
                        title={tone.label}
                      />
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* STEP 5: Final Settings & Generation */}
      {currentStep === 5 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ height: 1, width: 16, background: '#6C63FF' }} />
            <span
              style={{
                color: '#6C63FF',
                letterSpacing: 2,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                fontWeight: 700
              }}
            >
              STEP 05 — FINAL SETTINGS
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              marginBottom: 8,
              lineHeight: 1.2
            }}
          >
            How many shots?
          </h2>
          <p
            style={{
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 20,
              lineHeight: 1.4
            }}
          >
            Each image uses a unique AI-generated scene prompt for beautiful catalog variability.
          </p>

          {/* Number selector - Counter [ - ] [ 4 ] [ + ] */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 20,
              padding: '12px 0',
              background: '#11111A',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)'
            }}
          >
            <label
              style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '1px',
                marginBottom: 10
              }}
            >
              NUMBER OF IMAGES
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <button
                onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                disabled={generating}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#FFF',
                  fontSize: 18,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: 28,
                  color: '#FFF',
                  width: 24,
                  textAlign: 'center'
                }}
              >
                {imageCount}
              </span>
              <button
                onClick={() => setImageCount(Math.min(8, imageCount + 1))}
                disabled={generating}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'transparent',
                  color: '#FFF',
                  fontSize: 18,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s'
                }}
              >
                +
              </button>
            </div>
            <span
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.35)',
                marginTop: 10,
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              {imageCount} unique scenes will be generated
            </span>
          </div>

          {/* Model Selector Dropdown - Same styling as CommonSettings.tsx */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: '#6C63FF',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: 6
              }}
            >
              GENERATIVE ENGINE
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={generating}
                style={{
                  width: '100%',
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 32px 10px 12px',
                  color: '#FFF',
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {['Nano Banana', 'Nano Banana 2', 'Nano Banana Pro', 'GPT Image 2'].map((m) => (
                  <option key={m} value={m} style={{ background: '#11111A', color: '#FFF' }}>
                    {m}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.4)',
                  pointerEvents: 'none'
                }}
              >
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Aspect Ratio and Resolution Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <div>
              <label
                style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 6
                }}
              >
                RESOLUTION
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={generating}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 28px 8px 10px',
                    color: '#FFF',
                    fontSize: 12,
                    outline: 'none',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {['0.5K', '1K', '2K', '4K'].map((res) => (
                    <option
                      key={res}
                      value={res}
                      style={{ background: '#11111A', color: '#FFF' }}
                    >
                      {res}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.4)',
                    pointerEvents: 'none'
                  }}
                >
                  <ChevronDown size={12} />
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: 6
                }}
              >
                ASPECT RATIO
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  disabled={generating}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    padding: '8px 28px 8px 10px',
                    color: '#FFF',
                    fontSize: 12,
                    outline: 'none',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  {['1:1', '4:5', '9:16', '16:9', '4:3', '3:4', '2:3'].map((ratio) => (
                    <option
                      key={ratio}
                      value={ratio}
                      style={{ background: '#11111A', color: '#FFF' }}
                    >
                      {ratio}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.4)',
                    pointerEvents: 'none'
                  }}
                >
                  <ChevronDown size={12} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
