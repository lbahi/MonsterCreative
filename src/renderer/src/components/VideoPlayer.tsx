import { useRef, useState } from 'react'
import { Play, Pause, Download, FileVideo } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  fileName: string
  fileSize: number
}

export function VideoPlayer({ url, fileName, fileSize }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleDownload = async () => {
    try {
      const result = await (window as any).api.utils.downloadFile({ url, filename: fileName })
      if (!result.success && !result.cancelled) {
        alert('Failed to download video: ' + (result.error || 'Unknown error'))
      }
    } catch (err: any) {
      console.error('Download failed:', err)
      alert('Failed to download video: ' + err.message)
    }
  }

  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1)

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      width: '100%'
    }}>
      {/* Video Element Wrapper */}
      <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          src={url}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Play/Pause Overlay */}
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isPlaying ? 'transparent' : 'rgba(0,0,0,0.5)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            opacity: isPlaying ? 0 : 1,
          }}
          className="video-overlay"
        >
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--ma-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(108, 99, 255, 0.5)',
            transform: isPlaying ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.3s'
          }}>
            {isPlaying ? <Pause size={32} color="white" fill="white" /> : <Play size={32} color="white" fill="white" style={{ marginLeft: 4 }} />}
          </div>
        </button>
      </div>

      {/* Footer Info & Actions */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(108, 99, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileVideo size={20} color="var(--ma-accent)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#FFF', fontSize: 13, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              {fileSizeMB} MB
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          style={{
            background: 'var(--ma-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  )
}
