import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  Folder,
  Image as ImageIcon,
  Video as VideoIcon,
  Music2,
  FileText,
  Sparkles,
  Search,
  ArrowUpDown,
  Trash2,
  Eye,
  Star,
  Copy as CopyIcon,
  Check,
  X,
  RefreshCw,
  Clock,
  Zap,
  Info
} from 'lucide-react'

interface CreationItem {
  id: string
  rawId: string | number
  type: 'Image' | 'Video' | 'Audio' | 'Copy' | 'Ad Project'
  title: string
  subtitle: string
  prompt: string
  model: string
  created_at: string
  imgUrl?: string
  mediaUrl?: string
  cost?: string
  is_favorite: boolean
  tags: string[]
  meta?: any
}

export function CreationsScreen() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'All' | 'Image' | 'Video' | 'Audio' | 'Copy' | 'Ad Project'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest')
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  
  // Data States
  const [images, setImages] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [voices, setVoices] = useState<any[]>([])
  const [copies, setCopies] = useState<any[]>([])
  const [adProjects, setAdProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Selection state for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modal / Preview state
  const [selectedItem, setSelectedItem] = useState<CreationItem | null>(null)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  // Fetch creations from database
  const fetchAllCreations = async () => {
    setLoading(true)
    try {
      const [imgsRes, vidsRes, voicesRes, copiesRes, projectsRes] = await Promise.all([
        window.api.database.getAllGeneratedImages ? window.api.database.getAllGeneratedImages() : [],
        window.api.database.getAllGeneratedVideos ? window.api.database.getAllGeneratedVideos() : [],
        window.api.audio.getAllCustomVoices ? window.api.audio.getAllCustomVoices() : [],
        window.api.database.getAllCopyVariants ? window.api.database.getAllCopyVariants() : [],
        window.api.database.getAllAdProjects ? window.api.database.getAllAdProjects() : []
      ])

      setImages(imgsRes || [])
      setVideos(vidsRes || [])
      setVoices(Array.isArray(voicesRes) ? voicesRes : (voicesRes && 'data' in voicesRes ? (voicesRes.data as any[]) || [] : []))
      setCopies(copiesRes || [])
      setAdProjects(projectsRes || [])
    } catch (err) {
      console.error('Failed to load creations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllCreations()
  }, [])

  // Favorite toggle helper
  const handleToggleFavorite = async (item: CreationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const newValue = !item.is_favorite
    try {
      if (window.api.database.toggleFavorite) {
        await window.api.database.toggleFavorite(item.type, item.rawId, newValue)
        
        // Update local state dynamically
        const updateState = (list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
          setList(list.map(x => x.id === item.rawId ? { ...x, is_favorite: newValue ? 1 : 0 } : x))
        }

        if (item.type === 'Image') updateState(images, setImages)
        else if (item.type === 'Video') updateState(videos, setVideos)
        else if (item.type === 'Audio') updateState(voices, setVoices)
        else if (item.type === 'Copy') updateState(copies, setCopies)
        else if (item.type === 'Ad Project') updateState(adProjects, setAdProjects)

        if (selectedItem?.id === item.id) {
          setSelectedItem(prev => prev ? { ...prev, is_favorite: newValue } : null)
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  // Deletion helper
  const handleDeleteItem = async (item: CreationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm(`Are you sure you want to delete this ${item.type.toLowerCase()}?`)) return

    try {
      if (item.type === 'Image') await window.api.database.deleteGeneratedImage(Number(item.rawId))
      else if (item.type === 'Video') await window.api.database.deleteGeneratedVideo(Number(item.rawId))
      else if (item.type === 'Audio') await window.api.audio.deleteCustomVoice(Number(item.rawId))
      else if (item.type === 'Copy') await window.api.database.deleteCopyVariant(Number(item.rawId))

      if (selectedItem?.id === item.id) {
        setSelectedItem(null)
      }
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })

      fetchAllCreations()
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // Bulk deletion helper
  const handleBulkDelete = async () => {
    const list = Array.from(selectedIds)
    if (list.length === 0) return
    if (!confirm(`Are you sure you want to delete ${list.length} selected creations?`)) return

    try {
      for (const id of list) {
        const item = allItems.find(x => x.id === id)
        if (item) {
          if (item.type === 'Image') await window.api.database.deleteGeneratedImage(Number(item.rawId))
          else if (item.type === 'Video') await window.api.database.deleteGeneratedVideo(Number(item.rawId))
          else if (item.type === 'Audio') await window.api.audio.deleteCustomVoice(Number(item.rawId))
          else if (item.type === 'Copy') await window.api.database.deleteCopyVariant(Number(item.rawId))
        }
      }
      setSelectedIds(new Set())
      fetchAllCreations()
    } catch (error) {
      console.error('Bulk deletion failed:', error)
    }
  }

  // Tag manager
  const handleAddTag = async () => {
    if (!selectedItem || !newTagInput.trim()) return
    const tag = newTagInput.trim().toLowerCase()
    if (selectedItem.tags.includes(tag)) return

    const updatedTags = [...selectedItem.tags, tag]
    const tagsString = JSON.stringify(updatedTags)

    try {
      if (window.api.database.updateTags) {
        await window.api.database.updateTags(selectedItem.type, selectedItem.rawId, tagsString)
        
        // Update state
        const updateState = (list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
          setList(list.map(x => x.id === selectedItem.rawId ? { ...x, tags: tagsString } : x))
        }

        if (selectedItem.type === 'Image') updateState(images, setImages)
        else if (selectedItem.type === 'Video') updateState(videos, setVideos)
        else if (selectedItem.type === 'Audio') updateState(voices, setVoices)
        else if (selectedItem.type === 'Copy') updateState(copies, setCopies)
        else if (selectedItem.type === 'Ad Project') updateState(adProjects, setAdProjects)

        setSelectedItem(prev => prev ? { ...prev, tags: updatedTags } : null)
        setNewTagInput('')
      }
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    if (!selectedItem) return
    const updatedTags = selectedItem.tags.filter(t => t !== tag)
    const tagsString = JSON.stringify(updatedTags)

    try {
      if (window.api.database.updateTags) {
        await window.api.database.updateTags(selectedItem.type, selectedItem.rawId, tagsString)
        
        // Update state
        const updateState = (list: any[], setList: React.Dispatch<React.SetStateAction<any[]>>) => {
          setList(list.map(x => x.id === selectedItem.rawId ? { ...x, tags: tagsString } : x))
        }

        if (selectedItem.type === 'Image') updateState(images, setImages)
        else if (selectedItem.type === 'Video') updateState(videos, setVideos)
        else if (selectedItem.type === 'Audio') updateState(voices, setVoices)
        else if (selectedItem.type === 'Copy') updateState(copies, setCopies)
        else if (selectedItem.type === 'Ad Project') updateState(adProjects, setAdProjects)

        setSelectedItem(prev => prev ? { ...prev, tags: updatedTags } : null)
      }
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  // Remix Redirect
  const handleRemix = (item: CreationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    localStorage.setItem('monster_remix_prompt', item.prompt)

    if (item.type === 'Image') {
      navigate('/image-gen/generate')
    } else if (item.type === 'Video') {
      navigate('/video-gen/fashion')
    } else if (item.type === 'Copy') {
      navigator.clipboard.writeText(item.prompt)
      navigate('/ad-copy')
    } else if (item.type === 'Ad Project') {
      navigate('/video-gen/ad-maker')
    }
  }

  // Convert raw DB items to uniform CreationItem objects
  const allItems = useMemo((): CreationItem[] => {
    const formatted: CreationItem[] = []

    const parseTags = (tagsStr?: string): string[] => {
      if (!tagsStr) return []
      try {
        const parsed = JSON.parse(tagsStr)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return tagsStr.split(',').map(s => s.trim()).filter(Boolean)
      }
    }

    // 1. Images
    images.forEach((img) => {
      formatted.push({
        id: `img-${img.id}`,
        rawId: img.id,
        type: 'Image',
        title: img.prompt ? (img.prompt.length > 32 ? img.prompt.substring(0, 32) + '...' : img.prompt) : 'Untitled Image',
        subtitle: `${img.width || 1024}x${img.height || 1024} • ${img.format || 'PNG'}`,
        prompt: img.prompt || '',
        model: img.model || 'FLUX Pro',
        created_at: img.created_at || new Date().toISOString(),
        imgUrl: img.local_path ? `file://${img.local_path}` : undefined,
        mediaUrl: img.local_path ? `file://${img.local_path}` : undefined,
        is_favorite: !!img.is_favorite,
        tags: parseTags(img.tags),
        cost: '$0.024',
        meta: img
      })
    })

    // 2. Videos
    videos.forEach((vid) => {
      formatted.push({
        id: `vid-${vid.id}`,
        rawId: vid.id,
        type: 'Video',
        title: vid.prompt ? (vid.prompt.length > 32 ? vid.prompt.substring(0, 32) + '...' : vid.prompt) : 'Untitled Video',
        subtitle: `${vid.duration_seconds || vid.duration || 5}s • ${vid.resolution || '1080p'}`,
        prompt: vid.prompt || '',
        model: vid.model || 'Pixverse v6',
        created_at: vid.created_at || vid.createdAt || new Date().toISOString(),
        imgUrl: vid.url || undefined,
        mediaUrl: vid.url || undefined,
        is_favorite: !!vid.is_favorite,
        tags: parseTags(vid.tags),
        cost: `$${((vid.duration_seconds || vid.duration || 5) * 0.05).toFixed(2)}`,
        meta: vid
      })
    })

    // 3. Audio (Custom Voices)
    voices.forEach((v) => {
      formatted.push({
        id: `voice-${v.id}`,
        rawId: v.id,
        type: 'Audio',
        title: v.name || 'Custom Voice',
        subtitle: 'Cloned Voice embedding',
        prompt: 'Speaker Voice sample',
        model: 'Voice Clone',
        created_at: v.created_at || new Date().toISOString(),
        mediaUrl: v.sample_path ? `file://${v.sample_path}` : undefined,
        is_favorite: !!v.is_favorite,
        tags: parseTags(v.tags),
        cost: '$0.01',
        meta: v
      })
    })

    // 4. Copies
    copies.forEach((c) => {
      formatted.push({
        id: `copy-${c.id}`,
        rawId: c.id,
        type: 'Copy',
        title: c.headline1 || c.hook || 'Ad Copy Variant',
        subtitle: `${c.platform || 'Facebook'} • ${c.variant_type || 'Headline'}`,
        prompt: c.body_copy || '',
        model: c.tone || 'Creative AI Writer',
        created_at: c.created_at || new Date().toISOString(),
        is_favorite: !!c.is_favorite,
        tags: parseTags(c.tags),
        cost: '$0.005',
        meta: c
      })
    })

    // 5. Ad Projects
    adProjects.forEach((p) => {
      formatted.push({
        id: `proj-${p.id}`,
        rawId: p.id,
        type: 'Ad Project',
        title: p.metadata?.product_name ? `${p.metadata.brand_name || 'Brand'} - ${p.metadata.product_name}` : 'Ad Storyboard Project',
        subtitle: `Phase ${p.phase || 1} • ${p.status}`,
        prompt: p.metadata?.creative_direction || '',
        model: 'Seedance / Ads Maker',
        created_at: p.updated_at || p.created_at || new Date().toISOString(),
        imgUrl: p.outputs?.storyboard_image_url || undefined,
        mediaUrl: p.outputs?.final_video_url || undefined,
        is_favorite: !!p.is_favorite,
        tags: parseTags(p.tags),
        cost: '$0.15',
        meta: p
      })
    })

    return formatted
  }, [images, videos, voices, copies, adProjects])

  // Filter & Sort
  const filteredItems = useMemo(() => {
    return allItems
      .filter((item) => {
        // Tab Filter
        if (activeTab !== 'All' && item.type !== activeTab) return false
        
        // Favorite Filter
        if (showStarredOnly && !item.is_favorite) return false

        // Search Filter (checks title, prompt, model, tags, and category)
        if (searchQuery.trim() === '') return true
        const query = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.prompt.toLowerCase().includes(query) ||
          item.model.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.includes(query))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        } else if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        } else {
          return a.title.localeCompare(b.title)
        }
      })
  }, [allItems, activeTab, showStarredOnly, searchQuery, sortBy])

  // Stats calculation
  const stats = useMemo(() => {
    return {
      images: images.length,
      videos: videos.length,
      projects: adProjects.length,
      copies: copies.length,
      starred: allItems.filter(x => x.is_favorite).length
    }
  }, [images, videos, adProjects, copies, allItems])

  // Copy clip helper
  const handleCopyPrompt = () => {
    if (!selectedItem) return
    navigator.clipboard.writeText(selectedItem.prompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  // Toggle selection
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div style={{ padding: '32px 36px', width: '100%', fontFamily: 'var(--font-body)', minHeight: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.5px'
            }}
          >
            My Creations
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
            Browse, search, sort, and manage all your generated assets in one hub.
          </p>
        </div>

        {/* Stats Summary cards */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={statsCardStyle} onClick={() => { setActiveTab('Image'); setShowStarredOnly(false); }} className="hover-card">
            <span style={statsNumberStyle}>{stats.images}</span>
            <span style={statsLabelStyle}>Images</span>
          </div>
          <div style={statsCardStyle} onClick={() => { setActiveTab('Video'); setShowStarredOnly(false); }} className="hover-card">
            <span style={statsNumberStyle}>{stats.videos}</span>
            <span style={statsLabelStyle}>Videos</span>
          </div>
          <div style={statsCardStyle} onClick={() => { setActiveTab('All'); setShowStarredOnly(true); }} className="hover-card">
            <span style={{ ...statsNumberStyle, color: '#F59E0B' }}>{stats.starred}</span>
            <span style={statsLabelStyle}>Starred</span>
          </div>
        </div>
      </div>

      {/* Toolbar / Search & Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          background: 'var(--ma-surface)',
          padding: '12px 16px',
          borderRadius: 12,
          border: '1px solid var(--ma-border)'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text"
            placeholder="Search prompt, model, tag, platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--ma-border)',
              borderRadius: 8,
              padding: '8px 12px 8px 38px',
              fontSize: 13,
              color: '#FFF',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        {/* Starring & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Favorite Toggle button */}
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: showStarredOnly ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
              border: showStarredOnly ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--ma-border)',
              borderRadius: 8,
              padding: '6px 12px',
              color: showStarredOnly ? '#F59E0B' : 'rgba(255,255,255,0.6)',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <Star size={14} fill={showStarredOnly ? '#F59E0B' : 'none'} />
            Starred Only
          </button>

          {/* Sort selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpDown size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              style={{
                background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 13,
                color: '#FFF',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--ma-border)', paddingBottom: 12 }}>
        {(['All', 'Image', 'Video', 'Audio', 'Copy', 'Ad Project'] as const).map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: isActive ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                border: '1px solid ' + (isActive ? 'rgba(108, 99, 255, 0.4)' : 'transparent'),
                color: isActive ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.5)',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {tab === 'All' && <Folder size={14} />}
              {tab === 'Image' && <ImageIcon size={14} />}
              {tab === 'Video' && <VideoIcon size={14} />}
              {tab === 'Audio' && <Music2 size={14} />}
              {tab === 'Copy' && <FileText size={14} />}
              {tab === 'Ad Project' && <Sparkles size={14} />}
              {tab}s
            </button>
          )
        })}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.4)', gap: 12 }}>
          <RefreshCw className="animate-spin" size={18} />
          Loading your creations...
        </div>
      ) : filteredItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, paddingBottom: 80 }}>
          {filteredItems.map((item) => (
            <CreationCard
              key={item.id}
              item={item}
              isSelected={selectedIds.has(item.id)}
              onToggleSelect={(e) => handleToggleSelect(item.id, e)}
              onToggleFavorite={(e) => handleToggleFavorite(item, e)}
              onCardClick={() => setSelectedItem(item)}
              onRemix={(e) => handleRemix(item, e)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '80px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'var(--ma-elevated)',
            borderRadius: 16,
            border: '1px dashed var(--ma-border)',
            textAlign: 'center'
          }}
        >
          <Sparkles size={36} style={{ color: 'var(--ma-accent)' }} />
          <div>
            <h3 style={{ color: '#FFF', margin: '0 0 4px', fontSize: 16 }}>No creations found</h3>
            <p style={{ color: 'var(--ma-text-muted)', margin: 0, fontSize: 14, maxWidth: 360 }}>
              {searchQuery ? 'Try adjusting your search query.' : `You haven't generated any ${activeTab.toLowerCase()} assets yet.`}
            </p>
          </div>
        </div>
      )}

      {/* Bulk actions Floating Toolbar */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 10, 20, 0.85)',
            border: '1px solid rgba(108, 99, 255, 0.3)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(108,99,255,0.15)',
            padding: '12px 24px',
            borderRadius: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            zIndex: 100
          }}
        >
          <span style={{ fontSize: 13, color: '#FFF', fontWeight: 500 }}>
            {selectedIds.size} items selected
          </span>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleBulkDelete}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Trash2 size={13} />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFF',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Glassmorphic detailed Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 3, 8, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 900,
              height: '80vh',
              background: 'var(--ma-bg)',
              border: '1px solid var(--ma-border)',
              borderRadius: 20,
              display: 'flex',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.8)'
            }}
          >
            {/* Viewport (Left) */}
            <div style={{ flex: 1.3, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {selectedItem.type === 'Image' && selectedItem.imgUrl && (
                <img
                  src={selectedItem.imgUrl}
                  alt={selectedItem.title}
                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: 8 }}
                />
              )}
              {selectedItem.type === 'Video' && selectedItem.mediaUrl && (
                <video
                  src={selectedItem.mediaUrl}
                  controls
                  autoPlay
                  loop
                  style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: 8 }}
                />
              )}
              {selectedItem.type === 'Audio' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <Music2 size={64} style={{ color: 'var(--ma-accent)' }} />
                  {selectedItem.mediaUrl && (
                    <audio src={selectedItem.mediaUrl} controls autoPlay />
                  )}
                  <span style={{ fontSize: 13, color: 'var(--ma-text-muted)' }}>Cloned Voice Player</span>
                </div>
              )}
              {selectedItem.type === 'Copy' && (
                <div style={{ padding: 40, width: '100%', maxHeight: '100%', overflowY: 'auto' }}>
                  <div style={{ background: 'var(--ma-surface)', border: '1px solid var(--ma-border)', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ color: '#FFF', fontSize: 18, marginBottom: 12 }}>{selectedItem.title}</h3>
                    <p style={{ color: 'var(--ma-text-muted)', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {selectedItem.prompt}
                    </p>
                  </div>
                </div>
              )}
              {selectedItem.type === 'Ad Project' && selectedItem.mediaUrl && (
                <video
                  src={selectedItem.mediaUrl}
                  controls
                  style={{ maxWidth: '95%', maxHeight: '95%', borderRadius: 8 }}
                />
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Details (Right) */}
            <div
              style={{
                flex: 1,
                borderLeft: '1px solid var(--ma-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 24,
                background: 'rgba(7,7,15,0.4)',
                overflowY: 'auto'
              }}
            >
              <div>
                {/* Type Badge & Star toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span
                    style={{
                      background: 'rgba(108, 99, 255, 0.12)',
                      border: '1px solid rgba(108, 99, 255, 0.25)',
                      color: 'var(--ma-accent-light)',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 20,
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedItem.type}
                  </span>
                  <button
                    onClick={(e) => handleToggleFavorite(selectedItem, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: selectedItem.is_favorite ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    <Star size={20} fill={selectedItem.is_favorite ? '#F59E0B' : 'none'} />
                  </button>
                </div>

                <h3 style={{ fontSize: 18, color: '#FFF', fontWeight: 600, margin: '0 0 8px' }}>
                  {selectedItem.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--ma-text-muted)', margin: '0 0 20px' }}>
                  {selectedItem.subtitle}
                </p>

                {/* Prompt block */}
                {selectedItem.type !== 'Copy' && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Generation Prompt
                      </span>
                      <button
                        onClick={handleCopyPrompt}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedPrompt ? 'var(--ma-green)' : 'var(--ma-accent-light)',
                          fontSize: 11,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {copiedPrompt ? <Check size={12} /> : <CopyIcon size={12} />}
                        {copiedPrompt ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--ma-border)',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.4,
                        maxHeight: 120,
                        overflowY: 'auto'
                      }}
                    >
                      {selectedItem.prompt || 'No prompt info.'}
                    </div>
                  </div>
                )}

                {/* Tags block */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                    Campaign Tags
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {selectedItem.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          padding: '3px 8px',
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.6)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        #{tag}
                        <X size={10} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)} />
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--ma-border)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 12,
                        color: '#FFF',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleAddTag}
                      style={{
                        background: 'rgba(108, 99, 255, 0.15)',
                        border: '1px solid rgba(108, 99, 255, 0.3)',
                        color: 'var(--ma-accent-light)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 11,
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Metadata details */}
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--ma-border)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={metaRowStyle}>
                    <span style={metaLabelStyle}><Clock size={12} /> Date</span>
                    <span style={metaValueStyle}>{new Date(selectedItem.created_at).toLocaleString()}</span>
                  </div>
                  <div style={metaRowStyle}>
                    <span style={metaLabelStyle}><Zap size={12} /> Model</span>
                    <span style={metaValueStyle}>{selectedItem.model}</span>
                  </div>
                  <div style={metaRowStyle}>
                    <span style={metaLabelStyle}><Info size={12} /> Cost</span>
                    <span style={{ ...metaValueStyle, color: 'var(--ma-green)', fontWeight: 600 }}>{selectedItem.cost || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 20 }}>
                <button
                  onClick={(e) => handleRemix(selectedItem, e)}
                  style={{
                    background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
                    border: 'none',
                    borderRadius: 8,
                    color: '#FFF',
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <RefreshCw size={14} />
                  Remix Creation
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                  {(selectedItem.imgUrl || selectedItem.mediaUrl) && (
                    <button
                      onClick={() => {
                        const url = selectedItem.imgUrl || selectedItem.mediaUrl
                        if (url) window.open(url, '_blank')
                      }}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--ma-border)',
                        borderRadius: 8,
                        color: '#FFF',
                        padding: '8px 12px',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Open File
                    </button>
                  )}
                  {selectedItem.type !== 'Ad Project' && (
                    <button
                      onClick={(e) => handleDeleteItem(selectedItem, e)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 8,
                        color: '#EF4444',
                        padding: '8px 12px',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for spinner animation */}
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-card {
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
        }
        .hover-card:hover {
          border-color: rgba(108, 99, 255, 0.4) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

function CreationCard({
  item,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onCardClick,
  onRemix
}: {
  item: CreationItem
  isSelected: boolean
  onToggleSelect: (e: React.MouseEvent) => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onCardClick: () => void
  onRemix: (e: React.MouseEvent) => void
}) {
  const [hovered, setHovered] = useState(false)

  const typeColor =
    item.type === 'Image'
      ? '#6C63FF'
      : item.type === 'Video'
        ? '#EC4899'
        : item.type === 'Audio'
          ? '#10B981'
          : item.type === 'Copy'
            ? '#F59E0B'
            : '#8B5CF6'

  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--ma-elevated)',
        border: isSelected ? '1px solid var(--ma-accent)' : '1px solid var(--ma-border)',
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(108, 99, 255, 0.25)' : hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        borderColor: isSelected ? 'var(--ma-accent)' : hovered ? 'rgba(108, 99, 255, 0.3)' : 'var(--ma-border)',
        display: 'flex',
        flexDirection: 'column',
        height: 280,
        position: 'relative',
        cursor: 'pointer'
      }}
    >
      {/* Selection checkbox */}
      <div
        onClick={onToggleSelect}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 20,
          height: 20,
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          background: isSelected ? 'var(--ma-accent)' : 'rgba(0,0,0,0.4)',
          zIndex: 10,
          display: (hovered || isSelected) ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {isSelected && <Check size={12} color="#FFF" />}
      </div>

      {/* Thumbnail or Icon preview */}
      <div style={{ height: 140, background: 'rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.imgUrl ? (
          <img
            src={item.imgUrl}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.25)' }}>
            {item.type === 'Audio' && <Music2 size={36} />}
            {item.type === 'Copy' && <FileText size={36} />}
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{item.type}</span>
          </div>
        )}

        {/* Hover action overlay */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 7, 15, 0.72)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              backdropFilter: 'blur(4px)'
            }}
          >
            <button style={actionButtonStyle} onClick={(e) => { e.stopPropagation(); onCardClick(); }}>
              <Eye size={16} />
            </button>
            <button style={actionButtonStyle} onClick={(e) => onRemix(e)}>
              <RefreshCw size={16} />
            </button>
            <button
              onClick={(e) => onToggleFavorite(e)}
              style={{
                ...actionButtonStyle,
                color: item.is_favorite ? '#F59E0B' : '#FFF',
                borderColor: item.is_favorite ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.15)'
              }}
            >
              <Star size={16} fill={item.is_favorite ? '#F59E0B' : 'none'} />
            </button>
          </div>
        )}

        {/* Type Badge */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: `${typeColor}20`,
            border: `1px solid ${typeColor}40`,
            color: typeColor,
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 20,
            letterSpacing: '0.5px'
          }}
        >
          {item.type}
        </span>
      </div>

      {/* Info Block */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#FFF',
              margin: '0 0 6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.title}
          </h4>
          <p
            style={{
              fontSize: 11,
              color: 'var(--ma-text-muted)',
              margin: '0 0 10px',
              height: 32,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3
            }}
          >
            {item.prompt || item.subtitle}
          </p>
        </div>

        {/* Tags indicator */}
        {item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: 6 }}>
            {item.tags.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 9, background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)', padding: '2px 6px', borderRadius: 4 }}>
                #{t}
              </span>
            ))}
            {item.tags.length > 2 && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>+{item.tags.length - 2}</span>}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{item.model}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)' }}>
            {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}

// Styling classes
const statsCardStyle: React.CSSProperties = {
  background: 'var(--ma-surface)',
  border: '1px solid var(--ma-border)',
  borderRadius: 10,
  padding: '6px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 70
}

const statsNumberStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: '#FFF'
}

const statsLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--ma-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  marginTop: 2
}

const actionButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#FFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s'
}

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}

const metaLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'rgba(255,255,255,0.3)',
  display: 'flex',
  alignItems: 'center',
  gap: 6
}

const metaValueStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#FFF'
}
