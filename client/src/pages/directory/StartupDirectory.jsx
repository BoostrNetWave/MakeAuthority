import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, Plus, Search, Bell,
  ChevronLeft, ChevronRight, Filter, Target
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

// ── Constants ──────────────────────────────────────────────
const formatEcosystemStatsCapital = (amount) => {
  if (!amount) return '₹0'
  if (amount >= 100_000_000) return `₹${(amount / 100_000_000).toFixed(1)}Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`
  return `₹${amount.toLocaleString()}`
}

const STAGES = ['All', 'idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth']
const INDUSTRIES = ['All', 'fintech', 'healthtech', 'edtech', 'agritech', 'saas', 'ecommerce', 'cleantech', 'deeptech']

const STAGE_LABELS = {
  idea: 'Idea',
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  growth: 'Growth',
}

const STAGE_COLORS = {
  idea:     { bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200' },
  pre_seed: { bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200' },
  seed:     { bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200' },
  series_a: { bg: 'bg-violet-50',  text: 'text-violet-600', border: 'border-violet-200' },
  series_b: { bg: 'bg-pink-50',    text: 'text-pink-600',   border: 'border-pink-200' },
  growth:   { bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200' },
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
]

// ── Filter Pill ──────────────────────────────────────────
function FilterPill({ label, options, value, onChange, labelMap }) {
  const [open, setOpen] = useState(false)
  const active = value !== 'All'

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border cursor-pointer ${
          active 
            ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' 
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        }`}
      >
        {label}{active ? `: ${labelMap ? (labelMap[value] || value) : value.replace(/_/g, ' ')}` : ''}
        <ChevronDown size={14} className="opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors border-none ${
                  value === opt ? 'bg-violet-50 text-violet-700 font-semibold' : 'bg-transparent text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt === 'All'
                  ? `All ${label}s`
                  : labelMap
                    ? (labelMap[opt] || opt.replace(/_/g, ' '))
                    : opt.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Startup Card ─────────────────────────────────────────
function StartupCard({ startup, index, onView }) {
  const bgClass = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const name = startup.startupName || 'Startup'
  const initials = name.slice(0, 2).toUpperCase()
  const stageInfo = STAGE_COLORS[startup.stage] || STAGE_COLORS.idea
  const stageLabel = STAGE_LABELS[startup.stage] || (startup.stage || '').replace(/_/g, ' ')

  const formatFunding = (amount) => {
    if (!amount) return 'Undisclosed'
    const fmt = n => n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(0)}Cr` : `₹${(n / 100_000).toFixed(0)}L`
    return fmt(amount)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-default">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden shadow-sm`}>
          {startup.logo ? <img src={startup.logo} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${stageInfo.bg} ${stageInfo.text} ${stageInfo.border}`}>
          {stageLabel}
        </span>
      </div>

      {/* Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{name}</h3>
        <p className="text-xs font-medium text-gray-500 capitalize truncate">
          {startup.industry || 'Tech'}{startup.city ? ` · ${startup.city}` : ''}
        </p>
      </div>

      <p className="text-sm text-gray-600 mb-5 line-clamp-2 min-h-[40px]">
        {startup.elevatorPitch || 'No description provided.'}
      </p>

      {/* Spacer */}
      <div className="flex-1" />
      <div className="h-px bg-gray-100 my-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Funding Ask</p>
          <p className="text-sm font-bold text-gray-900">{formatFunding(startup.fundingAsk)}</p>
        </div>
        <button
          onClick={() => onView(startup._id)}
          className="btn-secondary py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100"
        >
          View Pitch
        </button>
      </div>
    </div>
  )
}

// ── Main Directory ─────────────────────────────────────────
export default function StartupDirectory() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [industry, setIndustry] = useState('All')
  const [stage, setStage] = useState('All')
  const [search, setSearch] = useState('')

  const [ecosystemStats, setEcosystemStats] = useState({ startupsCount: 0, investorsCount: 0, grantsCount: 0, incubatorsCount: 0, totalCapital: 0, successRate: 88 })

  const fetchStartups = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (industry !== 'All') p.append('industry', industry)
      if (stage !== 'All') p.append('stage', stage)
      if (search) p.append('search', search)
      p.append('page', page); p.append('limit', 6)
      p.append('status', 'approved')

      const { data } = await api.get(`/startups?${p}`)
      if (data.success) {
        setStartups(data.startups)
        setTotal(data.total ?? data.startups.length)
        setTotalPages(data.totalPages ?? 1)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchStartups, 300)
    return () => clearTimeout(t)
  }, [industry, stage, search, page])

  useEffect(() => {
    api.get('/ecosystem-stats').then(({ data }) => {
      if (data.success) setEcosystemStats(data)
    }).catch(console.error)
  }, [])

  const anyFilter = industry !== 'All' || stage !== 'All'
  const pageNums = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Startup Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse <strong className="text-gray-900 font-semibold">{total.toLocaleString()} Verified Startups</strong> within the Boostr ecosystem.
            </p>
          </div>
          <button onClick={() => navigate('/my-startup')} className="btn-primary shrink-0 shadow-md shadow-violet-200">
            <Plus size={16} /> Add Startup
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-400 mr-2" />
            <FilterPill label="Industry" options={INDUSTRIES} value={industry} onChange={v => { setIndustry(v); setPage(1) }} />
            <FilterPill label="Stage" options={STAGES} value={stage} onChange={v => { setStage(v); setPage(1) }} labelMap={STAGE_LABELS} />
            {anyFilter && (
              <button onClick={() => { setIndustry('All'); setStage('All'); setPage(1) }} className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 bg-transparent border-none cursor-pointer">
                Clear all
              </button>
            )}
          </div>
          <div className="relative w-full md:w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full py-2.5 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-[300px] rounded-2xl" />)}
          </div>
        ) : startups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No startups found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(''); setIndustry('All'); setStage('All') }} className="btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((s, i) => (
              <StartupCard key={s._id} startup={s} index={i} onView={id => navigate(`/startups/${id}`)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            {pageNums().map((p, i) => (
              <button
                key={i} onClick={() => typeof p === 'number' && setPage(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-semibold cursor-pointer border-none ${
                  page === p ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : p === '…' ? 'bg-transparent text-gray-400 cursor-default' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Global Stats Bottom Banner */}
        <div className="mt-12 bg-white rounded-2xl p-4 md:p-8 border border-gray-100 shadow-sm flex flex-wrap justify-between items-center gap-8">
          {[
            { label: 'Startups', value: ecosystemStats.startupsCount },
            { label: 'Investors', value: ecosystemStats.investorsCount },
            { label: 'Capital Secured', value: formatEcosystemStatsCapital(ecosystemStats.totalCapital) },
            { label: 'Success Rate', value: `${ecosystemStats.successRate}%` },
          ].map((stat, i) => (
            <div key={i} className="flex-1 min-w-[120px] text-center">
              <div className="text-3xl font-black text-gray-900 tracking-tight mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  )
}