import { useEffect, useState } from 'react'
import { useApp } from '../../../contexts/AppContext'

interface ApiKey {
  id: string
  provider: string
  label: string
  value: string
  status: 'connected' | 'error' | 'unconfigured'
  lastUsed?: string
  color: string
  required: boolean
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'fal',
    provider: 'fal.ai',
    label: 'fal.ai API Key',
    value: '',
    status: 'unconfigured',
    color: '#6C63FF',
    required: true
  },
  {
    id: 'gumroad',
    provider: 'Gumroad',
    label: 'License Key',
    value: '',
    status: 'unconfigured',
    color: '#FF90E8',
    required: true
  }
]

export const useSettings = () => {
  const { setRightPanelContent, refreshConnectionStatus } = useApp()
  const [section, setSection] = useState('api-keys')
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [keyError, setKeyError] = useState<string | null>(null)

  useEffect(() => {
    async function loadKeys() {
      const falKey = await window.api.keystore.getFalKey()
      const gumroadKey = await window.api.license.getKey()
      setKeys((prev) =>
        prev.map((k) => {
          if (k.id === 'fal')
            return { ...k, value: falKey || '', status: falKey ? 'connected' : 'unconfigured' }
          if (k.id === 'gumroad')
            return {
              ...k,
              value: gumroadKey || '',
              status: gumroadKey ? 'connected' : 'unconfigured'
            }
          return k
        })
      )
    }
    loadKeys()
  }, [])

  const handleSaveKey = async (keyId: string) => {
    if (!editValue.trim()) return
    setSaving(keyId)
    setKeyError(null)
    try {
      if (keyId === 'fal') {
        const result = await window.api.fal.validateKey(editValue.trim())
        if (!result.valid) {
          setKeyError(result.error || 'Invalid API key.')
          setSaving(null)
          return
        }
        await window.api.keystore.setFalKey(editValue.trim())
      } else if (keyId === 'gumroad') {
        const result = await window.api.license.activate(editValue.trim())
        if (!result.success) {
          setKeyError(result.error || 'Invalid license key.')
          setSaving(null)
          return
        }
      }

      setKeys((prev) =>
        prev.map((k) =>
          k.id === keyId
            ? { ...k, value: editValue.trim(), status: 'connected', lastUsed: 'Just now' }
            : k
        )
      )
      setSaved(keyId)
      setEditingKey(null)
      setKeyError(null)
      await refreshConnectionStatus()
      setTimeout(() => setSaved(null), 2000)
    } catch {
      setKeyError('Network error. Please check your connection.')
    } finally {
      setSaving(null)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (keyId === 'fal') await window.api.keystore.deleteFalKey()
    if (keyId === 'gumroad') {
      await window.api.license.deactivate()
      window.location.reload()
      return
    }
    setKeys((prev) =>
      prev.map((k) =>
        k.id === keyId ? { ...k, value: '', status: 'unconfigured', lastUsed: undefined } : k
      )
    )
    await refreshConnectionStatus()
  }

  return {
    section,
    setSection,
    keys,
    setKeys,
    showValues,
    setShowValues,
    editingKey,
    setEditingKey,
    editValue,
    setEditValue,
    saving,
    setSaving,
    saved,
    setSaved,
    keyError,
    setKeyError,
    handleSaveKey,
    handleDeleteKey,
    setRightPanelContent
  }
}
