import { useState, useCallback } from 'react'
import { VOICE_REGISTRY, VoiceEntry } from '../../../data/voices'

export interface AudioResultItem {
  id: string
  url: string
  text: string
  voice: string
  createdAt: string
  type: string
}

export const useAudioLab = () => {
  const [script, setScript] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<VoiceEntry>(VOICE_REGISTRY[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<AudioResultItem[]>([])
  const [regionFilter, setRegionFilter] = useState('')

  // Generation Settings
  const [stability, setStability] = useState(50)
  const [similarity, setSimilarity] = useState(75)
  const [speed, setSpeed] = useState(1.0)

  const handleGenerate = useCallback(async () => {
    if (!script.trim()) return
    setIsGenerating(true)
    try {
      // Standard ElevenLabs voice
      const response = await window.api.audio.generateSpeech({
        text: script,
        voiceId: selectedVoice.elevenLabsId,
        stability: stability / 100
      })

      if (response.success && response.data) {
        setResults((prev) => [
          {
            id: Date.now().toString(),
            url: response.data!.url,
            text: script,
            voice: selectedVoice.name,
            createdAt: new Date().toISOString(),
            type: 'TTS'
          },
          ...prev
        ])
        if (window.api?.analytics) {
          window.api.analytics.capture('audio_lab_used', { voice_model: selectedVoice.elevenLabsId })
        }
      } else {
        alert('Generation failed: ' + response.error)
      }
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsGenerating(false)
    }
  }, [script, selectedVoice, stability])

  const handlePreview = useCallback(async (voice: VoiceEntry) => {
    try {
      // 100% Free Local Preview (Method 1)
      const audioUrl = `./OutputVoices/${voice.name}.mp4`
      const audio = new Audio(audioUrl)
      audio.volume = 0.8

      await audio.play()
    } catch (err) {
      console.error('Failed to play local preview:', err)
      alert(
        `Could not play the local preview for ${voice.name}. Ensure ${voice.name}.mp4 exists in the public/OutputVoices folder.`
      )
    }
  }, [])

  return {
    script,
    setScript,
    selectedVoice,
    setSelectedVoice,
    isGenerating,
    results,
    regionFilter,
    setRegionFilter,
    stability,
    setStability,
    similarity,
    setSimilarity,
    speed,
    setSpeed,
    handleGenerate,
    handlePreview
  }
}
