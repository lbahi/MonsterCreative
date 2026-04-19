import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard, FileText, Image, Video, Music2, BarChart3,
  Settings, ChevronRight, ChevronLeft, Wand2, Copy, Crop, Monitor,
  Film, Layers, Zap
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { id: string; label: string; path: string; icon: React.ReactNode }[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    path: '/',
  },
  {
    id: 'ad-copy',
    label: 'Ad Copy',
    icon: <FileText size={18} />,
    path: '/ad-copy',
  },
  {
    id: 'image-gen',
    label: 'Image Gen',
    icon: <Image size={18} />,
    children: [
      { id: 'img-generate', label: 'Generate', path: '/image-gen/generate', icon: <Wand2 size={14} /> },
      { id: 'img-clone', label: 'Virtual Try-On', path: '/image-gen/vton', icon: <Copy size={14} /> },
      { id: 'img-resize', label: 'Format Resizer', path: '/image-gen/resize', icon: <Crop size={14} /> },
      { id: 'img-landing', label: 'Landing Page', path: '/image-gen/landing', icon: <Monitor size={14} /> },
    ],
  },
  {
    id: 'video-gen',
    label: 'Video Gen',
    icon: <Video size={18} />,
    children: [
      { id: 'vid-fashion', label: 'AI Fashion', path: '/video-gen/fashion', icon: <Wand2 size={14} /> },
    ],
  },
  {
    id: 'audio-lab',
    label: 'Audio Lab',
    icon: <Music2 size={18} />,
    path: '/audio-lab',
    badge: 'Soon',
  },
];

