/**
 * LAYOUT ONLY — No business logic in this file.
 * State lives in hooks/use[ScreenName].ts
 * Sub-components live in components/ or tabs/
 * Max 100 lines. If growing beyond that, extract.
 */
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  Image,
  Video,
  Music2,
  BarChart3,
  Settings,
  Wand2,
  Copy,
  Crop,
  Monitor
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import logo from '../../assets/logo.png'
import { NavItem } from './NavItem'
import { ProjectDropdown } from './ProjectDropdown'
import { CollapseButton } from './CollapseButton'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
  { id: 'ad-copy', label: 'Ad Copy', icon: <FileText size={18} />, path: '/ad-copy' },
  {
    id: 'image-gen',
    label: 'Image Gen',
    icon: <Image size={18} />,
    children: [
      {
        id: 'img-generate',
        label: 'Generate',
        path: '/image-gen/generate',
        icon: <Wand2 size={14} />
      },
      {
        id: 'img-vton',
        label: 'Virtual Try-On',
        path: '/image-gen/vton',
        icon: <Copy size={14} />
      },
      {
        id: 'img-social',
        label: 'Social Ads',
        path: '/image-gen/social',
        icon: <Wand2 size={14} />
      },
      {
        id: 'img-resize',
        label: 'Format Resizer',
        path: '/image-gen/resize',
        icon: <Crop size={14} />
      },
      {
        id: 'img-landing',
        label: 'Landing Page',
        path: '/image-gen/landing',
        icon: <Monitor size={14} />
      }
    ]
  },
  {
    id: 'video-gen',
    label: 'Video Gen',
    icon: <Video size={18} />,
    children: [
      {
        id: 'vid-fashion',
        label: 'AI Fashion',
        path: '/video-gen/fashion',
        icon: <Wand2 size={14} />
      }
    ]
  },
  {
    id: 'audio-lab',
    label: 'Audio Lab',
    icon: <Music2 size={18} />,
    children: [
      { id: 'al-tts', label: 'Script', path: '/audio-lab/tts', icon: <FileText size={14} /> }
    ]
  }
]

const bottomItems = [
  { id: 'api-costs', label: 'API Costs', icon: <BarChart3 size={18} />, path: '/api-costs' },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' }
]

export const Sidebar = (): React.ReactElement => {
  const { sidebarCollapsed, toggleSidebar, connectionStatus, refreshConnectionStatus } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'image-gen',
    'video-gen',
    'audio-lab'
  ])

  const isActive = (path?: string): boolean => {
    if (!path) return false
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const isParentActive = (item: { children?: Array<{ path: string }> }): boolean => {
    if (item.children) {
      return item.children.some((child) => location.pathname.startsWith(child.path))
    }
    return false
  }

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const sidebarWidth = sidebarCollapsed ? 64 : 220

  return (
    <div
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        background: 'var(--ma-surface)',
        borderRight: '1px solid var(--ma-border)',
        display: 'flex',
        flexDirection: 'column',
        transition:
          'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
        fontFamily: 'var(--font-body)'
      }}
    >
      <CollapseButton collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div
        style={{
          height: 72,
          display: 'flex',
          alignItems: 'center',
          padding: sidebarCollapsed ? '0 12px' : '0 16px',
          flexShrink: 0,
          ['WebkitAppRegion' as string]: 'drag',
          justifyContent: 'center'
        }}
      >
        <img
          src={logo}
          alt="MonsterCreative"
          style={{
            width: sidebarCollapsed ? 36 : 100,
            height: sidebarCollapsed ? 36 : 100,
            objectFit: 'contain'
          }}
        />
      </div>

      <div
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px', paddingTop: 36 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={sidebarCollapsed}
              isActive={isActive}
              isParentActive={isParentActive}
              isExpanded={expandedMenus.includes(item.id)}
              onToggle={toggleMenu}
              onNavigate={navigate}
            />
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--ma-border)', margin: '12px 4px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bottomItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              collapsed={sidebarCollapsed}
              isActive={isActive}
              isParentActive={isParentActive}
              isExpanded={expandedMenus.includes(item.id)}
              onToggle={toggleMenu}
              onNavigate={navigate}
            />
          ))}
        </div>
      </div>

      <ProjectDropdown collapsed={sidebarCollapsed} />

      {/* Connection Status Pill - if not collapsed */}
      {!sidebarCollapsed && (
        <div style={{ padding: '0 12px 12px' }}>
          <ConnectionStatusPill status={connectionStatus} onRefresh={refreshConnectionStatus} />
        </div>
      )}
    </div>
  )
}

function ConnectionStatusPill({
  status,
  onRefresh
}: {
  status: string
  onRefresh: () => void
}): React.ReactElement {
  const cfg = {
    connected: {
      color: 'var(--ma-green)',
      borderColor: 'rgba(34,197,94,0.2)',
      bg: 'rgba(34,197,94,0.06)',
      text: 'Fal.ai Connected',
      pulse: false
    },
    verifying: {
      color: '#F59E0B',
      borderColor: 'rgba(245,158,11,0.2)',
      bg: 'rgba(245,158,11,0.06)',
      text: 'Verifying...',
      pulse: true
    },
    invalid: {
      color: '#EF4444',
      borderColor: 'rgba(239,68,68,0.2)',
      bg: 'rgba(239,68,68,0.06)',
      text: 'Invalid API Key',
      pulse: false
    },
    required: {
      color: '#EF4444',
      borderColor: 'rgba(239,68,68,0.2)',
      bg: 'rgba(239,68,68,0.06)',
      text: 'API Key Required',
      pulse: false
    },
    error: {
      color: '#F59E0B',
      borderColor: 'rgba(245,158,11,0.2)',
      bg: 'rgba(245,158,11,0.06)',
      text: 'Connection Error',
      pulse: false
    },
    idle: {
      color: 'rgba(255,255,255,0.2)',
      borderColor: 'var(--ma-border)',
      bg: 'transparent',
      text: 'Checking...',
      pulse: false
    }
  }[status] || {
    color: 'rgba(255,255,255,0.2)',
    borderColor: 'var(--ma-border)',
    bg: 'transparent',
    text: 'Checking...',
    pulse: false
  }

  return (
    <button
      onClick={onRefresh}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: cfg.bg,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 6,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left'
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 6px ${cfg.color}`,
          flexShrink: 0
        }}
      />
      <span
        style={{
          fontSize: 10,
          color: cfg.color,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          display: 'block',
          whiteSpace: 'nowrap'
        }}
      >
        {cfg.text}
      </span>
    </button>
  )
}
