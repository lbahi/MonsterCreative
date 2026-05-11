import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Target, Calendar } from 'lucide-react'

interface Campaign {
  id: number
  name: string
  created_at: string
  status: 'Live' | 'Paused' | 'Draft' | 'Completed'
  platform: string
  budget: string
}

const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    const fetchCampaigns = async (): Promise<void> => {
      try {
        const data = await window.api.database.getAllCampaigns()
        // Mocking some data if DB is empty for initial walkthrough
        if (data.length === 0) {
          setCampaigns([
            {
              id: 1,
              name: 'Summer Growth 2024',
              created_at: '2024-06-12',
              status: 'Live',
              platform: 'Meta',
              budget: '$12,000'
            },
            {
              id: 2,
              name: 'Winter Collection Launch',
              created_at: '2024-01-05',
              status: 'Paused',
              platform: 'Google',
              budget: '$8,500'
            },
            {
              id: 3,
              name: 'Brand Awareness Q1',
              created_at: '2024-03-01',
              status: 'Completed',
              platform: 'Meta',
              budget: '$25,000'
            }
          ])
        } else {
          setCampaigns(
            data.map((c: { id: number; name: string; created_at: string; platforms: string }) => ({
              id: c.id,
              name: c.name,
              created_at: c.created_at,
              status: 'Live', // Simplification
              platform: c.platforms,
              budget: '$0'
            }))
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        // loading state removed
      }
    }
    fetchCampaigns().catch(console.error)
  }, [])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-soft-cloud tracking-tight">Campaigns</h2>
          <p className="text-sm text-subtle-silver mt-1 font-medium">
            {campaigns.length} campaigns total across all platforms.
          </p>
        </div>
        <button className="btn-primary px-8 py-3.5 flex items-center gap-2 group shadow-xl shadow-ocean-cerulean/10">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-charcoal-surface/40 p-1.5 rounded-xl border border-white/5">
          {['All', 'Live', 'Paused', 'Draft', 'Completed'].map((s, i) => (
            <button
              key={s}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                i === 0
                  ? 'bg-ocean-cerulean text-abyss-black'
                  : 'text-subtle-silver hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-silver group-focus-within:text-ocean-cerulean transition-colors"
              size={16}
            />
            <input
              className="premium-input pl-10 pr-4 py-2 text-sm w-64"
              placeholder="Search campaigns..."
            />
          </div>
          <button className="flex items-center gap-2 bg-charcoal-surface px-4 py-2 rounded-xl text-xs font-bold text-subtle-silver hover:text-soft-cloud border border-white/5 transition-all">
            <Filter size={16} />
            Sort
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="premium-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black">
                Campaign
              </th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black">
                Status
              </th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black">
                Platform
              </th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black">
                Budget
              </th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black">
                Created
              </th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-subtle-silver font-black text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((camp) => (
              <tr key={camp.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="px-6 py-6">
                  <span className="text-sm font-black text-soft-cloud block group-hover:text-ocean-cerulean transition-colors">
                    {camp.name}
                  </span>
                  <span className="text-[10px] text-subtle-silver font-medium uppercase tracking-tighter mt-0.5">
                    ID: CAM-{camp.id}-S
                  </span>
                </td>
                <td className="px-6 py-6">
                  <span
                    className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                      camp.status === 'Live'
                        ? 'bg-warm-sunset/10 text-warm-sunset'
                        : camp.status === 'Completed'
                          ? 'bg-ocean-cerulean/10 text-ocean-cerulean'
                          : 'bg-white/5 text-subtle-silver'
                    }`}
                  >
                    {camp.status}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-subtle-silver">
                    <Target size={14} />
                    <span className="text-xs font-bold">{camp.platform}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm font-black text-soft-cloud">{camp.budget}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2 text-subtle-silver">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">{camp.created_at}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <button className="text-subtle-silver hover:text-soft-cloud p-2 rounded-lg hover:bg-white/5 transition-all">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CampaignsView
