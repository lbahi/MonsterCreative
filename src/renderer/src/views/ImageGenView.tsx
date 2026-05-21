import React, { useState } from 'react'
import { Sparkles, Image as ImageIcon, Download, Filter, ChevronRight, Loader2 } from 'lucide-react'
import { falService } from '../services/fal.service'

interface GeneratedImage {
  url: string
  prompt: string
  timestamp: string
  model: string
}

const ImageGenView: React.FC = (): React.ReactElement => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<GeneratedImage[]>([])
  const [selectedModel, setSelectedModel] = useState('flux/pro-1.1')
  const [aspectRatio, setAspectRatio] = useState('1:1')

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await falService.generateImage(prompt, selectedModel)
      if (response.images && response.images.length > 0) {
        const newImages = response.images.map((img) => ({
          url: img.url,
          prompt: prompt,
          timestamp: new Date().toLocaleTimeString(),
          model: selectedModel
        }))
        setResults((prev) => [...newImages, ...prev])

        // Save to database
        for (const img of response.images) {
          await window.api.database.saveImage({
            campaign_id: null,
            local_path: img.url,
            prompt: prompt,
            model: selectedModel,
            format: aspectRatio,
            width: img.width,
            height: img.height,
            fal_request_id: response.request_id
          })
        }
      }
    } catch (error: unknown) {
      console.error('Generation failed:', error)
      alert(`Generation failed: ${(error as Error).message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-full gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Left: Controls */}
      <section className="w-80 flex flex-col gap-6 no-scrollbar overflow-y-auto pr-2">
        <div className="premium-card p-8 flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-black text-soft-cloud tracking-tight">Image Generation</h2>
            <p className="text-xs text-subtle-silver mt-1">Create stunning ad visuals with AI.</p>
          </div>

          {/* Prompt */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">
              Prompt Input
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="premium-input h-32 resize-none"
              placeholder="A futuristic luxury watch floating in a void, neon accents, high resolution..."
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">
              AI Model
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'flux/pro-1.1', name: 'FLUX Pro 1.1 (Premium)' },
                { id: 'flux/schnell', name: 'FLUX Schnell (Fast)' }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`text-left px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedModel === model.id
                      ? 'bg-ocean-cerulean/10 border-ocean-cerulean text-ocean-cerulean'
                      : 'bg-charcoal-surface border-white/5 text-subtle-silver hover:border-white/20'
                  }`}
                >
                  {model.name}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['1:1', '16:9', '9:16', '4:5'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    aspectRatio === ratio
                      ? 'bg-ocean-cerulean/10 border-ocean-cerulean text-ocean-cerulean'
                      : 'bg-charcoal-surface border-white/5 text-subtle-silver hover:border-white/20'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Images
              </>
            )}
          </button>
        </div>
      </section>

      {/* Right: Results Display */}
      <section className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-soft-cloud tracking-tight">Generated Results</h3>
            <p className="text-xs text-subtle-silver mt-1 font-medium">
              {results.length} images created in this session
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl bg-charcoal-surface text-subtle-silver hover:text-soft-cloud border border-white/5 transition-all">
              <Filter size={18} />
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal-surface text-soft-cloud text-xs font-bold border border-white/5 hover:bg-white/5 transition-all">
              <Download size={16} />
              Download All
            </button>
          </div>
        </div>

        {/* Main Result Display (Empty State / Latest) */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {results.length === 0 ? (
            <div className="flex-1 rounded-3xl border-2 border-dashed border-white/5 bg-charcoal-surface/20 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-subtle-silver mb-6">
                <ImageIcon size={40} />
              </div>
              <h4 className="text-lg font-bold text-soft-cloud">No images generated yet</h4>
              <p className="text-subtle-silver text-sm mt-2 max-w-xs">
                Enter a prompt on the left and hit generate to see the magic happen.
              </p>
            </div>
          ) : (
            <>
              {/* Latest Result Grid */}
              <div className="grid grid-cols-2 gap-6 h-3/5">
                {results.slice(0, 2).map((img, i) => (
                  <div key={i} className="group relative rounded-3xl overflow-hidden glass-panel">
                    <img
                      src={img.url}
                      alt="Generated creative"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-abyss-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4">
                      <button className="px-8 py-3 bg-ocean-cerulean text-abyss-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all">
                        Use in Campaign
                      </button>
                      <div className="flex gap-2">
                        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all text-soft-cloud">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* History Row */}
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <h4 className="text-[10px] uppercase tracking-widest text-subtle-silver font-black opacity-60">
                  Recent History
                </h4>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
                  {results.map((img, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-surface/40 hover:bg-charcoal-surface border border-white/0 hover:border-white/5 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-5 overflow-hidden">
                        <img
                          src={img.url}
                          className="w-12 h-12 rounded-lg object-cover"
                          alt="History thumbnail"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-soft-cloud truncate max-w-md italic">
                            &quot;{img.prompt}&quot;
                          </p>
                          <p className="text-[10px] text-subtle-silver font-medium mt-0.5 uppercase tracking-tighter">
                            {img.timestamp} • {img.model}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-subtle-silver group-hover:text-ocean-cerulean transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default ImageGenView
