import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Key, 
  Shield, 
  Save, 
  Trash2, 
  ExternalLink, 
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react'

const SettingsView: React.FC = () => {
  const [falKey, setFalKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load existing key from keystore
    const loadKey = async () => {
      const key = await window.api.keystore.getFalKey()
      if (key) {
        setFalKey(key)
        setIsSaved(true)
      }
    }
    loadKey()
  }, [])

  const handleSaveKey = async () => {
    if (!falKey.trim()) return
    
    setIsSaving(true)
    try {
      await window.api.keystore.setFalKey(falKey)
      setIsSaved(true)
      // Subtle pulse or success state
      setTimeout(() => setIsSaving(false), 500)
    } catch (err) {
      console.error('Failed to save key:', err)
      setIsSaving(false)
    }
  }

  const handleDeleteKey = async () => {
    if (confirm('Are you sure you want to delete your API key? This will stop all generation features.')) {
      await window.api.keystore.deleteFalKey()
      setFalKey('')
      setIsSaved(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Header */}
      <section>
        <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-ocean-cerulean/10 rounded-2xl flex items-center justify-center text-ocean-cerulean">
                <Settings size={28} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-soft-cloud tracking-tight">System Settings</h2>
                <p className="text-subtle-silver text-sm mt-1 font-medium">Manage your credentials and local configuration.</p>
            </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Left: Nav items for settings (optional layout style) */}
        <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-ocean-cerulean border-l-4 border-ocean-cerulean font-bold text-sm">
                <Key size={18} /> API Credentials
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-subtle-silver hover:bg-white/5 hover:text-soft-cloud transition-all font-semibold text-sm">
                <Shield size={18} /> Privacy & Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-subtle-silver hover:bg-white/5 hover:text-soft-cloud transition-all font-semibold text-sm">
                <Info size={18} /> About Version
            </button>
        </div>

        {/* Right: Content Area */}
        <div className="md:col-span-2 space-y-8">
            {/* API Key Panel */}
            <div className="premium-card p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-soft-cloud uppercase tracking-tight">Fal.ai API Configuration</h3>
                        <p className="text-xs text-subtle-silver mt-1">Required for image and copy generation.</p>
                    </div>
                    <a 
                      href="https://fal.ai/dashboard/keys" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-ocean-cerulean hover:underline flex items-center gap-1.5"
                    >
                      Get Key <ExternalLink size={12} />
                    </a>
                </div>

                <div className="space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-subtle-silver group-focus-within:text-ocean-cerulean transition-colors">
                            <Lock size={16} />
                        </div>
                        <input 
                            type="password"
                            value={falKey}
                            onChange={(e) => {
                                setFalKey(e.target.value)
                                setIsSaved(false)
                            }}
                            className="premium-input pl-12 font-mono text-xs tracking-widest placeholder:tracking-normal"
                            placeholder="fal_key_xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] text-subtle-silver font-medium italic">
                            Your key is stored securely in the system keychain (Windows Password Vault).
                        </p>
                        <div className="flex gap-3">
                            {isSaved && (
                                <button 
                                  onClick={handleDeleteKey}
                                  className="p-3 rounded-xl bg-fiery-orange/10 text-fiery-orange hover:bg-fiery-orange hover:text-white transition-all border border-fiery-orange/20"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <button 
                                onClick={handleSaveKey}
                                disabled={isSaving || falKey.length < 10 || isSaved}
                                className={`btn-primary px-8 flex items-center gap-3 disabled:opacity-50 ${isSaved ? 'bg-emerald-growth/20 text-emerald-growth border-emerald-growth/50 cursor-default shadow-none' : ''}`}
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={18} /> : isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                                {isSaved ? 'Key Secured' : 'Save Credential'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-8 rounded-3xl bg-warm-sunset/5 border border-warm-sunset/20 flex gap-6">
                <div className="text-warm-sunset shrink-0">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-soft-cloud uppercase tracking-wide mb-1">Local-First Architecture</h4>
                    <p className="text-xs text-subtle-silver leading-relaxed font-medium">
                        MonsterCreative is designed to keep your data on your hardware. Your ad copy, generated images, and API keys never leave your machine except to communicate directly with fal.ai.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
