import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { falService } from '../../../services/fal.service'
import {
  MODEL_FALLBACK_PRICES,
  MODES,
  SAMPLE_OUTPUTS,
  NANO_BANANA_MODELS,
  PLATFORM_FORMATS,
  KONTEXT_RESIZE_PROMPT,
  RESIZE_MODELS
} from '../constants'
import { useImageGenPricing } from './useImageGenPricing'
import type { ActiveImageGenMode, NanoBananaThinkingLevel } from '../types'
import { buildNanoBananaPrompt } from '../utils/buildNanoBananaPrompt'
import { estimateNanoBananaCost } from '../utils/estimateNanoBananaCost'
import { resolveImageInput } from '../utils/resolveImageInput'
import { type ResizeCustomDimensions } from '../modes/ResizeForm'

export function useImageGen(activeMode: ActiveImageGenMode) {
  const navigate = useNavigate()
  const { modelPrices } = useImageGenPricing()

  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Photorealistic')
  const [ratio, setRatio] = useState('1:1')
  const [model, setModel] = useState('FLUX.1 Pro')
  const [numImages, setNumImages] = useState(4)

  const [nbReferenceImage, setNbReferenceImage] = useState<string | null>(null)
  const [nbAssetImages, setNbAssetImages] = useState<string[]>([])
  const [nbAdvancedOpen, setNbAdvancedOpen] = useState(false)
  const [nbRatio, setNbRatio] = useState('auto')
  const [nbResolution, setNbResolution] = useState('1K')
  const [nbOutputFormat, setNbOutputFormat] = useState('jpeg')
  const [nbNumOutputs, setNbNumOutputs] = useState(1)
  const [nbSeed, setNbSeed] = useState('')
  const [nbSafety, setNbSafety] = useState(3)
  const [nbWebSearch, setNbWebSearch] = useState(false)
  const [nbThinkingLevel, setNbThinkingLevel] = useState<NanoBananaThinkingLevel>('minimal')
  const [nbModel, setNbModel] = useState(NANO_BANANA_MODELS[0])
  const [nbLimitGen, setNbLimitGen] = useState(true)

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [selectedOutput, setSelectedOutput] = useState(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  // ── Resize state ──────────────────────────────────────────────────────────
  const [resizeFile, setResizeFile] = useState<File | null>(null)
  const [resizeSelectedFormats, setResizeSelectedFormats] = useState<string[]>([
    'instagram_post',
    'meta_story'
  ])
  const [resizeModel, setResizeModel] = useState('reframe')
  const [resizeCustomDimensions, setResizeCustomDimensions] = useState<ResizeCustomDimensions>({})

  const handleStepsComplete = useCallback(() => {
    setGenerating(false)
    setGenerated(true)
    setSelectedOutput(0)
  }, [])

  const handleModeChange = useCallback(
    (mode: (typeof MODES)[number]) => {
      navigate(mode.path)
    },
    [navigate]
  )

  const costPerImage = modelPrices[model] ?? MODEL_FALLBACK_PRICES[model] ?? 0.024
  const totalCost = (costPerImage * numImages).toFixed(3)

  const resizeModelPrice = RESIZE_MODELS.find((m) => m.id === resizeModel)?.price ?? 0.04
  const resizeTotalCost = (resizeSelectedFormats.length * resizeModelPrice).toFixed(3)

  const nbEstimatedCost = useMemo(
    () =>
      estimateNanoBananaCost({
        model: nbModel,
        resolution: nbResolution,
        numOutputs: nbNumOutputs,
        webSearch: nbWebSearch,
        thinkingLevel: nbThinkingLevel
      }),
    [nbModel, nbResolution, nbNumOutputs, nbWebSearch, nbThinkingLevel]
  )

  const handleGenerate = useCallback(async () => {
    // ── Resize Mode ─────────────────────────────────────────────────────────
    if (activeMode === 'resize') {
      if (!resizeFile) {
        alert('Please upload a source image first.')
        return
      }
      if (resizeSelectedFormats.length === 0) {
        alert('Please select at least one export format.')
        return
      }

      setGenerating(true)
      setGenerated(false)
      setGeneratedImages([])

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(resizeFile!)
        })

        const uploadResult = await falService.uploadImageFromDataUrl(dataUrl)
        if (uploadResult.error || !uploadResult.url) {
          throw new Error(uploadResult.error ?? 'Upload failed')
        }
        const hostedUrl = uploadResult.url

        const selectedPlatforms = PLATFORM_FORMATS.filter((f) =>
          resizeSelectedFormats.includes(f.id)
        )

        const promises = selectedPlatforms.map(async (fmt) => {
          const isNonStandard = fmt.aspectRatioEnum === null
          const customDims = resizeCustomDimensions[fmt.id]
          const targetW = customDims?.w ?? fmt.w
          const targetH = customDims?.h ?? fmt.h

          if (resizeModel === 'reframe') {
            const result = await falService.reframeImage({
              image_url: hostedUrl,
              aspect_ratio: fmt.closestEnum
            })
            return result?.images?.[0]?.url ?? null
          } else if (resizeModel === 'kontext') {
            const result = await falService.kontextEdit({
              image_url: hostedUrl,
              prompt: KONTEXT_RESIZE_PROMPT,
              ...(isNonStandard
                ? { width: targetW, height: targetH }
                : { aspect_ratio: fmt.aspectRatioEnum! })
            })
            return result?.images?.[0]?.url ?? null
          } else {
            const nbResult = await falService.nanoBananaEdit({
              model: 'Nano Banana',
              prompt: KONTEXT_RESIZE_PROMPT,
              image_urls: [hostedUrl],
              aspect_ratio: fmt.closestEnum,
              num_images: 1,
              output_format: 'jpeg',
              safety_tolerance: '4',
              limit_generations: true
            })
            return nbResult?.images?.[0]?.url ?? null
          }
        })

        const results = await Promise.allSettled(promises)
        const urls = results
          .map((r) => (r.status === 'fulfilled' ? r.value : null))
          .filter(Boolean) as string[]

        if (urls.length === 0) {
          const reasons = results
            .filter((r) => r.status === 'rejected')
            .map((r) => (r as PromiseRejectedResult).reason?.message)
            .filter(Boolean)
            .join('\n')
          throw new Error(`All resize requests failed.\n${reasons}`)
        }

        setGeneratedImages(urls)
        setGenerated(true)
        setSelectedOutput(0)
      } catch (err: unknown) {
        console.error('Resize error:', err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        alert(`Resize failed: ${errorMessage}`)
      } finally {
        setGenerating(false)
      }
      return
    }

    // ── Generate Mode ───────────────────────────────────────────────────────
    if (activeMode === 'generate') {
      try {
        setGenerating(true)
        setGenerated(false)
        setGeneratedImages([])

        const uploadedUrls = (
          await Promise.all([
            resolveImageInput(nbReferenceImage, 'Reference'),
            ...nbAssetImages.map((asset, i) => resolveImageInput(asset, `Asset ${i + 1}`))
          ])
        ).filter(Boolean) as string[]

        const finalPrompt = buildNanoBananaPrompt({
          model: nbModel,
          prompt,
          style,
          resolution: nbResolution,
          aspectRatio: nbRatio,
          numImages: nbNumOutputs,
          outputFormat: nbOutputFormat
        })

        const result = await falService.nanoBananaEdit({
          model: nbModel,
          prompt: finalPrompt,
          image_urls: uploadedUrls,
          resolution: nbResolution,
          aspect_ratio:
            nbModel === 'GPT Image 2'
              ? nbRatio === '1:1'
                ? 'square'
                : nbRatio === '16:9'
                  ? 'landscape_16_9'
                  : nbRatio === '9:16'
                    ? 'portrait_16_9'
                    : nbRatio === '4:3'
                      ? 'landscape_4_3'
                      : nbRatio === '3:4'
                        ? 'portrait_4_3'
                        : nbRatio
              : nbRatio,
          num_images: nbNumOutputs,
          seed: nbSeed,
          output_format: nbOutputFormat,
          safety_tolerance: nbSafety.toString(),
          thinking_level: nbThinkingLevel,
          enable_web_search: nbWebSearch,
          limit_generations: nbLimitGen
        })

        if (!result.images || result.images.length === 0) {
          throw new Error('No images returned from API')
        }

        setGeneratedImages(result.images.map((image) => image.url))
        setGenerated(true)
        setSelectedOutput(0)
      } catch (error: unknown) {
        console.error('Generation Error:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        alert(`Generation failed: ${errorMessage}`)
      } finally {
        setGenerating(false)
      }
      return
    }

    setGenerating(true)
    setGenerated(false)
  }, [
    activeMode,
    nbReferenceImage,
    nbAssetImages,
    nbModel,
    prompt,
    style,
    nbResolution,
    nbRatio,
    nbNumOutputs,
    nbOutputFormat,
    nbSeed,
    nbSafety,
    nbThinkingLevel,
    nbWebSearch,
    nbLimitGen,
    resizeFile,
    resizeSelectedFormats,
    resizeModel,
    resizeCustomDimensions
  ])

  const getGenerateButtonText = useCallback(() => {
    if (activeMode === 'vton') return `Virtual Try-On (${numImages} Images)`
    if (activeMode === 'resize') return 'Resize All Formats'
    if (activeMode === 'landing') return 'Generate Page Concept'
    return `Generate ${numImages} Images`
  }, [activeMode, numImages])

  const getGeneratingText = useCallback(() => {
    if (activeMode === 'vton') return 'Casting AI & Fitting...'
    if (activeMode === 'resize') return 'Resizing Formats...'
    if (activeMode === 'landing') return 'Designing Hero Layout...'
    return `Generating ${numImages} images...`
  }, [activeMode, numImages])

  const outputs = useMemo(
    () =>
      activeMode === 'resize'
        ? generatedImages
        : generatedImages.length > 0
          ? generatedImages
          : SAMPLE_OUTPUTS,
    [activeMode, generatedImages]
  )

  return {
    prompt,
    setPrompt,
    style,
    setStyle,
    ratio,
    setRatio,
    model,
    setModel,
    numImages,
    setNumImages,
    nbReferenceImage,
    setNbReferenceImage,
    nbAssetImages,
    setNbAssetImages,
    nbAdvancedOpen,
    setNbAdvancedOpen,
    nbRatio,
    setNbRatio,
    nbResolution,
    setNbResolution,
    nbOutputFormat,
    setNbOutputFormat,
    nbNumOutputs,
    setNbNumOutputs,
    nbSeed,
    setNbSeed,
    nbSafety,
    setNbSafety,
    nbWebSearch,
    setNbWebSearch,
    nbThinkingLevel,
    setNbThinkingLevel,
    nbModel,
    setNbModel,
    nbLimitGen,
    setNbLimitGen,
    generating,
    setGenerating,
    generated,
    setGenerated,
    selectedOutput,
    setSelectedOutput,
    generatedImages,
    setGeneratedImages,
    resizeFile,
    setResizeFile,
    resizeSelectedFormats,
    setResizeSelectedFormats,
    resizeModel,
    setResizeModel,
    resizeCustomDimensions,
    setResizeCustomDimensions,
    handleStepsComplete,
    handleModeChange,
    handleGenerate,
    getGenerateButtonText,
    getGeneratingText,
    totalCost,
    resizeTotalCost,
    nbEstimatedCost,
    modelPrices,
    outputs
  }
}
