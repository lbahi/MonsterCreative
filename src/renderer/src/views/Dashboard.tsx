import React from 'react'
import { TrendingUp, Users, Target, MousePointer2, ExternalLink } from 'lucide-react'

const Dashboard: React.FC = () => {
  const kpis = [
    { label: 'Total Ad Spend', value: '$24,560', change: '+12.5%', color: 'text-soft-cloud' },
    { label: 'Impressions', value: '1.2M', change: 'Stable', color: 'text-soft-cloud' },
    { label: 'Average CTR', value: '4.8%', change: '+0.4%', color: 'text-ocean-cerulean' },
    { label: 'Conversions', value: '3,240', change: '+8%', color: 'text-soft-cloud' },
  ]

  const campaigns = [
    { name: 'Summer Sale 2024', status: 'LIVE', platform: ['FB', 'IG'], budget: '$1,200.00' },
    { name: 'Product Launch A/B', status: 'LIVE', platform: ['TT'], budget: '$3,500.00' },
    { name: 'Retargeting Wave 2', status: 'PAUSED', platform: ['GG'], budget: '$850.00' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <section>
        <h2 className="text-3xl font-black text-soft-cloud tracking-tighter">Welcome back, Bahaa</h2>
        <p className="text-subtle-silver text-sm mt-1 font-medium">Here's your performance at a glance.</p>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="premium-card p-6">
            <p className="text-[10px] uppercase tracking-widest text-subtle-silver font-black mb-3">{kpi.label}</p>
            <div className="flex items-baseline justify-between">
              <p className={`text-2xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                kpi.change.startsWith('+') ? 'bg-ocean-cerulean/10 text-ocean-cerulean' : 'bg-white/5 text-subtle-silver'
              }`}>
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Recent Campaigns (60%) */}
        <section className="lg:col-span-6 premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-soft-cloud tracking-tight flex items-center gap-2">
              <Target size={18} className="text-ocean-cerulean" />
              Recent Campaigns
            </h3>
            <button className="text-xs font-bold text-ocean-cerulean hover:underline uppercase tracking-widest">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 px-4 mb-2">
              <span className="col-span-2 text-[10px] uppercase tracking-widest text-subtle-silver font-black">Campaign Name</span>
              <span className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">Status</span>
              <span className="text-[10px] uppercase tracking-widest text-subtle-silver font-black">Platform</span>
              <span className="text-[10px] uppercase tracking-widest text-subtle-silver font-black text-right">Budget</span>
            </div>
            
            {campaigns.map((camp, i) => (
              <div key={i} className="grid grid-cols-5 items-center px-4 py-4 rounded-xl bg-charcoal-surface/30 hover:bg-charcoal-surface border border-white/0 hover:border-white/5 transition-all cursor-pointer group">
                <div className="col-span-2 text-sm font-bold text-soft-cloud group-hover:text-ocean-cerulean transition-colors">{camp.name}</div>
                <div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded ${
                    camp.status === 'LIVE' ? 'bg-warm-sunset/10 text-warm-sunset' : 'bg-white/5 text-subtle-silver'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {camp.platform.map((p, pi) => (
                    <span key={pi} className="w-5 h-5 flex items-center justify-center bg-white/5 rounded text-[8px] font-black text-subtle-silver">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="text-right text-sm font-black text-soft-cloud">
                  {camp.budget}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Performing Copy (40%) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="premium-card p-8 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-soft-cloud tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-ocean-cerulean" />
                Winning Copy
              </h3>
              <button className="text-subtle-silver hover:text-soft-cloud transition-colors">
                <ExternalLink size={14} />
              </button>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="p-5 rounded-2xl bg-charcoal-surface border-l-4 border-ocean-cerulean relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <FileText size={40} />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-ocean-cerulean font-black mb-3 italic">Best Hook</p>
                <p className="text-sm italic font-medium leading-relaxed text-soft-cloud">
                  "Stop wasting thousands on unoptimized ads. MosterAds scales your brand in 24 hours."
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-subtle-silver font-black mb-1">Impact</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-warm-sunset tracking-tighter">14.2%</span>
                  <span className="text-[10px] font-bold text-subtle-silver uppercase">Average CTR</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 py-4 rounded-xl bg-white/5 hover:bg-ocean-cerulean hover:text-abyss-black text-soft-cloud text-xs font-black uppercase tracking-[0.2em] transition-all duration-300">
              Launch Campaign
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

const FileText: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
)

export default Dashboard
