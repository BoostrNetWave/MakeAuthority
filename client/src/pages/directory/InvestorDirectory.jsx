import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, Plus, Search, Bell,
  ChevronLeft, ChevronRight, Filter
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

const INVESTOR_TYPES = ['All', 'angel', 'venture_capital', 'family_office', 'corporate_vc', 'micro_vc', 'hni']
const STAGES = ['All', 'idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth']
const INDUSTRIES = ['All', 'fintech', 'healthtech', 'edtech', 'agritech', 'saas', 'ecommerce', 'cleantech', 'deeptech']

const TYPE_LABELS = {
  angel: 'Angel',
  venture_capital: 'VC',
  family_office: 'Family Office',
  corporate_vc: 'Corporate VC',
  micro_vc: 'Micro VC',
  hni: 'HNI',
}

const TYPE_COLORS = {
  angel:           { bg: 'bg-amber-50',     text: 'text-amber-600',   border: 'border-amber-200' },
  venture_capital: { bg: 'bg-violet-50',    text: 'text-violet-600',  border: 'border-violet-200' },
  family_office:   { bg: 'bg-emerald-50',   text: 'text-emerald-600', border: 'border-emerald-200' },
  corporate_vc:    { bg: 'bg-blue-50',      text: 'text-blue-600',    border: 'border-blue-200' },
  micro_vc:        { bg: 'bg-pink-50',      text: 'text-pink-600',    border: 'border-pink-200' },
  hni:             { bg: 'bg-red-50',       text: 'text-red-600',     border: 'border-red-200' },
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
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

// ── Investor Card ─────────────────────────────────────────
function InvestorCard({ investor, index, onView }) {
  const bgClass = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const name = investor.user?.name || investor.firmName || 'Investor'
  const initials = name.slice(0, 2).toUpperCase()
  const typeInfo = TYPE_COLORS[investor.investorType] || TYPE_COLORS.angel
  const typeLabel = TYPE_LABELS[investor.investorType] || (investor.investorType || '').replace(/_/g, ' ')

  const formatTicket = (min, max) => {
    if (!min && !max) return 'Undisclosed'
    const fmt = n => n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(0)}Cr` : `₹${(n / 100_000).toFixed(0)}L`
    if (min && max) return `${fmt(min)} – ${fmt(max)}`
    if (min) return `${fmt(min)}+`
    return `Up to ${fmt(max)}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group cursor-default">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden shadow-sm`}>
          {investor.avatar ? <img src={investor.avatar} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
          {typeLabel}
        </span>
      </div>

      {/* Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{investor.firmName || name}</h3>
        <p className="text-xs font-medium text-gray-500 capitalize truncate">
          {investor.designation || 'Investor'}{investor.city ? ` · ${investor.city}` : ''}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5 min-h-[28px]">
        {(investor.industriesOfInterest?.slice(0, 3) || []).map(ind => (
          <span key={ind} className="px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wider">
            {ind}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />
      <div className="h-px bg-gray-100 my-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ticket Size</p>
          <p className="text-sm font-bold text-gray-900">{formatTicket(investor.ticketSizeMin, investor.ticketSizeMax)}</p>
        </div>
        <button
          onClick={() => onView(investor._id)}
          className="btn-secondary py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100"
        >
          View Profile
        </button>
      </div>
    </div>
  )
}

// ── Main Directory ─────────────────────────────────────────
export default function InvestorDirectory() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [investors, setInvestors] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [type, setType] = useState('All')
  const [industry, setIndustry] = useState('All')
  const [stage, setStage] = useState('All')
  const [search, setSearch] = useState('')

  const [ecosystemStats, setEcosystemStats] = useState({ startupsCount: 0, investorsCount: 0, grantsCount: 0, incubatorsCount: 0, totalCapital: 0, successRate: 88 })

  const fetchInvestors = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (type !== 'All') p.append('investorType', type)
      if (industry !== 'All') p.append('industry', industry)
      if (stage !== 'All') p.append('stage', stage)
      if (search) p.append('search', search)
      p.append('page', page); p.append('limit', 6)

      const { data } = await api.get(`/investors?${p}`)
      if (data.success) {
        setInvestors(data.investors)
        setTotal(data.total ?? data.investors.length)
        setTotalPages(data.totalPages ?? 1)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchInvestors, 300)
    return () => clearTimeout(t)
  }, [type, industry, stage, search, page])

  useEffect(() => {
    api.get('/ecosystem-stats').then(({ data }) => {
      if (data.success) setEcosystemStats(data)
    }).catch(console.error)
  }, [])

  const anyFilter = type !== 'All' || industry !== 'All' || stage !== 'All'
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Investor Directory</h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse <strong className="text-gray-900 font-semibold">{total.toLocaleString()} Verified Investors</strong> within the Boostr ecosystem.
            </p>
          </div>
          <button onClick={() => navigate('/profile/investor/create')} className="btn-primary shrink-0 shadow-md shadow-violet-200">
            <Plus size={16} /> Add Profile
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-400 mr-2" />
            <FilterPill label="Type" options={INVESTOR_TYPES} value={type} onChange={v => { setType(v); setPage(1) }} labelMap={TYPE_LABELS} />
            <FilterPill label="Industry" options={INDUSTRIES} value={industry} onChange={v => { setIndustry(v); setPage(1) }} />
            <FilterPill label="Stage" options={STAGES} value={stage} onChange={v => { setStage(v); setPage(1) }} />
            {anyFilter && (
              <button onClick={() => { setType('All'); setIndustry('All'); setStage('All'); setPage(1) }} className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 bg-transparent border-none cursor-pointer">
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
        ) : investors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No investors found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(''); setType('All'); setIndustry('All'); setStage('All') }} className="btn-secondary">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((inv, i) => (
              <InvestorCard key={inv._id} investor={inv} index={i} onView={id => navigate(`/investors/${id}`)} />
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