import { useEffect, useState } from 'react';
import { FileText, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Loader2, ChevronDown, Copy, AlertCircle, RotateCcw, Layout, Video } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { anthropicService, ContentStrategyRequest } from '../services/anthropic.service';
import { CopyVariant } from '../services/fal.service';

// Survey Questions Configuration
const SURVEY_STEPS = [
  {
    id: 'product_analysis',
    title: 'Product Analysis',
    description: 'Upload your product image for AI analysis'
  },
  {
    id: 'target_audience',
    title: 'Target Audience',
    description: 'Who is this product for?'
  },
  {
    id: 'messaging_angle',
    title: 'Messaging Angle',
    description: 'What\'s your main selling approach?'
  },
  {
    id: 'campaign_duration',
    title: 'Campaign Duration',
    description: 'Content calendar timeline?'
  },
  {
    id: 'platform_selection',
    title: 'Platform Selection',
    description: 'Where will you promote?'
  },
  {
    id: 'price_point',
    title: 'Price Point',
    description: 'Product pricing strategy'
  },
  {
    id: 'landing_page',
    title: 'Landing Page',
    description: 'Need landing page content?'
  },
  {
    id: 'video_content',
    title: 'Video Content',
    description: 'Video scripts & hooks?'
  },
  {
    id: 'brand_voice',
    title: 'Brand Voice',
    description: 'Tone & personality'
  }
];

const ANALYSIS_MODELS = [
  { 
    id: 'gemini-3-pro', 
    label: 'Gemini 3 Pro — Vision Specialist', 
    description: 'Best for deep product image analysis and brand aesthetic detection.' 
  },
  { 
    id: 'kimi-k2.5-thinking', 
    label: 'Kimi k2.5 Thinking — Logic Engine', 
    description: 'Superior at mapping complex marketing angles and psychological triggers.' 
  },
  { 
    id: 'claude-opus-4-20250514-thinking-16k', 
    label: 'Claude 4 Opus — Creative Strategist', 
    description: 'The gold standard for high-converting copy and emotional resonance.' 
  }
];

const AUDIENCES = [
  { id: 'homeowners', label: 'Homeowners (30-50 years)', suggested: false },
  { id: 'renters', label: 'Apartment Renters (25-40 years)', suggested: true },
  { id: 'small_space', label: 'Small Space Dwellers', suggested: true },
  { id: 'diy', label: 'DIY Enthusiasts', suggested: false },
  { id: 'design_lovers', label: 'Interior Design Lovers', suggested: false },
  { id: 'parents', label: 'Parents with Kids', suggested: false },
  { id: 'eco_conscious', label: 'Eco-conscious Consumers', suggested: false }
];

const MESSAGING_ANGLES = [
  {
    id: 'pain_killer',
    label: 'Pain-Killer',
    tagline: '"Tired of cluttered bathrooms?"',
    description: 'Focus: Solving problems',
    color: '#EF4444'
  },
  {
    id: 'dream_state',
    label: 'Dream-State',
    tagline: '"Imagine a spa-like organized space"',
    description: 'Focus: Aspiration & lifestyle',
    color: '#22C55E'
  },
  {
    id: 'pattern_interrupt',
    label: 'Pattern Interrupt',
    tagline: '"Stop wasting money on cheap shelves"',
    description: 'Focus: Shocking truth / curiosity',
    color: '#6C63FF'
  },
  {
    id: 'authority',
    label: 'Authority',
    tagline: '"Used by 10k+ homeowners"',
    description: 'Focus: Social proof & trust',
    color: '#8892B0'
  },
  {
    id: 'direct_benefit',
    label: 'Direct Benefit',
    tagline: '"Waterproof, stylish, installs in 5min"',
    description: 'Focus: Clear value proposition',
    color: '#3B82F6'
  }
];

const CAMPAIGN_DURATIONS = [
  {
    id: '7',
    label: '7-Day Sprint',
    description: 'Quick product launch',
    deliverables: '→ 7 posts, 3 ad variants'
  },
  {
    id: '15',
    label: '15-Day Campaign',
    description: 'Balanced promo push',
    deliverables: '→ 15 posts, 5 ad variants, 2 videos'
  },
  {
    id: '30',
    label: '30-Day Strategy',
    description: 'Full content ecosystem',
    deliverables: '→ 30 posts, 10 ads, 5 videos'
  }
];

