import { useState, useRef, useCallback } from 'react'
import { VIBES } from '../../../constants'
import { resolveImageInput } from '../../../utils/resolveImageInput'
import type { VtonFormProps, GarmentSlot, ModelTemplate } from '../types'
import { MODEL_TEMPLATES } from '../data/model-templates'
import { generateProductShots } from '../../../../../services/productShotsService'

const INITIAL_SLOTS: GarmentSlot[] = [
  { id: 0, label: 'Main Garment', image: null },
  { id: 1, label: 'Bottom', image: null },
  { id: 2, label: 'Shoes', image: null },
  { id: 3, label: 'Accessory 1', image: null },
  { id: 4, label: 'Accessory 2', image: null },
  { id: 5, label: 'Accessory 3', image: null }
]

export const useVton = (props: VtonFormProps) => {
  const {
    setGenerating,
    setGeneratedImages,
    setGenerated,
    model,
    numImages,
    resolution,
    aspectRatio
  } = props

  const [garmentSlots, setGarmentSlots] = useState<GarmentSlot[]>(INITIAL_SLOTS)
  const [selectedModelType, setSelectedModelType] = useState<ModelTemplate | null>(null)
  const [vibe, setVibe] = useState('Studio')
  const [progressMsg, setProgressMsg] = useState('')
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null)
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const filledSlots = garmentSlots.filter((s) => s.image !== null)
  const hasMainGarment = garmentSlots[0].image !== null

  const setSlotImage = useCallback(
    (slotId: number, image: string | null) => {
      setGarmentSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, image } : s)))
      // Sync the first garment to the parent's refImage for compatibility
      if (slotId === 0) props.setRefImage(image)
    },
    [props]
  )

  const processFile = useCallback(
    (file: File, slotId: number) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSlotImage(slotId, event.target?.result as string)
      }
      reader.readAsDataURL(file)
    },
    [setSlotImage]
  )

  const handleSlotDrop = useCallback(
    (e: React.DragEvent, slotId: number) => {
      e.preventDefault()
      setDraggingSlot(null)
      if (e.dataTransfer.files?.[0]) {
        processFile(e.dataTransfer.files[0], slotId)
      }
    },
    [processFile]
  )

  const handleSlotFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, slotId: number) => {
      if (e.target.files?.[0]) {
        processFile(e.target.files[0], slotId)
      }
      // Reset the file input so the same file can be re-selected
      e.target.value = ''
    },
    [processFile]
  )

  const clearSlot = useCallback(
    (e: React.MouseEvent, slotId: number) => {
      e.stopPropagation()
      setSlotImage(slotId, null)
    },
    [setSlotImage]
  )

  const clearAll = useCallback(() => {
    setGarmentSlots(INITIAL_SLOTS)
    props.setRefImage(null)
  }, [props])

  const generateVton = useCallback(async () => {
    if (!hasMainGarment) {
      alert('Please upload at least the main garment.')
      return
    }
    if (!selectedModelType) {
      alert('Please select a model type.')
      return
    }

    try {
      setGenerating(true)
      setGenerated(false)
      setGeneratedImages([])
      setProgressMsg('Uploading garments...')

      // 1. Upload all filled garment slots
      const uploadedUrls: string[] = []
      for (const slot of filledSlots) {
        const url = await resolveImageInput(slot.image!, `Garment-${slot.id}`)
        if (!url) throw new Error(`Upload failed for slot "${slot.label}"`)
        uploadedUrls.push(url)
      }

      // 2. AI Casting Director & Nano Banana renderer
      const vibeDesc = VIBES.find((v) => v.id === vibe)?.desc || 'Studio'
      const genImages = await generateProductShots({
        productImage: uploadedUrls,
        systemPrompt: '',
        numberOfImages: numImages,
        imageModelEndpoint: model,
        aspectRatio,
        resolution,
        isVton: true,
        vibeDescription: vibeDesc,
        modelType: selectedModelType,
        onProgress: (msg) => setProgressMsg(msg)
      })

      if (genImages.length === 0) {
        throw new Error('All image generations failed.')
      }

      setGeneratedImages(genImages)
      setGenerated(true)
    } catch (err: unknown) {
      console.error(err)
      alert(`VTON Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
      setProgressMsg('')
    }
  }, [
    hasMainGarment,
    selectedModelType,
    filledSlots,
    vibe,
    numImages,
    model,
    resolution,
    aspectRatio,
    setGenerating,
    setGenerated,
    setGeneratedImages
  ])

  return {
    garmentSlots,
    setGarmentSlots,
    selectedModelType,
    setSelectedModelType,
    vibe,
    setVibe,
    progressMsg,
    draggingSlot,
    setDraggingSlot,
    fileInputRefs,
    filledSlots,
    hasMainGarment,
    handleSlotDrop,
    handleSlotFileSelect,
    clearSlot,
    clearAll,
    generateVton,
    modelTemplates: MODEL_TEMPLATES
  }
}
