import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router'
import { VIDEO_MODELS, VIDEO_DEFAULTS, VideoResolution } from '../constants'
import { VideoTemplate, ActiveVideoGenMode } from '../types'
import { resolveImageInput } from '../../image-gen/utils/resolveImageInput'

export type UseVideoGenReturn = {
  activeMode: ActiveVideoGenMode
  setActiveMode: (mode: ActiveVideoGenMode) => void
  sourceImage: string | null
  setSourceImage: (img: string | null) => void
  endImage: string | null
  setEndImage: (img: string | null) => void
  generating: boolean
  setGenerating: (g: boolean) => void
  generatedVideoUrl: string | null
  setGeneratedVideoUrl: (url: string | null) => void
  prompt: string
  setPrompt: (p: string) => void
  modelId: string
  setModelId: (id: string) => void
  duration: number
  setDuration: (d: number) => void
  aspectRatio: string
  setAspectRatio: (a: string) => void
  resolution: VideoResolution
  setResolution: (r: VideoResolution) => void
  audio: boolean
  setAudio: (a: boolean) => void
  error: string | null
  setError: (e: string | null) => void
  result: { url: string; fileName: string; fileSize: number } | null
  setResult: (res: { url: string; fileName: string; fileSize: number } | null) => void
  selectedModelInfo: (typeof VIDEO_MODELS)[0]
  estimatedCost: string
  selectedTemplate: VideoTemplate | null
  handleTemplateSelect: (
    template: VideoTemplate,
    config: { model: string; duration: number; aspectRatio: string }
  ) => void
  handleManualGenerate: () => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => void
}

export function useVideoGen(): UseVideoGenReturn {
  const location = useLocation()
  const state = location.state as { sourceImage?: string } | null

  const [activeMode, setActiveMode] = useState<ActiveVideoGenMode>('templates')
  const [sourceImage, setSourceImage] = useState<string | null>(state?.sourceImage || null)
  const [endImage, setEndImage] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [prompt, setPrompt] = useState(() => {
    const saved = localStorage.getItem('monster_remix_prompt')
    if (saved) {
      localStorage.removeItem('monster_remix_prompt')
      return saved
    }
    return ''
  })
  const [modelId, setModelId] = useState(VIDEO_MODELS[0].id)
  const [duration, setDuration] = useState<number>(VIDEO_DEFAULTS.duration)
  const [aspectRatio, setAspectRatio] = useState('auto')
  const [resolution, setResolution] = useState<VideoResolution>(VIDEO_DEFAULTS.resolution)
  const [audio, setAudio] = useState<boolean>(VIDEO_DEFAULTS.audio)
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ url: string; fileName: string; fileSize: number } | null>(
    null
  )

  const selectedModelInfo = useMemo(
    () => VIDEO_MODELS.find((item) => item.id === modelId) ?? VIDEO_MODELS[0],
    [modelId]
  )

  const estimatedCost = useMemo(() => {
    const rate = audio
      ? selectedModelInfo.pricePerSec.withAudio
      : selectedModelInfo.pricePerSec.noAudio
    return (rate * duration).toFixed(3)
  }, [selectedModelInfo, duration, audio])

  // Fix: Avoid calling setState directly in effect
  useEffect(() => {
    if (!selectedModelInfo.supportedDurations.includes(duration)) {
      const defaultDur = selectedModelInfo.supportedDurations[0]
      if (defaultDur !== undefined) {
        setDuration(defaultDur)
      }
    }
  }, [selectedModelInfo, duration])

  const executeGeneration = useCallback(
    async (
      targetModelId: string,
      targetPrompt: string,
      targetDur: number,
      targetAspect: string,
      targetRes: string
    ): Promise<void> => {
      if (!sourceImage) {
        alert('Please upload a source image first.')
        return
      }

      try {
        setGenerating(true)
        setGeneratedVideoUrl(null)
        setError(null)
        setResult(null)

        const uploadedStart = await resolveImageInput(sourceImage, 'Video Source')
        if (!uploadedStart) throw new Error('Failed to upload source image')
        const uploadedEnd = await resolveImageInput(endImage, 'Video End Frame')

        const response = await window.api.video.generate({
          modelId: targetModelId,
          prompt: targetPrompt,
          imageUrl: uploadedStart,
          endImageUrl: uploadedEnd ?? undefined,
          aspectRatio: targetAspect,
          resolution: targetRes,
          duration: targetDur,
          audio: audio,
          negativePrompt: 'blurry, low quality, pixelated, noisy, out of focus, poorly lit'
        })

        if (!response.success) {
          throw new Error(response.error)
        }

        const videoData = response.data as { url: string; fileName: string; fileSize: number }
        setGeneratedVideoUrl(videoData.url)
        setResult(videoData)
        setGenerating(false)
      } catch (err: unknown) {
        console.error(err)
        setError(err instanceof Error ? err.message : String(err))
        setGenerating(false)
      }
    },
    [sourceImage, endImage, audio]
  )

  const handleTemplateSelect = useCallback(
    (
      template: VideoTemplate,
      config: { model: string; duration: number; aspectRatio: string }
    ): void => {
      if (!sourceImage) {
        alert('Please select a source image before running a template.')
        return
      }
      setSelectedTemplate(template)
      setModelId(config.model)

      // FIX A: Only pre-fill duration if user hasn't manually changed it from the default
      if (duration === VIDEO_DEFAULTS.duration) {
        setDuration(config.duration)
      }

      setAspectRatio(config.aspectRatio)
      setPrompt(template.prompt)

      // Use the potentially overridden duration for execution
      const finalDuration = duration === VIDEO_DEFAULTS.duration ? config.duration : duration
      executeGeneration(
        config.model,
        template.prompt,
        finalDuration,
        config.aspectRatio,
        resolution
      ).catch(console.error)
    },
    [sourceImage, executeGeneration, resolution, duration]
  )

  const handleManualGenerate = useCallback((): void => {
    executeGeneration(modelId, prompt, duration, aspectRatio, resolution).catch(console.error)
  }, [executeGeneration, modelId, prompt, duration, aspectRatio, resolution])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void): void => {
      const file = e.target.files?.[0]
      if (file) {
        const r = new FileReader()
        r.onload = (ev): void => setter(ev.target?.result as string)
        r.readAsDataURL(file)
      }
    },
    []
  )

  return {
    activeMode,
    setActiveMode,
    sourceImage,
    setSourceImage,
    endImage,
    setEndImage,
    generating,
    setGenerating,
    generatedVideoUrl,
    setGeneratedVideoUrl,
    prompt,
    setPrompt,
    modelId,
    setModelId,
    duration,
    setDuration,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    audio,
    setAudio,
    error,
    setError,
    result,
    setResult,
    selectedModelInfo,
    estimatedCost,
    selectedTemplate,
    handleTemplateSelect,
    handleManualGenerate,
    handleImageUpload
  }
}