const PLATFORMS = [
  {
    id: 'facebook',
    label: 'Facebook/Meta Ads',
    bestFor: 'Homeowners 30-55',
    format: 'Image + carousel ads'
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    bestFor: 'Younger audience 18-35',
    format: 'Short video hooks + demos'
  },
  {
    id: 'youtube',
    label: 'YouTube',
    bestFor: 'Tutorial seekers',
    format: 'Product reviews, how-tos'
  },
  {
    id: 'instagram',
    label: 'Instagram',
    bestFor: 'Visual/lifestyle brands',
    format: 'Reels + Stories'
  }
];

const PRICE_TIERS = [
  { id: 'budget', label: 'Budget ($10 - $30)', messaging: '"Affordable upgrade"', range: [10, 30] },
  { id: 'mid', label: 'Mid-Range ($30 - $80)', messaging: '"Quality investment"', range: [30, 80] },
  { id: 'premium', label: 'Premium ($80+)', messaging: '"Luxury solution"', range: [80, 999] }
];

const VIDEO_TYPES = [
  { id: 'demo', label: 'Product Demo Script', description: '(15-30 sec TikTok/Reel style)' },
  { id: 'hooks', label: 'Video Hooks (10 variations)', description: 'First 3 seconds that stop scrolling' },
  { id: 'tutorial', label: 'Tutorial/How-to Script', description: '(Installation guide, 2-5 min)' },
  { id: 'testimonial', label: 'Customer Testimonial Template', description: '(Questions to ask reviewers)' },
  { id: 'youtube', label: 'YouTube Review Script', description: '(Long-form 5-10 min)' }
];

const BRAND_VOICES = [
  { id: 'professional', label: 'Professional & Trustworthy', example: '"Engineered for modern homes"' },
  { id: 'friendly', label: 'Friendly & Conversational', example: '"Finally, a shelf that gets it"' },
  { id: 'bold', label: 'Bold & Edgy', example: '"Bathroom chaos? Not anymore."' },
  { id: 'luxurious', label: 'Luxurious & Aspirational', example: '"Elevate your daily ritual"' },
  { id: 'playful', label: 'Fun & Playful', example: '"Marie Kondo approved! ✨"' }
];

