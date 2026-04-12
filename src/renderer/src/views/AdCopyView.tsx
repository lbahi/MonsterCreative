import React, { useState } from 'react'
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Loader2, 
  History,
  Target,
  Zap,
  Globe
} from 'lucide-react'
import { anthropicService } from '../services/anthropic.service'

interface AdCopyVariant {
  variant: number
  headline: string
  hook: string
  body: string
  cta: string
}

const AdCopyView: React.FC = () => {
  const [campaignName, setCampaignName] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['Facebook', 'Instagram'])
  const [tone, setTone] = useState('Persuasive')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<AdCopyVariant[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!campaignName.trim()) return
    
    setIsGenerating(true)
    try {
      const jsonRes = await anthropicService.generateAdCopy(campaignName, platforms, tone)
      // Extract the JSON array from the response string (AI might wrap it in markdown)
      const cleanJson = jsonRes.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleanJson) as AdCopyVariant[]
      setResults(parsed)
      
      // Save variants to DB
      for (const variant of parsed) {
        await window.api.database.saveCopyVariant({
          campaign_id: null,
          variant_name: `Variation ${variant.variant}`,
          headline: variant.headline,
          body_text: `${variant.hook}\n\n${variant.body}`,
          cta_text: variant.cta,
          ctr_estimate: 0
        })
      }
    } catch (error: any) {
      console.error('Copy generation failed:', error)
      alert('Failed to generate copy. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const togglePlatform = (p: string) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  return (
    <div className="flex h-full gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Left: Configuration */}
      <section className="w-80 flex flex-col gap-6 no-scrollbar overflow-y-auto pr-2">
        <div className="premium-card p-8 flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-black text-soft-cloud tracking-tight">Ad Copy Engine</h2>
            <p className="text-xs text-subtle-silver mt-1">High-converting copy via Anthropic Claude 3.5.</p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">Campaign Context</label>
            <input 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="premium-input text-sm"
              placeholder="e.g. Summer Luxury Watch Sale"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">Target Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {['Facebook', 'Instagram', 'TikTok', 'Google'].map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                    platforms.includes(p)
                      ? 'bg-ocean-cerulean/10 border-ocean-cerulean text-ocean-cerulean'
                      : 'bg-charcoal-surface border-white/5 text-subtle-silver hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">Copy Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="premium-input text-sm appearance-none"
            >
              <option>Persuasive</option>
              <option>Witty</option>
              <option>Professional</option>
              <option>Urgent</option>
              <option>Minimalist</option>
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !campaignName.trim()}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Sparkles size={18} />
            )}
            <span>Generate Copy</span>
          </button>
        </div>
      </section>

      {/* Right: Output */}
      <section className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-soft-cloud tracking-tight">Generated Variations</h3>
            <p className="text-xs text-subtle-silver mt-1 font-medium">
              Optimized for {platforms.join(', ')}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 font-bold text-[10px] uppercase tracking-widest text-subtle-silver hover:text-soft-cloud">
               <History size={14} />
               History
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 no-scrollbar">
          {results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
              <FileText size={60} className="mb-6 text-subtle-silver" />
              <h4 className="text-lg font-bold text-soft-cloud">Ready to write</h4>
              <p className="text-sm mt-2 max-w-xs">Fill in your campaign details to generate high-converting ad variations.</p>
            </div>
          ) : (
            results.map((v, i) => (
              <div key={i} className="premium-card p-8 group animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-ocean-cerulean/10 flex items-center justify-center text-ocean-cerulean font-black text-xs">
                      #{v.variant}
                    </span>
                    <h4 className="text-lg font-black text-soft-cloud uppercase tracking-tighter">
                      {v.headline}
                    </h4>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(`${v.headline}\n\n${v.hook}\n\n${v.body}\n\n${v.cta}`, i)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-ocean-cerulean hover:text-abyss-black transition-all"
                  >
                    {copiedIndex === i ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-abyss-black/40 border-l-2 border-warm-sunset">
                      <p className="text-[10px] font-black uppercase tracking-widest text-warm-sunset mb-2 italic flex items-center gap-2">
                        <Zap size={10} /> The Hook
                      </p>
                      <p className="text-sm italic text-soft-cloud font-medium">"{v.hook}"</p>
                    </div>
                    <div className="p-4 rounded-xl bg-abyss-black/20 border-l-2 border-ocean-cerulean">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ocean-cerulean mb-2 italic flex items-center gap-2">
                          <Target size={10} /> Primary Body
                        </p>
                        <p className="text-sm text-subtle-silver leading-relaxed">{v.body}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-6 rounded-2xl bg-charcoal-surface border border-white/5 shadow-inner">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-subtle-silver mb-3">Call to Action</p>
                      <div className="py-3 px-4 rounded-lg bg-white/5 border border-dashed border-white/10 text-center">
                        <span className="text-sm font-black text-soft-cloud uppercase tracking-wider">{v.cta}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-growth">
                           <Globe size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Optimized</span>
                        </div>
                        <button className="text-xs font-black text-ocean-cerulean hover:underline uppercase tracking-widest">
                          Edit Manual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default AdCopyView
