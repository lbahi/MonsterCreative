import { Sparkles, ChevronRight, ExternalLink } from 'lucide-react'
import { ActivityItem } from '../types'

const RECENT: ActivityItem[] = []

export const RecentActivity = () => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 600,
            color: '#FFF',
            margin: 0
          }}
        >
          Recent Generations
        </h2>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            color: 'var(--ma-accent-light)',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'var(--font-body)'
          }}
        >
          View all <ChevronRight size={14} />
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: RECENT.length > 0 ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr',
          gap: 14
        }}
      >
        {RECENT.length > 0 ? (
          RECENT.map((item) => <RecentCard key={item.id} item={item} />)
        ) : (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--ma-elevated)',
              borderRadius: 12,
              border: '1px dashed var(--ma-border)'
            }}
          >
            <Sparkles size={20} style={{ color: 'var(--ma-accent)', marginBottom: 10 }} />
            <p style={{ color: 'var(--ma-text-muted)', margin: 0, fontSize: 14 }}>
              No generations yet. Use Quick Launch above to start creating.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function RecentCard({ item }: { item: ActivityItem }) {
  const typeColor =
    item.type === 'Image' ? '#6C63FF' : item.type === 'Video' ? '#EC4899' : '#22C55E'
  return (
    <div
      style={{
        background: 'var(--ma-elevated)',
        border: '1px solid var(--ma-border)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
        <img
          src={item.img}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: typeColor + '30',
            border: `1px solid ${typeColor}50`,
            color: typeColor,
            fontSize: 10,
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: 20,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          {item.type}
        </div>
        <button
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: 5,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ExternalLink size={12} />
        </button>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#FFF',
            margin: '0 0 8px',
            lineHeight: 1.3
          }}
        >
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 20,
              background: 'rgba(108,99,255,0.12)',
              border: '1px solid rgba(108,99,255,0.25)',
              color: 'var(--ma-accent-light)'
            }}
          >
            {item.platform}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ma-green)' }}
            >
              {item.cost}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{item.time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