export function AdCopyScreen() {
  const { setRightPanelContent } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisModel, setAnalysisModel] = useState('gemini-3-pro');

  // Generation results
  const [generatedVariants, setGeneratedVariants] = useState<CopyVariant[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Survey Data
  const [productImage, setProductImage] = useState<File | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedAngles, setSelectedAngles] = useState<string[]>(['pain_killer']);
  const [campaignDuration, setCampaignDuration] = useState('15');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'tiktok']);
  const [priceTier, setPriceTier] = useState('mid');
  const [exactPrice, setExactPrice] = useState('');
  const [needsLandingPage, setNeedsLandingPage] = useState(true);
  const [needsVideo, setNeedsVideo] = useState(true);
  const [selectedVideoTypes, setSelectedVideoTypes] = useState<string[]>(['demo', 'hooks']);
  const [brandVoice, setBrandVoice] = useState('friendly');

  useEffect(() => {
    setRightPanelContent(null);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setIsAnalyzing(true);
      setAiAnalysis(null);

      try {
        // Step 1: Upload to Fal Storage
        const base64 = await fileToBase64(file);
        const uploadRes = await window.api.fal.uploadImage(base64, file.name, file.type);

        if (uploadRes.error || !uploadRes.url) {
          throw new Error(uploadRes.error || 'Upload failed');
        }

        const imageUrl = uploadRes.url;
        setStatusMessage('🔍 Analyzing product imagery...');

        // Step 2: Vision Analysis via specialized Gemini 3 Pro prompt
        const analysisPrompt = `
          Analyze this product image. Provide a JSON response with:
          {
            "product": "Specific product name",
            "material": "Primary materials identified",
            "category": "Main classification",
            "features": ["Feature 1", "Feature 2", "Feature 3"],
            "vibe": "Describe the aesthetic/vibe (e.g. minimalist, luxury, rugged, playful)"
          }
          Output ONLY valid JSON.
        `;

        const rawAnalysis = await anthropicService.analyzeProductImage(imageUrl, analysisPrompt);
        
        // Extract JSON from potential chatter
        let jsonStr = rawAnalysis.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }

        const parsed = JSON.parse(jsonStr);
        setAiAnalysis(parsed);
        setStatusMessage('✅ Analysis complete');
      } catch (err: any) {
        console.error('Image analysis failed:', err);
        setStatusMessage('❌ Analysis failed. Please enter details manually.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const toggleSelection = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return aiAnalysis !== null;
      case 1: return selectedAudiences.length > 0;
      case 2: return selectedAngles.length > 0;
      case 3: return campaignDuration !== '';
      case 4: return selectedPlatforms.length > 0;
      case 5: return priceTier !== '' || exactPrice !== '';
      case 6: return true;
      case 7: return !needsVideo || selectedVideoTypes.length > 0;
      case 8: return brandVoice !== '';
      default: return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setStatusMessage('Building your content strategy...');

    try {
      const request: ContentStrategyRequest = {
        productAnalysis: aiAnalysis || {
          product: 'Product',
          material: 'Unknown',
          category: 'General',
          features: ['Quality product']
        },
        selectedAudiences,
        selectedAngles,
        campaignDuration,
        selectedPlatforms,
        priceTier,
        exactPrice,
        needsLandingPage,
        needsVideo,
        selectedVideoTypes,
        brandVoice,
        analysisModelId: analysisModel
      };

      setStatusMessage('🤖 AI is thinking... Generating variants...');
      const result = await anthropicService.generateContentStrategy(request);

      setGeneratedVariants(result.variants);
      setShowResults(true);
      setStatusMessage(`✅ Generated ${result.variants.length} variants`);

      // Persist each variant to database (fire-and-forget, non-critical)
      for (const variant of result.variants) {
        try {
          await window.api.database.saveCopyVariant({
            campaign_id: null,
            variant_type: variant.variantType,
            platform: selectedPlatforms.join(', '),
            headline1: variant.headline1,
            headline2: variant.headline2,
            headline3: variant.headline3,
            hook: variant.hook,
            body_copy: variant.bodyCopy,
            cta: variant.cta,
            tone: brandVoice,
            triggers_used: variant.triggersUsed,
            landing_page_part: variant.landingPagePart,
            video_scripts: variant.videoScripts
          });
        } catch {
          // Non-critical: don't block on save failure
        }
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerationError(err.message || 'Generation failed. Please try again.');
      setStatusMessage('');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (variant: CopyVariant) => {
    const text = [
      `[Variant: ${variant.variantType}]`,
      `Headline 1: ${variant.headline1}`,
      `Headline 2: ${variant.headline2}`,
      `Headline 3: ${variant.headline3}`,
      `Hook: ${variant.hook}`,
      variant.bodyCopy,
      `CTA: ${variant.cta}`,
      `Triggers: ${variant.triggersUsed}`
    ].join('\n');
    navigator.clipboard.writeText(text);
    setStatusMessage('📋 Copied to clipboard!');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleStartOver = () => {
    setShowResults(false);
    setGeneratedVariants([]);
    setGenerationError(null);
    setCurrentStep(0);
    setStatusMessage('');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepContainer>
            <StepTitle>Product Strategy & Analysis</StepTitle>
            <StepDescription>Choose your AI Strategist and upload your product images.</StepDescription>

            {/* Model Selection */}
            <div style={{ marginTop: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  color: 'rgba(255,255,255,0.4)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px'
                }}>
                  AI Strategist Model
                </label>
                <span style={{ 
                  fontSize: 10, 
                  background: 'rgba(108, 99, 255, 0.2)', 
                  color: 'var(--ma-accent)', 
                  padding: '2px 6px', 
                  borderRadius: 4,
                  fontWeight: 700
                }}>
                  THINKING ENABLED
                </span>
              </div>
              
              <div style={{ position: 'relative' }}>
                <select
                  value={analysisModel}
                  onChange={(e) => setAnalysisModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    background: 'var(--ma-elevated)',
                    border: '1px solid var(--ma-border)',
                    borderRadius: 8,
                    color: '#FFF',
                    fontSize: 14,
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {ANALYSIS_MODELS.map(model => (
                    <option key={model.id} value={model.id} style={{ background: '#1A1A1A' }}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ 
                  position: 'absolute', 
                  right: 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.3)', 
                  pointerEvents: 'none' 
                }} />
              </div>
              
              <div style={{ 
                marginTop: 10, 
                padding: '10px 12px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: 6,
                borderLeft: '2px solid var(--ma-accent)' 
              }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>
                   {ANALYSIS_MODELS.find(m => m.id === analysisModel)?.description}
                </p>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              id="product-image-upload"
            />

            <label
              htmlFor="product-image-upload"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 240,
                border: '2px dashed var(--ma-border)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginTop: 24
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--ma-accent)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--ma-border)'}
            >
              {!productImage && !isAnalyzing && (
                <>
                  <Sparkles size={32} color="var(--ma-accent)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Click to upload or drag & drop</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>PNG, JPG up to 10MB</p>
                </>
              )}

              {isAnalyzing && (
                <>
                  <Loader2 size={32} color="var(--ma-accent)" style={{ marginBottom: 12, animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>🤖 AI Analysis in progress...</p>
                </>
              )}

              {aiAnalysis && (
                <div style={{ textAlign: 'left', width: '100%', padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CheckCircle2 size={20} color="var(--ma-green)" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ma-green)' }}>Analysis Complete</span>
                  </div>
                  <AnalysisRow label="Detected" value={aiAnalysis.product} />
                  <AnalysisRow label="Material" value={aiAnalysis.material} />
                  <AnalysisRow label="Category" value={aiAnalysis.category} />
                  <AnalysisRow label="Key Features" value={aiAnalysis.features.join(', ')} />
                </div>
              )}
            </label>
          </StepContainer>
        );

      case 1:
        return (
          <StepContainer>
            <StepTitle>Who is this product for?</StepTitle>
            <StepDescription>Select all that apply</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {AUDIENCES.map(aud => (
                <SelectableCard
                  key={aud.id}
                  selected={selectedAudiences.includes(aud.id)}
                  onClick={() => toggleSelection(aud.id, selectedAudiences, setSelectedAudiences)}
                  suggested={aud.suggested}
                >
                  {aud.label}
                </SelectableCard>
              ))}
            </div>

            {AUDIENCES.some(a => a.suggested) && (
              <div style={{
                marginTop: 20,
                padding: 16,
                background: 'rgba(108,99,255,0.1)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 12, color: 'var(--ma-accent)', fontWeight: 600, marginBottom: 4 }}>
                  💡 AI Suggestion
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                  Based on "bathroom storage + PVC foam", we recommend targeting Apartment Renters (damage-free installation) and Small Space Dwellers (compact solution).
                </div>
              </div>
            )}
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer>
            <StepTitle>What's your main selling angle?</StepTitle>
            <StepDescription>Choose 1-3 messaging frameworks</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {MESSAGING_ANGLES.map(angle => (
                <AngleCard
                  key={angle.id}
                  selected={selectedAngles.includes(angle.id)}
                  onClick={() => toggleSelection(angle.id, selectedAngles, setSelectedAngles)}
                  color={angle.color}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{angle.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 8 }}>
                    {angle.tagline}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{angle.description}</div>
                </AngleCard>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center'
            }}>
              💡 Pro Tip: Mix 2 angles for best results
            </div>
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer>
            <StepTitle>Content calendar timeline?</StepTitle>
            <StepDescription>Choose your campaign duration</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {CAMPAIGN_DURATIONS.map(duration => (
                <DurationCard
                  key={duration.id}
                  selected={campaignDuration === duration.id}
                  onClick={() => setCampaignDuration(duration.id)}
                >
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{duration.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                    {duration.description}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{duration.deliverables}</div>
                </DurationCard>
              ))}
            </div>
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer>
            <StepTitle>Where will you promote?</StepTitle>
            <StepDescription>Select your marketing channels</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PLATFORMS.map(platform => (
                <PlatformCard
                  key={platform.id}
                  selected={selectedPlatforms.includes(platform.id)}
                  onClick={() => toggleSelection(platform.id, selectedPlatforms, setSelectedPlatforms)}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{platform.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                    Best for: {platform.bestFor}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    Format: {platform.format}
                  </div>
                </PlatformCard>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: 12,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center'
            }}>
              💡 Recommendation: Start with Meta + TikTok for max reach
            </div>
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer>
            <StepTitle>Product pricing?</StepTitle>
            <StepDescription>This helps AI craft value-based copy</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {PRICE_TIERS.map(tier => (
                <PriceTierCard
                  key={tier.id}
                  selected={priceTier === tier.id}
                  onClick={() => setPriceTier(tier.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{tier.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    Messaging: {tier.messaging}
                  </div>
                </PriceTierCard>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                Or enter exact price:
              </label>
              <input
                type="text"
                value={exactPrice}
                onChange={e => setExactPrice(e.target.value)}
                placeholder="$ 49.99"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--ma-elevated)',
                  border: '1px solid var(--ma-border)',
                  borderRadius: 8,
                  color: '#FFF',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer>
            <StepTitle>Do you need landing page content?</StepTitle>
            <StepDescription>Complete page copy optimized for conversions</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BinaryCard selected={needsLandingPage} onClick={() => setNeedsLandingPage(true)}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>✓ Yes, generate complete page copy</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Includes:</div>
                <ul style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, paddingLeft: 20 }}>
                  <li>Hero headline</li>
                  <li>Product description</li>
                  <li>Feature/benefit sections</li>
                  <li>FAQ content</li>
                  <li>SEO meta tags</li>
                </ul>
              </BinaryCard>

              <BinaryCard selected={!needsLandingPage} onClick={() => setNeedsLandingPage(false)}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>✗ No, I already have a page</div>
              </BinaryCard>
            </div>
          </StepContainer>
        );

      case 7:
        return (
          <StepContainer>
            <StepTitle>Need video content scripts?</StepTitle>
            <StepDescription>Scripts, hooks, and video strategies</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <BinaryCard selected={needsVideo} onClick={() => setNeedsVideo(true)}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>✓ Yes, I'll create video content</div>

                {needsVideo && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                      What types? (Select all that apply)
                    </div>
                    {VIDEO_TYPES.map(type => (
                      <VideoTypeCheckbox
                        key={type.id}
                        selected={selectedVideoTypes.includes(type.id)}
                        onClick={() => toggleSelection(type.id, selectedVideoTypes, setSelectedVideoTypes)}
                      >
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{type.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                          {type.description}
                        </div>
                      </VideoTypeCheckbox>
                    ))}
                  </div>
                )}
              </BinaryCard>

              <BinaryCard selected={!needsVideo} onClick={() => setNeedsVideo(false)}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>✗ No video content needed</div>
              </BinaryCard>
            </div>
          </StepContainer>
        );

      case 8:
        return (
          <StepContainer>
            <StepTitle>Brand voice & tone?</StepTitle>
            <StepDescription>How should we speak to your audience?</StepDescription>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {BRAND_VOICES.map(voice => (
                <VoiceCard
                  key={voice.id}
                  selected={brandVoice === voice.id}
                  onClick={() => setBrandVoice(voice.id)}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{voice.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                    {voice.example}
                  </div>
                </VoiceCard>
              ))}
            </div>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  if (isGenerating) {
    const selectedModel = ANALYSIS_MODELS.find(m => m.id === analysisModel);
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)'
      }}>
        <Loader2 size={48} color="var(--ma-accent)" style={{ marginBottom: 24, animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFF', marginBottom: 8 }}>
          🚀 Generating Your Content Strategy
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          {statusMessage || 'This will take 45-60 seconds...'}
        </p>
        <div style={{
          padding: '8px 16px',
          background: 'rgba(108,99,255,0.1)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--ma-accent)'
        }}>
          Model: {selectedModel?.label || analysisModel}
        </div>
      </div>
    );
  }

  // === RESULTS VIEW ===
  if (showResults && generatedVariants.length > 0) {
    return (
      <div style={{
        padding: '32px 36px',
        fontFamily: 'var(--font-body)',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Results Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ma-green)'
            }}>
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>
                Content Strategy Results
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                {generatedVariants.length} variant{generatedVariants.length !== 1 ? 's' : ''} generated
                {statusMessage && ` — ${statusMessage}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleStartOver}
            style={{
              padding: '10px 20px', background: 'transparent', border: '1px solid var(--ma-border)',
              borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <RotateCcw size={14} /> New Strategy
          </button>
        </div>

        {/* Variants Grid */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {generatedVariants.map((variant, idx) => {
            const angleConfig = MESSAGING_ANGLES.find(a => a.id === variant.variantType);
            const accentColor = angleConfig?.color || 'var(--ma-accent)';

            return (
              <div key={idx} style={{
                background: 'var(--ma-card)', border: '1px solid var(--ma-border)',
                borderRadius: 14, padding: 28, position: 'relative',
                borderLeft: `3px solid ${accentColor}`
              }}>
                {/* Variant Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                      background: `${accentColor}22`, color: accentColor, padding: '4px 10px', borderRadius: 6
                    }}>
                      {angleConfig?.label || variant.variantType}
                    </span>
                    {variant.triggersUsed && (
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        Triggers: {variant.triggersUsed}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(variant)}
                    style={{
                      padding: '6px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ma-border)',
                      borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#FFF' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>

                {/* Headlines */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Headlines</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF', marginBottom: 6, lineHeight: 1.3 }}>{variant.headline1}</div>
                  {variant.headline2 && <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{variant.headline2}</div>}
                  {variant.headline3 && <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{variant.headline3}</div>}
                </div>

                {/* Hook */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Hook</div>
                  <div style={{
                    padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    borderLeft: `2px solid ${accentColor}`, fontSize: 14, color: 'rgba(255,255,255,0.8)',
                    fontStyle: 'italic', lineHeight: 1.5
                  }}>
                    "{variant.hook}"
                  </div>
                </div>

                {/* Body Copy */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Body Copy</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>
                    {variant.bodyCopy}
                  </div>
                </div>

                {/* Landing Page Part (If present) */}
                {variant.landingPagePart && (
                  <div style={{ 
                    marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      fontSize: 11, color: 'var(--ma-accent)', fontWeight: 700, 
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <Layout size={12} /> Landing Page Content
                    </div>
                    <div style={{ 
                      fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, 
                      background: 'rgba(108,99,255,0.03)', padding: 16, borderRadius: 8,
                      border: '1px solid rgba(108,99,255,0.1)'
                    }}>
                      {variant.landingPagePart}
                    </div>
                  </div>
                )}

                {/* Video Scripts (If present) */}
                {variant.videoScripts && (
                  <div style={{ 
                    marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: 16
                  }}>
                    <div style={{ 
                      fontSize: 11, color: 'var(--ma-pink)', fontWeight: 700, 
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <Video size={12} /> Video hooks & Script
                    </div>
                    <div style={{ 
                      fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, 
                      background: 'rgba(236,72,153,0.03)', padding: 16, borderRadius: 8,
                      border: '1px solid rgba(236,72,153,0.1)'
                    }}>
                      {variant.videoScripts}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Call to Action</div>
                  <div style={{
                    display: 'inline-block', padding: '10px 24px',
                    background: `${accentColor}22`, border: `1px solid ${accentColor}`,
                    borderRadius: 8, fontSize: 14, fontWeight: 600, color: accentColor
                  }}>
                    {variant.cta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        `}</style>
      </div>
    );
  }

  // === ERROR VIEW ===
  if (generationError) {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'var(--font-body)', padding: 40
      }}>
        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: 20 }} />
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FFF', marginBottom: 12 }}>Generation Failed</h2>
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center',
          maxWidth: 480, lineHeight: 1.6, marginBottom: 24
        }}>
          {generationError}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { setGenerationError(null); handleGenerate(); }}
            style={{
              padding: '12px 28px', background: 'var(--ma-accent)', border: 'none', borderRadius: 8,
              color: '#FFF', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <RotateCcw size={14} /> Retry
          </button>
          <button
            onClick={handleStartOver}
            style={{
              padding: '12px 28px', background: 'transparent', border: '1px solid var(--ma-border)',
              borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '32px 36px',
      fontFamily: 'var(--font-body)',
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexShrink: 0 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ma-accent)',
        }}>
          <FileText size={16} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: '#FFF',
          margin: 0
        }}>
          Content Strategy Builder
        </h1>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 32, flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          {SURVEY_STEPS.map((step, idx) => (
            <div key={step.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: idx <= currentStep ? 'var(--ma-accent)' : 'var(--ma-elevated)',
                border: `2px solid ${idx <= currentStep ? 'var(--ma-accent)' : 'var(--ma-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                color: idx <= currentStep ? '#FFF' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s'
              }}>
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              {idx < SURVEY_STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: 2,
                  background: idx < currentStep ? 'var(--ma-accent)' : 'var(--ma-border)',
                  marginLeft: 8,
                  transition: 'all 0.3s'
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Step {currentStep + 1} of {SURVEY_STEPS.length}: {SURVEY_STEPS[currentStep].title}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 680,
          background: 'var(--ma-card)',
          border: '1px solid var(--ma-border)',
          borderRadius: 16,
          padding: 40,
          overflowY: 'auto',
          maxHeight: '100%'
        }}>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        flexShrink: 0
      }}>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid var(--ma-border)',
            borderRadius: 8,
            color: currentStep === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            fontSize: 14,
            fontWeight: 500,
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {currentStep < SURVEY_STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            style={{
              padding: '12px 32px',
              background: canProceed() ? 'var(--ma-accent)' : 'rgba(108,99,255,0.3)',
              border: 'none',
              borderRadius: 8,
              color: '#FFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canProceed()}
            style={{
              padding: '14px 36px',
              background: canProceed() ? 'var(--ma-green)' : 'rgba(34,197,94,0.3)',
              border: 'none',
              borderRadius: 8,
              color: canProceed() ? '#000' : 'rgba(0,0,0,0.4)',
              fontSize: 15,
              fontWeight: 700,
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={18} /> Generate My Content Strategy
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

// Reusable Components
function StepContainer({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: 300 }}>{children}</div>;
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 24,
      fontWeight: 700,
      color: '#FFF',
      marginBottom: 8,
      fontFamily: 'var(--font-display)'
    }}>
      {children}
    </h2>
  );
}

function StepDescription({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 14,
      color: 'rgba(255,255,255,0.5)',
      marginBottom: 0
    }}>
      {children}
    </p>
  );
}

function AnalysisRow({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ marginBottom: 10, display: 'flex', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', minWidth: 100 }}>✓ {label}:</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SelectableCard({ children, selected, onClick, suggested = false }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 18px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '1px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: 14,
        color: selected ? '#FFF' : 'rgba(255,255,255,0.7)',
        fontWeight: selected ? 500 : 400,
        transition: 'all 0.2s',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}
    >
      <div style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `2px solid ${selected ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)'}`,
        background: selected ? 'var(--ma-accent)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {selected && <span style={{ color: '#FFF', fontSize: 12 }}>✓</span>}
      </div>
      <span style={{ flex: 1 }}>{children}</span>
      {suggested && (
        <span style={{
          fontSize: 10,
          background: 'rgba(108,99,255,0.3)',
          color: 'var(--ma-accent)',
          padding: '2px 8px',
          borderRadius: 4,
          fontWeight: 600
        }}>
          AI Pick
        </span>
      )}
    </button>
  );
}

function AngleCard({ children, selected, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px',
        textAlign: 'left',
        background: selected ? `${color}15` : 'var(--ma-elevated)',
        border: '2px solid',
        borderColor: selected ? color : 'var(--ma-border)',
        borderRadius: 12,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700
        }}>
          ✓
        </div>
      )}
      {children}
    </button>
  );
}

function DurationCard({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '18px 22px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '2px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 12,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}

function PlatformCard({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '1px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 10,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: `2px solid ${selected ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)'}`,
        background: selected ? 'var(--ma-accent)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2
      }}>
        {selected && <span style={{ color: '#FFF', fontSize: 12 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </button>
  );
}

function PriceTierCard({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '2px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 10,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}

function BinaryCard({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '18px 22px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '2px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 12,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}

function VideoTypeCheckbox({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 14px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.1)' : 'transparent',
        border: '1px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s',
        marginBottom: 10,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }}
    >
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        border: `2px solid ${selected ? 'var(--ma-accent)' : 'rgba(255,255,255,0.2)'}`,
        background: selected ? 'var(--ma-accent)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2
      }}>
        {selected && <span style={{ color: '#FFF', fontSize: 10 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </button>
  );
}

function VoiceCard({ children, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px 20px',
        textAlign: 'left',
        background: selected ? 'rgba(108,99,255,0.15)' : 'var(--ma-elevated)',
        border: '2px solid',
        borderColor: selected ? 'var(--ma-accent)' : 'var(--ma-border)',
        borderRadius: 10,
        cursor: 'pointer',
        color: '#FFF',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );
}