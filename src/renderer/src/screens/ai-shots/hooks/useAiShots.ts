import { useState, useCallback, useMemo } from 'react'
import { resolveImageInput } from '../../image-gen/utils/resolveImageInput'
import { SHOT_STYLES } from '../data/templates'
import { MODEL_TEMPLATES } from '../data/model-templates'
import { ModelTemplate } from '../components/ModelTypeSelector'
import { assembleSystemPrompt } from '../prompts'
import { generateProductShots as runProductShotsService } from '../../../services/productShotsService'
import { estimateNanoBananaCost } from '../../image-gen/utils/estimateNanoBananaCost'

const ENDPOINT_MAP: Record<string, string> = {
  'Nano Banana': 'fal-ai/nano-banana/edit',
  'Nano Banana 2': 'fal-ai/nano-banana-2/edit',
  'Nano Banana Pro': 'fal-ai/nano-banana-pro/edit',
  'GPT Image 2': 'openai/gpt-image-2/edit'
}

const mapUiStyleToPromptStyle = (style: string): 'studio' | 'lifestyle' | 'macro' | 'flatlay' | 'packaging' | 'cinematic' | 'auto' | 'mixed' => {
  if (style === 'flat-lay') return 'flatlay'
  return style as any
}

export const useAiShots = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [productType, setProductType] = useState<string>('wearable')
  const [shotStyle, setShotStyle] = useState<string>('studio') // Pre-selected 'studio' by default!
  
  // Custom Product Inputs for Prompt Assembly
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')

  // Demographic / Customize Sliders
  const [ageRange, setAgeRange] = useState('young-adult')
  const [modelStyle, setModelStyle] = useState('everyday')
  const [skinTone, setSkinTone] = useState(2)

  // VTON Model Selector Casting Type
  const [selectedModelType, setSelectedModelType] = useState<ModelTemplate | null>(null)

  // Global Config Selectors
  const [model, setModel] = useState('Nano Banana Pro') // Default set to 'Nano Banana Pro'!
  const [imageCount, setImageCount] = useState(4)
  const [resolution, setResolution] = useState('1K')
  const [aspectRatio, setAspectRatio] = useState('1:1')

  // Multiple image upload states
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  
  const [statusText, setStatusText] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedOutput, setSelectedOutput] = useState(0)

  // Step 4 is conditional: shown when Wearable OR when (Beauty + Model Showcase) is selected.
  const shouldShowStep4 = 
    productType === 'wearable' || 
    (productType === 'beauty' && shotStyle === 'model')

  const estimatedCost = useMemo(() => {
    if (model === 'GPT Image 2') {
      return (0.04 * imageCount).toFixed(3)
    }
    return estimateNanoBananaCost({
      model,
      resolution,
      numOutputs: imageCount,
      webSearch: false,
      thinkingLevel: 'minimal'
    })
  }, [model, resolution, imageCount])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newImages: string[] = []
      let loadedCount = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          newImages.push(result)
          loadedCount++

          if (loadedCount === files.length) {
            setUploadedImages((prev) => [...prev, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleDeleteImage = useCallback((indexToDelete: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== indexToDelete)
      
      setActiveImageIndex((prevIdx) => {
        if (updated.length === 0) return 0
        if (prevIdx >= updated.length) return updated.length - 1
        return prevIdx
      })
      return updated
    })
  }, [])

  const generateProductShots = useCallback(async () => {
    if (uploadedImages.length === 0) {
      alert('Please upload at least one product photo.')
      return
    }

    try {
      setGenerating(true)
      setGenerated(false)
      setGeneratedImages([])
      setStatusText(`Uploading ${uploadedImages.length} photos to secure CDN...`)

      // 1. Resolve CDN URLs for all uploaded images
      const hostedUrls = (
        await Promise.all(
          uploadedImages.map((img, i) => resolveImageInput(img, `AI-Shots-Input-${i + 1}`))
        )
      ).filter(Boolean) as string[]

      if (hostedUrls.length === 0) {
        throw new Error('Could not upload product photos. Please check your network connection.')
      }

      const activeEndpoint = ENDPOINT_MAP[model] || 'fal-ai/nano-banana-pro/edit'
      let genImages: string[] = []

      // ── BRANCH A: Fashion & Apparel (Wearable) Product Type ──────────
      if (productType === 'wearable') {
        if (!selectedModelType) {
          alert('Please go back to Step 4 and choose a casting model.')
          setCurrentStep(4)
          setGenerating(false)
          return
        }

        // Find shot style label/description for Vton Vibe
        const activeStyleObj = SHOT_STYLES.find((s) => s.id === shotStyle)
        const vibeDesc = activeStyleObj ? activeStyleObj.title : 'Studio'

        genImages = await runProductShotsService({
          productImage: hostedUrls,
          systemPrompt: '',
          numberOfImages: imageCount,
          imageModelEndpoint: activeEndpoint,
          aspectRatio,
          resolution,
          isVton: true,
          vibeDescription: vibeDesc,
          modelType: selectedModelType,
          onProgress: (msg) => setStatusText(msg)
        })
      } 
      // ── BRANCH B: Other Product Types (General Product) ──────────
      else {
        const mappedStyle = mapUiStyleToPromptStyle(shotStyle)

        const systemPrompt = assembleSystemPrompt('general', mappedStyle, imageCount)

        genImages = await runProductShotsService({
          productImage: hostedUrls[0], // first uploaded image as reference
          systemPrompt,
          numberOfImages: imageCount,
          imageModelEndpoint: activeEndpoint,
          aspectRatio,
          resolution,
          isVton: false,
          onProgress: (msg) => setStatusText(msg)
        })
      }

      if (genImages.length === 0) {
        throw new Error('All image generations failed. Please try again.')
      }

      // Save each generated image to SQLite database
      for (const url of genImages) {
        try {
          await window.api.database.saveImage({
            local_path: url,
            prompt: `AI Product Shot: ${productType} | ${shotStyle}`,
            model: model || 'Nano Banana Pro',
            format: aspectRatio || '1:1',
            width: 1024,
            height: 1024,
            fal_request_id: ''
          })
        } catch (dbErr) {
          console.error('Failed to save to database:', dbErr)
        }
      }

      setGeneratedImages(genImages)
      setGenerated(true)
      setSelectedOutput(0)
    } catch (err: unknown) {
      console.error(err)
      alert(`AI Product Shots Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
      setStatusText('')
    }
  }, [
    uploadedImages,
    productType,
    shotStyle,
    model,
    imageCount,
    resolution,
    aspectRatio,
    selectedModelType
  ])

  return {
    currentStep,
    setCurrentStep,
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
    statusText,
    generating,
    generated,
    generatedImages,
    selectedOutput,
    setSelectedOutput,
    handleImageUpload,
    handleDeleteImage,
    shouldShowStep4,
    generateProductShots,
    estimatedCost,
    modelTemplates: MODEL_TEMPLATES
  }
}