const bottomItems: NavItem[] = [
  {
    id: 'api-costs',
    label: 'API Costs',
    icon: <BarChart3 size={18} />,
    path: '/api-costs',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={18} />,
    path: '/settings',
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, connectionStatus, falCredits, refreshConnectionStatus } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['image-gen', 'video-gen']);

  const sidebarWidth = sidebarCollapsed ? 64 : 220;

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isParentActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.path));
    }
    return false;
  };

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      if (!sidebarCollapsed) toggleMenu(item.id);
      else {
        toggleMenu(item.id);
        // expand sidebar too
      }
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: 'var(--ma-surface)',
        borderRight: '1px solid var(--ma-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Title Bar - Electron custom */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: sidebarCollapsed ? '0 12px' : '0 16px',
          flexShrink: 0,
          WebkitAppRegion: 'drag' as any,
        } as React.CSSProperties}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          {!sidebarCollapsed ? (
            <>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 0 12px var(--ma-accent-glow)',
              }}>
                <Zap size={13} color="white" />
              </div>
              <span style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '-0.2px',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-display)',
              }}>
                MonsterCreative
              </span>
            </>
          ) : (
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'linear-gradient(135deg, var(--ma-accent), #9B8FFF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px var(--ma-accent-glow)',
              margin: '0 auto',
            }}>
              <Zap size={12} color="white" />
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            top: 12,
            right: sidebarCollapsed ? 20 : 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--ma-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)',
            zIndex: 20,
            transition: 'all 0.2s',
            flexShrink: 0,
            WebkitAppRegion: 'no-drag' as any,
          }}
          className="hover:bg-white/10 hover:text-white/70"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 8px 8px 8px', paddingTop: 36 }}>
        <NavSection items={navItems} collapsed={sidebarCollapsed} expandedMenus={expandedMenus} onNavClick={handleNavClick} isActive={isActive} isParentActive={isParentActive} navigate={navigate} />

        <div style={{ height: 1, background: 'var(--ma-border)', margin: '12px 4px' }} />

        <NavSection items={bottomItems} collapsed={sidebarCollapsed} expandedMenus={expandedMenus} onNavClick={handleNavClick} isActive={isActive} isParentActive={isParentActive} navigate={navigate} />
      </div>

      {/* User avatar & Sync Status */}
      {!sidebarCollapsed && (
        <div style={{
          padding: '12px 12px',
          borderTop: '1px solid var(--ma-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--ma-accent), #C084FC)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: 'white', flexShrink: 0,
            }}>
              M
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap', margin: 0 }}>Media Buyer Pro</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', margin: 0 }}>Pro Plan</p>
            </div>
          </div>
          
          {/* Connection Status Pill - Clickable */}
          {(() => {
            const cfg = {
              connected: { color: 'var(--ma-green)', borderColor: 'rgba(34,197,94,0.2)', bg: 'rgba(34,197,94,0.06)', text: 'Fal.ai Connected', pulse: false },
              verifying: { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.06)', text: 'Verifying...', pulse: true },
              invalid: { color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.06)', text: 'Invalid API Key', pulse: false },
              required: { color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)', bg: 'rgba(239,68,68,0.06)', text: 'API Key Required', pulse: false },
              error: { color: '#F59E0B', borderColor: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.06)', text: 'Connection Error', pulse: false },
              idle: { color: 'rgba(255,255,255,0.2)', borderColor: 'var(--ma-border)', bg: 'transparent', text: 'Checking...', pulse: false },
            }[connectionStatus] ?? { color: 'rgba(255,255,255,0.2)', borderColor: 'var(--ma-border)', bg: 'transparent', text: 'Checking...', pulse: false };
            return (
              <button
                onClick={() => refreshConnectionStatus()}
                title="Click to re-check connection"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px',
                  background: cfg.bg,
                  border: `1px solid ${cfg.borderColor}`,
                  borderRadius: 6, cursor: 'pointer', width: '100%',
                  textAlign: 'left',
                }}
              >
                <style>{`
                  @keyframes statusPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                  }
                `}</style>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}`,
                  animation: cfg.pulse ? 'statusPulse 1s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{
                    fontSize: 10, color: cfg.color, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                    display: 'block', whiteSpace: 'nowrap',
                  }}>
                    {cfg.text}
                  </span>
                  {connectionStatus === 'connected' && falCredits !== null && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', display: 'block' }}>
                      ${falCredits.toFixed(2)} credits
                    </span>
                  )}
                </div>
              </button>
            );
          })()}
        </div>
      )}

      {sidebarCollapsed && (
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--ma-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--ma-accent), #C084FC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'white',
          }}>
            M
          </div>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ma-green)', boxShadow: '0 0 6px var(--ma-green)' }} />
        </div>
      )}
    </div>
  );
}

function NavSection({ items, collapsed, expandedMenus, onNavClick, isActive, isParentActive, navigate }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((item: NavItem) => (
        <NavItemComponent
          key={item.id}
          item={item}
          collapsed={collapsed}
          expandedMenus={expandedMenus}
          onNavClick={onNavClick}
          isActive={isActive}
          isParentActive={isParentActive}
          navigate={navigate}
        />
      ))}
    </div>
  );
}

function NavItemComponent({ item, collapsed, expandedMenus, onNavClick, isActive, isParentActive, navigate }: any) {
  const active = isActive(item.path) || isParentActive(item);
  const isExpanded = expandedMenus.includes(item.id);

  return (
    <div>
      <button
        onClick={() => onNavClick(item)}
        title={collapsed ? item.label : undefined}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          padding: collapsed ? '8px 0' : '8px 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 8,
          border: 'none',
          background: active
            ? 'rgba(108,99,255,0.15)'
            : 'transparent',
          color: active ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          position: 'relative',
        }}
        className="hover:bg-white/[0.06] hover:text-white/80"
      >
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>

        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
            {item.badge && (
              <span style={{
                fontSize: 9, fontWeight: 600, background: 'rgba(108,99,255,0.3)',
                color: 'var(--ma-accent-light)', padding: '2px 6px', borderRadius: 20,
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}>
                {item.badge}
              </span>
            )}
            {item.children && (
              <ChevronRight
                size={12}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: 'rgba(255,255,255,0.3)',
                }}
              />
            )}
          </>
        )}

        {active && (
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 18,
            borderRadius: '0 2px 2px 0',
            background: 'var(--ma-accent)',
            boxShadow: '0 0 8px var(--ma-accent)',
          }} />
        )}
      </button>

      {/* Sub-menu */}
      {!collapsed && item.children && isExpanded && (
        <div style={{ marginLeft: 12, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {item.children.map((child: any) => {
            const childActive = window.location.pathname === child.path || window.location.pathname.startsWith(child.path);
            return (
              <button
                key={child.id}
                onClick={() => navigate(child.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: childActive ? 'rgba(108,99,255,0.12)' : 'transparent',
                  color: childActive ? 'var(--ma-accent-light)' : 'rgba(255,255,255,0.38)',
                  cursor: 'pointer',
                  fontSize: 12,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                className="hover:bg-white/[0.05] hover:text-white/60"
              >
                <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>{child.icon}</span>
                {child.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
