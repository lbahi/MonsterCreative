import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Image, Video, Music2, TrendingUp, DollarSign,
  Zap, Clock, ArrowRight, Sparkles, ExternalLink, ChevronRight
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const STATS = [
  { label: 'Total Generations', value: '0', delta: '-', icon: <Zap size={16} />, color: '#6C63FF' },
  { label: 'API Spend (MTD)', value: '$0.00', delta: '-', icon: <DollarSign size={16} />, color: '#22C55E', mono: true },
  { label: 'Active Projects', value: '0', delta: '-', icon: <Sparkles size={16} />, color: '#F59E0B' },
  { label: 'Time Saved', value: '0h', delta: 'this month', icon: <Clock size={16} />, color: '#EC4899' },
];

const QUICK_LAUNCH = [
  { id: 'ad-copy', label: 'Ad Copy', description: 'Generate converting copy with AI frameworks', icon: <FileText size={20} />, path: '/ad-copy', color: '#6C63FF' },
  { id: 'image-gen', label: 'Image Gen', description: 'Create stunning ad creatives in seconds', icon: <Image size={20} />, path: '/image-gen/generate', color: '#8B5CF6' },
  { id: 'video-gen', label: 'Video Gen', description: 'Produce video ads from text or images', icon: <Video size={20} />, path: '/video-gen/text', color: '#EC4899' },
  { id: 'audio-lab', label: 'Audio Lab', description: 'Coming soon — voiceovers & music beds', icon: <Music2 size={20} />, path: '/audio-lab', color: '#F59E0B', soon: true },
];

const RECENT: any[] = [];

export function DashboardScreen() {
  const { setRightPanelContent } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    setRightPanelContent(<DashboardRightPanel navigate={navigate} />);
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, navigate]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Thursday, April 9, 2026
          </span>
          <div style={{ height: 1, flex: 1, background: 'var(--ma-border)' }} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 700,
          color: '#FFFFFF',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          Good morning, Media Buyer 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
          You've generated <span style={{ color: 'var(--ma-text-muted)', fontWeight: 500 }}>0 creatives</span> this week. Ready to make some magic?
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{
            background: 'var(--ma-elevated)',
            border: '1px solid var(--ma-border)',
            borderRadius: 12,
            padding: '20px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${stat.color}18`,
                border: `1px solid ${stat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.05)',
                padding: '3px 8px', borderRadius: 20,
              }}>
                {stat.delta}
              </span>
            </div>
            <div style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: stat.mono ? 'var(--font-mono)' : 'var(--font-display)',
              letterSpacing: '-0.5px',
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Quick Launch</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {QUICK_LAUNCH.map(card => (
            <button
              key={card.id}
              onClick={() => !card.soon && navigate(card.path)}
              style={{
                background: 'var(--ma-elevated)',
                border: '1px solid var(--ma-border)',
                borderRadius: 12,
                padding: '20px',
                cursor: card.soon ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: card.soon ? 0.55 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!card.soon) {
                  (e.currentTarget as HTMLElement).style.borderColor = `${card.color}60`;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${card.color}20`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ma-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${card.color}20`,
                border: `1px solid ${card.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color, marginBottom: 14,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#FFF', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                {card.label}
                {card.soon && (
                  <span style={{
                    marginLeft: 8, fontSize: 9, background: 'rgba(245,158,11,0.2)',
                    color: '#F59E0B', padding: '2px 6px', borderRadius: 10,
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>
                    Soon
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.5 }}>
                {card.description}
              </p>
              {!card.soon && (
                <ArrowRight size={14} style={{
                  position: 'absolute', bottom: 16, right: 16,
                  color: `${card.color}70`,
                }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Generations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#FFF', margin: 0 }}>Recent Generations</h2>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: 'var(--ma-accent-light)',
            cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)',
          }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: RECENT.length > 0 ? 'repeat(auto-fit, minmax(250px, 1fr))' : '1fr', gap: 14 }}>
          {RECENT.length > 0 ? RECENT.map(item => (
            <RecentCard key={item.id} item={item} />
          )) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--ma-elevated)', borderRadius: 12, border: '1px dashed var(--ma-border)' }}>
              <p style={{ color: 'var(--ma-text-muted)', margin: 0, fontSize: 14 }}>No generations yet. Use Quick Launch above to start creating.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCard({ item }: { item: typeof RECENT[0] }) {
  const typeColor = item.type === 'Image' ? '#6C63FF' : item.type === 'Video' ? '#EC4899' : '#22C55E';

  return (
    <div style={{
      background: 'var(--ma-elevated)',
      border: '1px solid var(--ma-border)',
      borderRadius: 12,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.3)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--ma-border)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
        <ImageWithFallback
          src={item.img}
          alt={item.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: typeColor + '30',
          border: `1px solid ${typeColor}50`,
          color: typeColor,
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
          letterSpacing: '0.5px', textTransform: 'uppercase',
        }}>
          {item.type}
        </div>
        <button style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, padding: 5, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center',
        }}>
          <ExternalLink size={12} />
        </button>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#FFF', margin: '0 0 8px', lineHeight: 1.3 }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <PlatformBadge label={item.platform} />
            {item.platform2 && <PlatformBadge label={item.platform2} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ma-green)' }}>{item.cost}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{item.time}</span>
          </div>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '6px 0 0', fontFamily: 'var(--font-mono)' }}>
          {item.model}
        </p>
      </div>
    </div>
  );
}

