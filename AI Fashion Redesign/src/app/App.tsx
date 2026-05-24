import { useState } from 'react';
import { Upload, Lightbulb, Check, ChevronLeft, ChevronRight, Sparkles, Minus, Plus } from 'lucide-react';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>('wearable');
  const [shotStyle, setShotStyle] = useState<string | null>('flat-lay');
  const [ageRange, setAgeRange] = useState('young-adult');
  const [modelStyle, setModelStyle] = useState('everyday');
  const [skinTone, setSkinTone] = useState(2);
  const [imageCount, setImageCount] = useState(4);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const productTypes = [
    { id: 'wearable', emoji: '👗', title: 'Wearable', subtitle: 'Clothing, accessories, bags, jewelry' },
    { id: 'beauty', emoji: '💄', title: 'Beauty & Skincare', subtitle: 'Cosmetics, perfume, bio & natural products' },
    { id: 'food', emoji: '🍃', title: 'Food & Wellness', subtitle: 'Supplements, honey, herbal, organic' },
    { id: 'lifestyle', emoji: '🕯️', title: 'Lifestyle Product', subtitle: 'Candles, home décor, handmade goods' },
    { id: 'packaged', emoji: '📦', title: 'Packaged Product', subtitle: 'Boxes, bottles, jars, generic retail' }
  ];

  const shotStyles = [
    { id: 'studio', title: 'Studio Clean', subtitle: 'Minimal. Professional. Timeless.' },
    { id: 'lifestyle', title: 'Lifestyle Scene', subtitle: 'Product in real-life setting' },
    { id: 'model', title: 'Model Showcase', subtitle: 'Human model, wearing or holding', restricted: true },
    { id: 'flat-lay', title: 'Flat Lay', subtitle: 'Overhead. Styled. Editorial.' },
    { id: 'outdoor', title: 'Outdoor Natural', subtitle: 'Natural light, open environment' }
  ];

  const ageRanges = ['Teen 15–19', 'Young Adult 20–30', 'Adult 30–45', 'Mature 45+'];
  const modelStyles = [
    { id: 'everyday', title: 'Everyday', subtitle: 'casual, relatable' },
    { id: 'editorial', title: 'Editorial', subtitle: 'high fashion, structured' },
    { id: 'minimal', title: 'Minimal', subtitle: 'clean, neutral expression' }
  ];

  const skinTones = [
    { label: 'Very light', color: '#FFDFC4' },
    { label: 'Light', color: '#F0C9A0' },
    { label: 'Medium', color: '#D4A574' },
    { label: 'Tan', color: '#C68642' },
    { label: 'Brown', color: '#8D5524' },
    { label: 'Deep', color: '#4A2511' }
  ];

  const shouldShowStep4 = (productType === 'wearable' || productType === 'beauty') && shotStyle === 'model';

  return (
    <div className="w-full h-screen bg-[#07070F] text-white overflow-hidden" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Top Bar */}
      <div className="h-12 border-b border-white/[0.07] flex items-center justify-between px-6" style={{ background: '#0B0B17' }}>
        <h1 className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px' }}>
          AI Product Shots
        </h1>
        <span className="text-white/50 text-sm">Step {currentStep} of 5</span>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 py-6">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  step < currentStep ? 'bg-[#6C63FF]' :
                  step === currentStep ? 'bg-[#6C63FF] ring-2 ring-[#6C63FF]/30' :
                  'bg-white/15'
                }`}
              >
                <span className="text-xs font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {step}
                </span>
              </div>
            </div>
            {step < 5 && <div className={`w-12 h-[1px] ${step < currentStep ? 'bg-[#6C63FF]' : 'bg-white/15'}`} />}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-176px)]">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <>
            <div className="w-[320px] p-6 overflow-y-auto" style={{ background: '#0B0B17' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-5 bg-[#6C63FF]" />
                <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                  STEP 01 — PRODUCT IMAGE
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-1px' }}>
                Upload your product
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                A clean product photo works best. No background needed.
              </p>

              <label className="block cursor-pointer group">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div
                  className="h-[260px] rounded-2xl border-[1.5px] border-dashed border-[#6C63FF]/40 flex flex-col items-center justify-center transition-all group-hover:bg-[#6C63FF]/6 group-hover:border-[#6C63FF]"
                  style={{ background: '#11111A' }}
                >
                  <Upload className="w-8 h-8 text-[#6C63FF] mb-3" />
                  <p className="text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px' }}>
                    Drop your product image here
                  </p>
                  <p className="text-white/40 text-xs">or click to browse — PNG, JPG, WEBP</p>
                </div>
              </label>

              <div className="mt-4 flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#6C63FF]/20" style={{ background: 'rgba(108,99,255,0.1)' }}>
                <Lightbulb className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
                <p className="text-white/50 text-xs">
                  Tip: White or transparent background gives the best results
                </p>
              </div>
            </div>

            <div className="flex-1 p-6 flex items-center justify-center">
              <div className="w-full max-w-md h-96 rounded-2xl border border-white/[0.07] flex flex-col items-center justify-center" style={{ background: '#11111A' }}>
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="Product" className="max-w-[200px] max-h-[200px] object-contain drop-shadow-lg" />
                    <div className="mt-4 px-3 py-1 rounded bg-[#22C55E] flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      <span className="text-white text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Image ready</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/10 mb-3" />
                    <p className="text-white/20 text-sm">Your product preview will appear here</p>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Product Type */}
        {currentStep === 2 && (
          <>
            <div className="w-[320px] p-6 overflow-y-auto" style={{ background: '#0B0B17' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-5 bg-[#6C63FF]" />
                <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                  STEP 02 — PRODUCT TYPE
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-1px' }}>
                What are you selling?
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                This shapes how your product is presented in the scene.
              </p>

              <div className="space-y-3">
                {productTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setProductType(type.id)}
                    className={`w-full h-16 rounded-2xl px-5 flex items-center gap-3 transition-all ${
                      productType === type.id
                        ? 'border-[1.5px] border-[#6C63FF] shadow-[0_0_0_3px_rgba(108,99,255,0.15)]'
                        : 'border border-white/[0.07] hover:border-white/20'
                    }`}
                    style={{
                      background: productType === type.id ? 'rgba(108,99,255,0.08)' : '#11111A'
                    }}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-white text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                        {type.title}
                      </div>
                      <div className="text-white/40 text-xs">{type.subtitle}</div>
                    </div>
                    {productType === type.id && <Check className="w-5 h-5 text-[#6C63FF]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
              {uploadedImage && (
                <img src={uploadedImage} alt="Product" className="max-w-[120px] max-h-[120px] object-contain" />
              )}
              <div className="flex items-center gap-2 text-[#6C63FF]">
                <div className="w-1 h-1 rounded-full bg-[#6C63FF] animate-pulse" />
                <span className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Analyzing product type...
                </span>
              </div>
              <div className="w-full max-w-sm rounded-xl border border-white/[0.07] p-5" style={{ background: '#11111A' }}>
                <h3 className="text-white/70 mb-3" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '13px' }}>
                  What this affects
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <div className="w-1 h-1 rounded-full bg-[#6C63FF]" />
                    Scene suggestions
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <div className="w-1 h-1 rounded-full bg-[#6C63FF]" />
                    Model availability
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <div className="w-1 h-1 rounded-full bg-[#6C63FF]" />
                    Shot angle recommendations
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Shot Style */}
        {currentStep === 3 && (
          <>
            <div className="w-[320px] p-6 overflow-y-auto" style={{ background: '#0B0B17' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-5 bg-[#6C63FF]" />
                <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                  STEP 03 — SHOT STYLE
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-1px' }}>
                Choose your scene
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                Pick the visual mood for your product images.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {shotStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setShotStyle(style.id)}
                    className={`rounded-2xl p-3 transition-all relative ${
                      shotStyle === style.id
                        ? 'border-[1.5px] border-[#6C63FF] shadow-[0_0_0_3px_rgba(108,99,255,0.15)]'
                        : 'border border-white/[0.07] hover:border-white/20'
                    } ${style.id === 'outdoor' ? 'col-span-2' : ''}`}
                    style={{
                      background: shotStyle === style.id ? 'rgba(108,99,255,0.08)' : '#11111A'
                    }}
                  >
                    {style.restricted && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        WEARABLE & BEAUTY ONLY
                      </div>
                    )}
                    <div className="w-full h-20 rounded-lg bg-gradient-to-br from-white/5 to-white/10 mb-2" />
                    <div className="text-white text-sm text-left" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                      {style.title}
                    </div>
                    <div className="text-white/40 text-[11px] text-left">{style.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
              <div className="w-full max-w-lg h-[300px] rounded-2xl border border-white/[0.07] flex items-center justify-center relative overflow-hidden" style={{ background: '#11111A' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                {uploadedImage && (
                  <img src={uploadedImage} alt="Product" className="relative z-10 max-w-[180px] max-h-[180px] object-contain drop-shadow-2xl" />
                )}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Preview — {shotStyles.find(s => s.id === shotStyle)?.title}
                </div>
              </div>
              <div className="w-full max-w-lg rounded-xl border border-[#6C63FF]/20 p-4" style={{ background: 'rgba(108,99,255,0.06)' }}>
                <p className="text-white/50 text-xs">
                  Best for: Beauty, food, and lifestyle products. Works especially well for bio skincare and handmade products.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Step 4: Customize (conditional) */}
        {currentStep === 4 && shouldShowStep4 && (
          <>
            <div className="w-[320px] p-6 overflow-y-auto" style={{ background: '#0B0B17' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-5 bg-[#6C63FF]" />
                <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                  STEP 04 — MODEL SETTINGS
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-1px' }}>
                Customise your model
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                These settings personalise the model to match your brand.
              </p>

              {/* Age Range */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[1px] w-5 bg-[#6C63FF]" />
                  <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                    MODEL AGE RANGE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ageRanges.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setAgeRange(['teen', 'young-adult', 'adult', 'mature'][idx])}
                      className={`px-3 py-2 rounded-lg text-xs transition-all ${
                        ageRange === ['teen', 'young-adult', 'adult', 'mature'][idx]
                          ? 'bg-[#6C63FF] text-white'
                          : 'bg-[#11111A] border border-white/10 text-white/50'
                      }`}
                      style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Style */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[1px] w-5 bg-[#6C63FF]" />
                  <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                    AESTHETIC
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {modelStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setModelStyle(style.id)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        modelStyle === style.id
                          ? 'border-[1.5px] border-[#6C63FF] bg-[#6C63FF]/8'
                          : 'border border-white/[0.07] bg-[#11111A]'
                      }`}
                    >
                      <div className="text-white text-xs mb-1" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                        {style.title}
                      </div>
                      <div className="text-white/40 text-[10px]">{style.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[1px] w-5 bg-[#6C63FF]" />
                  <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                    SKIN TONE
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  {skinTones.map((tone, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSkinTone(idx)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        skinTone === idx ? 'ring-2 ring-[#6C63FF] ring-offset-2 ring-offset-[#0B0B17]' : ''
                      }`}
                      style={{ background: tone.color }}
                    />
                  ))}
                </div>
                <p className="text-white/40 text-xs">{skinTones[skinTone].label}</p>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center gap-4">
              <div className="w-full max-w-md h-96 rounded-2xl border border-white/[0.07] flex items-center justify-center" style={{ background: '#11111A' }}>
                <div className="text-center">
                  <div className="w-32 h-48 mx-auto rounded-lg bg-gradient-to-b from-white/10 to-white/5 mb-3 blur-sm" />
                  <p className="text-white/20 text-sm">Preview generates after settings</p>
                </div>
              </div>
              <div className="w-full max-w-md rounded-xl border border-white/[0.07] p-4" style={{ background: '#11111A' }}>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
                    <span className="text-white/50">Product Type:</span>
                    <span className="text-white">Wearable</span>
                    <Check className="w-3 h-3 text-[#22C55E] ml-auto" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
                    <span className="text-white/50">Shot Style:</span>
                    <span className="text-white">Model Showcase</span>
                    <Check className="w-3 h-3 text-[#22C55E] ml-auto" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#22C55E]" />
                    <span className="text-white/50">Age Range:</span>
                    <span className="text-white">Young Adult</span>
                    <Check className="w-3 h-3 text-[#22C55E] ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 5: Generate (or skip to step 5 if step 4 not needed) */}
        {(currentStep === 5 || (currentStep === 4 && !shouldShowStep4)) && (
          <>
            <div className="w-[320px] p-6 overflow-y-auto" style={{ background: '#0B0B17' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[1px] w-5 bg-[#6C63FF]" />
                <span className="text-[#6C63FF] uppercase tracking-[2px]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 500 }}>
                  STEP 05 — FINAL SETTINGS
                </span>
              </div>
              <h2 className="mb-2" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '22px', letterSpacing: '-1px' }}>
                How many shots?
              </h2>
              <p className="text-white/50 mb-6 text-sm">
                Each image uses a unique AI-generated scene prompt.
              </p>

              {/* Number Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <button
                    onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-white" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '36px' }}>
                    {imageCount}
                  </div>
                  <button
                    onClick={() => setImageCount(Math.min(10, imageCount + 1))}
                    className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white/40 text-xs text-center">
                  {imageCount} unique scene{imageCount !== 1 ? 's' : ''} will be generated
                </p>
              </div>

              <div className="h-px bg-white/[0.06] my-6" />

              {/* Summary Card */}
              <div className="rounded-xl border border-[#6C63FF]/15 p-4 mb-6" style={{ background: 'rgba(108,99,255,0.05)' }}>
                <h3 className="text-white/70 mb-3 text-sm" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
                  Your Generation Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Product Type:</span>
                    <span className="text-white">{productTypes.find(t => t.id === productType)?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Shot Style:</span>
                    <span className="text-white">{shotStyles.find(s => s.id === shotStyle)?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Model:</span>
                    <span className="text-white">None</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Images:</span>
                    <span className="text-white">{imageCount}</span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button className="w-full h-[52px] rounded-lg bg-[#6C63FF] flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(108,99,255,0.4)] hover:bg-[#4B44CC] transition-colors">
                <Sparkles className="w-[18px] h-[18px]" />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '15px' }}>
                  Generate Product Shots
                </span>
              </button>
              <p className="text-white/30 text-xs text-center mt-2">
                Estimated time: ~30 seconds
              </p>
            </div>

            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className="w-[180px] h-[180px] rounded-xl border border-white/[0.07] relative overflow-hidden"
                    style={{ background: '#11111A' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#11111A] via-[#1A1A2E] to-[#11111A] animate-pulse" />
                    <div className="absolute top-2 left-2 text-white/20 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {String(num).padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between w-full max-w-[380px]">
                <span className="text-white/30 text-xs">Waiting to generate...</span>
                <div className="w-2 h-2 rounded-full bg-[#6C63FF]" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="h-16 border-t border-white/[0.07] px-6 flex items-center justify-between" style={{ background: '#0B0B17' }}>
        <button
          onClick={() => {
            if (currentStep === 4 && !shouldShowStep4) {
              setCurrentStep(3);
            } else if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            }
          }}
          disabled={currentStep === 1}
          className={`h-11 px-6 rounded-lg border flex items-center gap-2 transition-colors ${
            currentStep === 1
              ? 'border-white/5 text-white/20 cursor-not-allowed'
              : 'border-white/15 text-white/70 hover:bg-white/5'
          }`}
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {(currentStep < 5 && !(currentStep === 4 && !shouldShowStep4)) && (
          <button
            onClick={() => {
              if (currentStep === 3 && !shouldShowStep4) {
                setCurrentStep(5);
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="h-11 px-6 rounded-lg bg-[#6C63FF] flex items-center gap-2 shadow-[0_8px_24px_rgba(108,99,255,0.3)] hover:bg-[#4B44CC] transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px' }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
