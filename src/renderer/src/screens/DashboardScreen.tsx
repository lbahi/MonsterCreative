import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Image, Video, Music2, TrendingUp, DollarSign,
  Zap, Clock, ArrowRight, Sparkles, ExternalLink, ChevronRight,
  RefreshCw, CreditCard
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMtdStart(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashStats {
  totalGenerations: number;
  mtdSpend: number;
  credits: number | null;
  creditsRestricted: boolean;
  timeSavedH: number;
  avgCostPerGen: number;
}

// ─── Quick Launch ────────────────────────────────────────────────────────────

const QUICK_LAUNCH = [
  { id: 'ad-copy', label: 'Ad Copy', description: 'Generate converting copy with AI frameworks', icon: <FileText size={20} />, path: '/ad-copy', color: '#6C63FF' },
  { id: 'image-gen', label: 'Image Gen', description: 'Create stunning ad creatives in seconds', icon: <Image size={20} />, path: '/image-gen/generate', color: '#8B5CF6' },
  { id: 'video-gen', label: 'Video Gen', description: 'Produce video ads from text or images', icon: <Video size={20} />, path: '/video-gen/text', color: '#EC4899' },
  { id: 'audio-lab', label: 'Audio Lab', description: 'Coming soon — voiceovers & music beds', icon: <Music2 size={20} />, path: '/audio-lab', color: '#F59E0B', soon: true },
];

const RECENT: any[] = [];

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardScreen() {
  const { setRightPanelContent } = useApp();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const mtdStart = getMtdStart();

      const [usageRes, billingRes] = await Promise.all([
        window.api.fal.getUsage('day', mtdStart),
        window.api.fal.getBilling(),
      ]);

      // ── Parse usage summary ──
      let totalGenerations = 0;
      let mtdSpend = 0;

      if (!('error' in usageRes)) {
        // Use summary if available (single aggregated totals)
        if (usageRes.summary && usageRes.summary.length > 0) {
          for (const row of usageRes.summary) {
            totalGenerations += row.quantity ?? 0;
            mtdSpend += row.cost ?? 0;
          }
        } else if (usageRes.time_series) {
          // Fall back to summing across time-series buckets
          for (const bucket of usageRes.time_series) {
            for (const result of bucket.results) {
              totalGenerations += result.quantity ?? 0;
              mtdSpend += result.cost ?? 0;
            }
          }
        }
      }

      // ── Parse billing ──
      let credits: number | null = null;
      let creditsRestricted = false;

      if (!('error' in billingRes)) {
        if ((billingRes as any).billing_restricted) {
          creditsRestricted = true;
        } else if (billingRes.credits?.current_balance !== undefined) {
          credits = billingRes.credits.current_balance;
        } else if (typeof billingRes.current_balance === 'number') {
          credits = billingRes.current_balance;
        }
      }

      const avgCostPerGen = totalGenerations > 0 ? mtdSpend / totalGenerations : 0;
      // Heuristic: ~5 min saved per generation vs doing it manually
      const timeSavedH = Math.round((totalGenerations * 5) / 60 * 10) / 10;

      setStats({ totalGenerations, mtdSpend, credits, creditsRestricted, timeSavedH, avgCostPerGen });
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setRightPanelContent(
      <DashboardRightPanel navigate={navigate} stats={stats} loading={loading} />
    );
    return () => setRightPanelContent(null);
  }, [setRightPanelContent, navigate, stats, loading]);

  // ── Stat card definitions ──
  const STATS = [
    {
      label: 'Total Generations',
      value: loading ? '—' : stats?.totalGenerations.toLocaleString() ?? '0',
      delta: 'this month',
      icon: <Zap size={16} />,
      color: '#6C63FF',
      mono: false,
    },
    {
      label: 'API Spend (MTD)',
      value: loading ? '—' : `$${(stats?.mtdSpend ?? 0).toFixed(2)}`,
      delta: 'month to date',
      icon: <DollarSign size={16} />,
      color: '#22C55E',
      mono: true,
    },
    {
      label: 'Available Credits',
      value: loading
        ? '—'
        : stats?.creditsRestricted
        ? 'N/A'
        : stats?.credits !== null
        ? `$${(stats?.credits ?? 0).toFixed(2)}`
        : '—',
      delta: stats?.creditsRestricted ? 'admin key needed' : 'fal.ai balance',
      icon: <CreditCard size={16} />,
      color: '#F59E0B',
      mono: true,
    },
    {
      label: 'Time Saved',
      value: loading ? '—' : `${stats?.timeSavedH ?? 0}h`,
      delta: 'this month',
      icon: <Clock size={16} />,
      color: '#EC4899',
      mono: false,
    },
  ];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000, fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {formatDate()}
            </span>
            <div style={{ height: 1, width: 40, background: 'var(--ma-border)' }} />
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh data"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: '1px solid var(--ma-border)', borderRadius: 6,
              padding: '4px 10px', cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
              fontSize: 11, fontFamily: 'var(--font-body)',
            }}
          >
            <RefreshCw size={11} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30, fontWeight: 700, color: '#FFFFFF',
          margin: 0, letterSpacing: '-0.5px',
        }}>
          {getGreeting()}, Media Buyer 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>
          You've generated{' '}
          <span style={{ color: 'var(--ma-text-muted)', fontWeight: 500 }}>
            {loading ? '…' : `${stats?.totalGenerations ?? 0} creatives`}
          </span>{' '}
          this month.{' '}
          {(stats?.totalGenerations ?? 0) === 0 ? 'Ready to make some magic?' : 'Keep the momentum going!'}
        </p>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STATS.map((stat, i) => (
          <div key={i} style={{
            background: 'var(--ma-elevated)',
            border: '1px solid var(--ma-border)',
            borderRadius: 12, padding: '20px 22px',
            position: 'relative', overflow: 'hidden',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${stat.color}18 0%, transparent 70%)`,
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${stat.color}18`, border: `1px solid ${stat.color}30`,
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
              fontSize: 26, fontWeight: 700, color: '#FFFFFF',
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
                background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
                borderRadius: 12, padding: '20px',
                cursor: card.soon ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.2s',
                opacity: card.soon ? 0.55 : 1,
                position: 'relative', overflow: 'hidden',
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
                background: `${card.color}20`, border: `1px solid ${card.color}30`,
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
                  }}>Soon</span>
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
              <Sparkles size={20} style={{ color: 'var(--ma-accent)', marginBottom: 10 }} />
              <p style={{ color: 'var(--ma-text-muted)', margin: 0, fontSize: 14 }}>
                No generations yet. Use Quick Launch above to start creating.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCard({ item }: { item: any }) {
  const typeColor = item.type === 'Image' ? '#6C63FF' : item.type === 'Video' ? '#EC4899' : '#22C55E';
  return (
    <div style={{
      background: 'var(--ma-elevated)', border: '1px solid var(--ma-border)',
      borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
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
        <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: typeColor + '30', border: `1px solid ${typeColor}50`,
          color: typeColor, fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 20, letterSpacing: '0.5px', textTransform: 'uppercase',
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
        <p style={{ fontSize: 13, fontWeight: 500, color: '#FFF', margin: '0 0 8px', lineHeight: 1.3 }}>{item.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.25)', color: 'var(--ma-accent-light)' }}>
            {item.platform}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ma-green)' }}>{item.cost}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{item.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardRightPanel({ navigate, stats, loading }: {
  navigate: (path: string) => void;
  stats: DashStats | null;
  loading: boolean;
}) {
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--ma-border)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#FFF', margin: 0 }}>
          Activity Feed
        </h3>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>Live session tracking</p>
      </div>

      <div style={{ padding: '16px 0' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '30px 20px', margin: 0 }}>
          No activity in this session.
        </p>
      </div>

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
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--ma-border)',
                borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                fontSize: 13, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                transition: 'all 0.15s', fontFamily: 'var(--font-body)',
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

      {/* Cost Insight — live */}
      <div style={{ padding: '16px 20px', margin: '0 16px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <TrendingUp size={13} style={{ color: 'var(--ma-accent-light)' }} />
          <span style={{ fontSize: 11, color: 'var(--ma-accent-light)', fontWeight: 600 }}>Cost Insight</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Avg cost / generation</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF', fontSize: 12 }}>
              {loading ? '…' : stats ? `$${stats.avgCostPerGen.toFixed(4)}` : '$0.0000'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Total MTD spend</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#FFF', fontSize: 12 }}>
              {loading ? '…' : `$${(stats?.mtdSpend ?? 0).toFixed(2)}`}
            </span>
          </div>
          {/* Budget burn rate — only if we have credits */}
          {!loading && stats && stats.credits !== null && stats.credits > 0 && stats.mtdSpend > 0 && (() => {
            const dayOfMonth = new Date().getDate();
            const dailyRate = stats.mtdSpend / dayOfMonth;
            const daysLeft = Math.floor(stats.credits / dailyRate);
            const isUrgent = daysLeft < 14;
            return (
              <div style={{
                marginTop: 6, padding: '8px 10px', borderRadius: 6,
                background: isUrgent ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.06)',
                border: `1px solid ${isUrgent ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)'}`,
              }}>
                <p style={{ margin: 0, fontSize: 11, color: isUrgent ? 'var(--ma-amber)' : '#22C55E', lineHeight: 1.4 }}>
                  {isUrgent ? '⚠️' : '✅'} At current pace, credits last ~<strong>{daysLeft} days</strong>
                  {isUrgent && ' — consider topping up.'}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}