function PlatformBadge({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 20,
      background: 'rgba(108,99,255,0.12)',
      border: '1px solid rgba(108,99,255,0.25)',
      color: 'var(--ma-accent-light)',
    }}>
      {label}
    </span>
  );
}

function DashboardRightPanel({ navigate }: { navigate: (path: string) => void }) {
  const ACTIVITY: any[] = [];

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Panel Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--ma-border)',
      }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          Activity Feed
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>Live session tracking</p>
      </div>

      {/* Activity */}
      <div style={{ padding: '16px 0' }}>
        {ACTIVITY.length > 0 ? ACTIVITY.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 20px',
            borderBottom: '1px solid var(--ma-border)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--ma-accent)',
              marginTop: 6, flexShrink: 0,
              boxShadow: '0 0 6px var(--ma-accent)',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 2px' }}>{a.action}</p>
              <p style={{ fontSize: 12, color: '#FFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.item}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{a.time}</span>
                {a.cost && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ma-green)' }}>{a.cost}</span>}
              </div>
            </div>
          </div>
        )) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px 20px', margin: 0 }}>No activity in this session.</p>
        )}
      </div>

      {/* Quick generate */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--ma-border)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Start generating
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'New Ad Copy', path: '/ad-copy', color: '#6C63FF' },
            { label: 'New Image', path: '/image-gen/generate', color: '#8B5CF6' },
            { label: 'New Video', path: '/video-gen/text', color: '#EC4899' },
          ].map(btn => (
            <button
              key={btn.path}
              onClick={() => navigate(btn.path)}
              style={{
                width: '100%', padding: '10px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--ma-border)',
                borderRadius: 8, cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13, textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s',
                fontFamily: 'var(--font-body)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = `${btn.color}50`;
                (e.currentTarget as HTMLElement).style.color = '#FFF';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ma-border)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: btn.color, flexShrink: 0 }} />
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cost insight */}
      <div style={{ padding: '16px 20px', margin: '0 16px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <TrendingUp size={13} style={{ color: 'var(--ma-accent-light)' }} />
          <span style={{ fontSize: 11, color: 'var(--ma-accent-light)', fontWeight: 600 }}>Cost Insight</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
          Avg cost per generation this week: <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF' }}>$0.00</span>
        </p>
      </div>
    </div>
  );
}