import React from 'react'
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Video,
  BarChart3,
  Settings,
  HelpCircle,
  Bell
} from 'lucide-react'

interface ShellProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

const Shell: React.FC<ShellProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'adcopy', label: 'Ad Copy', icon: FileText },
    { id: 'imagegen', label: 'Image Gen', icon: ImageIcon },
    { id: 'videoads', label: 'Video Ads', icon: Video },
    { id: 'tracker', label: 'AI Spending Tracker', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="flex h-screen w-full bg-abyss-black text-soft-cloud overflow-hidden font-sans relative">
      <div className="glow-orb bg-ocean-cerulean/10 w-[600px] h-[600px] -top-32 -right-32" />
      <div className="glow-orb bg-warm-sunset/5 w-[400px] h-[400px] -bottom-32 -left-32" />

      {/* Sidebar */}
      <aside className="w-64 h-full mica-effect border-r border-white/5 flex flex-col z-20">
        <div className="p-8">
          <h1 className="text-ocean-cerulean text-2xl font-black tracking-tighter italic">
            MosterAds
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-subtle-silver font-bold mt-1">
            Monster Creative
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-white/10 text-soft-cloud border-l-4 border-ocean-cerulean'
                    : 'text-subtle-silver hover:bg-white/5 hover:text-soft-cloud'
                }`}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? 'text-ocean-cerulean'
                      : 'group-hover:text-ocean-cerulean transition-colors'
                  }
                />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 mt-auto">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-surface hover:bg-elevated-card transition-all cursor-pointer group border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-cerulean to-vibrant-cobalt flex items-center justify-center text-abyss-black font-black">
              B
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Bahaa</p>
              <p className="text-[10px] uppercase tracking-wider text-subtle-silver font-bold">
                Pro Account
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Header */}
        <header className="h-12 border-b border-white/5 flex items-center justify-end px-8 gap-6 mica-effect/20">
          <button className="text-subtle-silver hover:text-ocean-cerulean transition-colors">
            <HelpCircle size={18} />
          </button>
          <button className="text-subtle-silver hover:text-ocean-cerulean transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-fiery-orange rounded-full" />
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-growth/80" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-growth">
              System Live
            </span>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">{children}</div>
      </main>
    </div>
  )
}

export default Shell
