import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown, Search, Bell, Bookmark,
  AlertCircle, Sparkles, SlidersHorizontal,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

// ── Constants ──
const CATEGORIES = ['All', 'government', 'csr', 'women_founder', 'technology', 'startup', 'research']
const STAGES = ['All', 'idea', 'pre_seed', 'seed', 'series_a', 'series_b', 'growth']
const INDUSTRIES = ['All', 'fintech', 'healthtech', 'edtech', 'agritech', 'saas', 'ecommerce', 'cleantech', 'deeptech']

const CATEGORY_LABELS = {
  government: 'Government',
  csr: 'CSR Fund',
  women_founder: 'Women in Tech',
  technology: 'Tech / AI',
  startup: 'Startup',
  research: 'Research',
}

const CATEGORY_COLORS = {
  government: { bg: 'bg-blue-50', color: 'text-blue-600' },
  csr: { bg: 'bg-emerald-50', color: 'text-emerald-600' },
  women_founder: { bg: 'bg-pink-50', color: 'text-pink-600' },
  technology: { bg: 'bg-violet-50', color: 'text-violet-600' },
  startup: { bg: 'bg-amber-50', color: 'text-amber-600' },
  research: { bg: 'bg-red-50', color: 'text-red-600' },
}

// ── Helpers ──
function daysUntil(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function formatAmount(min, max) {
  const fmt = n => {
    if (!n) return null
    if (n >= 10_000_000) return `$${(n / 10_000_000).toFixed(1)}M`
    if (n >= 100_000) return `$${(n / 100_000).toFixed(0)}L`
    return `$${n.toLocaleString()}`
  }
  if (min && max) return fmt(min)
  if (min) return fmt(min)
  if (max) return fmt(max)
  return 'Varies'
}

function formatDeadline(deadline) {
  if (!deadline) return null
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

// ── Filter Pill ──
function FilterPill({ label, options, value, onChange, labelMap }) {
  const [open, setOpen] = useState(false)
  const active = value !== 'All'

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
          active 
            ? 'bg-violet-50 text-violet-700 border border-violet-200' 
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        {label}{active ? `: ${labelMap ? (labelMap[value] || value) : value.replace(/_/g, ' ')}` : ''}
        <ChevronDown size={14} className="opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] left-0 z-[100] bg-white border border-gray-100 rounded-xl p-1.5 min-w-[180px] shadow-lg">
            {options.map(opt => (
              <button key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  value === opt ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'
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

// ── Days Left Badge ──
function DaysLeftBadge({ deadline }) {
  const days = daysUntil(deadline)
  if (days === null) return null

  if (days < 0)
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100"><AlertCircle size={10} />Expired</span>
  if (days <= 3)
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100"><AlertCircle size={10} />{days} DAYS LEFT</span>
  if (days <= 14)
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100">in {days} days</span>
  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">in {days} days</span>
}

// ── Stat Card ──
function StatCard({ label, value, accentColorClass, loading }) {
  return (
    <div className="card p-5 flex-1">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {label}
      </div>
      {loading ? (
        <div className="h-8 rounded-md w-3/5 bg-gray-100 animate-pulse" />
      ) : (
        <div className={`text-3xl font-black tracking-tight leading-none ${accentColorClass || 'text-gray-900'}`}>
          {value}
        </div>
      )}
    </div>
  )
}

// ── Grant Card ──
function GrantCard({ grant, bookmarked, onBookmark, onView }) {
  const catInfo = CATEGORY_COLORS[grant.category] || CATEGORY_COLORS.startup
  const catLabel = CATEGORY_LABELS[grant.category] || (grant.category || '').replace(/_/g, ' ')

  return (
    <div
      className="card p-4 md:p-6 flex flex-col hover:border-violet-300 hover:shadow-md transition-all group cursor-default"
    >
      {/* Row 1: category + days left + bookmark */}
      <div className="flex items-center justify-between mb-4">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest border border-current/10 ${catInfo.bg} ${catInfo.color}`}>
          {catLabel}
        </span>

        <div className="flex items-center gap-2">
          <DaysLeftBadge deadline={grant.deadline} />
          <button
            onClick={e => { e.stopPropagation(); onBookmark(grant._id) }}
            className={`p-1 rounded-md transition-colors ${bookmarked ? 'text-violet-500 hover:bg-violet-50' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-100'}`}
          >
            <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Row 2: Grant name */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight tracking-tight">
        {grant.grantName}
      </h3>

      {/* Row 3: Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
        {grant.description}
      </p>

      {/* Women-only badge */}
      {grant.womenFoundersOnly && (
        <div className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-pink-50 text-pink-600 border border-pink-100 inline-block mb-4 w-fit">
          ♀ Women Founders Only
        </div>
      )}

      {/* Row 4: Amount + Deadline */}
      <div className="flex items-baseline justify-between mb-5">
        <div className="text-2xl font-black text-gray-900 tracking-tight">
          {formatAmount(grant.fundingAmountMin, grant.fundingAmountMax)}
        </div>
        {grant.deadline && (
          <div className="text-xs text-gray-400 font-bold">
            Deadline: {formatDeadline(grant.deadline)}
          </div>
        )}
      </div>

      {/* Row 5: AI Eligibility button */}
      <button
        onClick={() => onView(grant.slug)}
        className="w-full py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-sm border border-violet-200 hover:border-violet-300 transition-all flex items-center justify-center gap-2"
      >
        <Sparkles size={16} /> Check AI Eligibility
      </button>
    </div>
  )
}

// ── Skeleton ──
function Skeleton() {
  return (
    <div className="h-[310px] rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
  )
}

// ── Main Page ──
export default function GrantsDirectory() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState('All')
  const [industry, setIndustry] = useState('All')
  const [stage, setStage] = useState('All')
  const [womenOnly, setWomenOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [bookmarks, setBookmarks] = useState(new Set())
  const [ecosystemStats, setEcosystemStats] = useState({
    startupsCount: 0,
    investorsCount: 0,
    grantsCount: 0,
    incubatorsCount: 0,
    totalCapital: 0,
    totalGrantsFunding: 0,
    successRate: 88,
  })

  // Derived stats
  const [stats, setStats] = useState({ totalAmount: 0, closingSoon: 0 })

  const fetchEcosystemStats = async () => {
    try {
      const { data } = await api.get('/ecosystem-stats')
      if (data.success) {
        setEcosystemStats(data)
      }
    } catch (e) {
      console.error('Failed to load ecosystem stats:', e)
    }
  }

  const fetchGrants = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.append('category', category)
      if (industry !== 'All') params.append('industry', industry)
      if (stage !== 'All') params.append('stage', stage)
      if (womenOnly) params.append('womenOnly', 'true')
      if (search) params.append('search', search)
      params.append('page', page)
      params.append('limit', 6)

      const { data } = await api.get(`/grants?${params}`)
      if (data.success) {
        setGrants(data.grants)
        setTotal(data.total ?? data.grants.length)
        setTotalPages(data.totalPages ?? 1)

        const closingSoon = data.grants.filter(g => {
          const d = daysUntil(g.deadline)
          return d !== null && d >= 0 && d <= 7
        }).length
        const totalAmt = data.grants.reduce((sum, g) => sum + (g.fundingAmountMin || 0), 0)
        setStats({ totalAmount: totalAmt, closingSoon })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const { data } = await api.get('/grants/bookmarks/me')
      if (data.success) setBookmarks(new Set(data.bookmarks.map(g => g._id)))
    } catch { /* not logged in — ignore */ }
  }

  useEffect(() => {
    const t = setTimeout(fetchGrants, 300)
    return () => clearTimeout(t)
  }, [category, industry, stage, womenOnly, search, page])

  useEffect(() => {
    fetchBookmarks()
    fetchEcosystemStats()
  }, [])

  const handleBookmark = async (grantId) => {
    try {
      const { data } = await api.post(`/grants/${grantId}/bookmark`)
      if (data.success) {
        setBookmarks(prev => {
          const next = new Set(prev)
          data.bookmarked ? next.add(grantId) : next.delete(grantId)
          return next
        })
      }
    } catch (e) { console.error(e) }
  }

  const clearFilters = () => { setCategory('All'); setIndustry('All'); setStage('All'); setWomenOnly(false); setPage(1) }
  const anyFilter = category !== 'All' || industry !== 'All' || stage !== 'All' || womenOnly

  const pageNums = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page - 1, page, page + 1, '…', totalPages]
  }

  const fmtTotalAmount = (n) => {
    if (!n) return '$0'
    if (n >= 10_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
    if (n >= 100_000) return `$${(n / 100_000).toFixed(0)}L`
    return `$${n.toLocaleString()}`
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50/30">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0 shadow-sm sticky top-0 z-30">
          {/* Search */}
          <div className="relative w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search grants, programs..."
              className="w-full py-2 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
            </button>
            <button onClick={() => navigate('/pricing')} className="btn-primary py-2 px-5 text-sm">
              Upgrade
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden cursor-pointer">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                Grants Database
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Discover and track non-dilutive funding opportunities for your startup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <SlidersHorizontal size={16} /> Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                Sort By
              </button>
            </div>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard loading={loading} label="Total Available" value={fmtTotalAmount(ecosystemStats.totalGrantsFunding)} />
            <StatCard loading={loading} label="Closing This Week" value={stats.closingSoon} />
            <StatCard loading={loading} label="Total Grants" value={ecosystemStats.grantsCount} />
            <StatCard loading={loading} label="Saved" value={bookmarks.size} accentColorClass="text-violet-500" />
          </div>

          {/* ── FILTER PILLS ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <FilterPill label="Category" options={CATEGORIES} value={category} onChange={v => { setCategory(v); setPage(1) }} labelMap={CATEGORY_LABELS} />
            <FilterPill label="Industry" options={INDUSTRIES} value={industry} onChange={v => { setIndustry(v); setPage(1) }} />
            <FilterPill label="Stage" options={STAGES} value={stage} onChange={v => { setStage(v); setPage(1) }} />

            <button
              onClick={() => { setWomenOnly(!womenOnly); setPage(1) }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                womenOnly 
                  ? 'bg-pink-50 text-pink-600 border border-pink-200' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              ♀ Women Only
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            <button onClick={clearFilters}
              className={`text-xs font-bold px-2 py-1 transition-colors ${
                anyFilter ? 'text-gray-500 hover:text-gray-900 cursor-pointer' : 'text-gray-300 cursor-default'
              }`}>
              Clear all filters
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && grants.length === 0 && (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
              <div className="text-5xl mb-4">💰</div>
              <div className="text-lg font-bold text-gray-900 mb-2">No grants found</div>
              <div className="text-sm text-gray-500 font-medium mb-6">
                Try different filters or check back soon for new opportunities.
              </div>
              <button onClick={clearFilters} className="btn-primary inline-block">
                Clear Filters
              </button>
            </div>
          )}

          {/* Cards grid */}
          {!loading && grants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {grants.map(g => (
                <GrantCard
                  key={g._id}
                  grant={g}
                  bookmarked={bookmarks.has(g._id)}
                  onBookmark={handleBookmark}
                  onView={slug => navigate(`/grants/${slug}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {pageNums().map((p, i) => (
                <button key={i}
                  onClick={() => typeof p === 'number' && setPage(p)}
                  disabled={p === '…'}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    page === p 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : p === '…' 
                        ? 'bg-transparent text-gray-400 cursor-default'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── BOTTOM CTA BANNER ── */}
          <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-700 rounded-3xl p-4 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-lg shadow-violet-200">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="max-w-md relative z-10 mb-6 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                Never miss a funding opportunity again
              </h2>
              <p className="text-sm text-violet-100 font-medium leading-relaxed">
                Our AI constantly monitors thousands of government and private grant databases. Set up tailored alerts for your specific industry and tech stack.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 shrink-0 relative z-10 w-full md:w-auto">
              <button className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap shadow-sm text-sm">
                Setup Smart Alerts
              </button>
              <button className="bg-transparent border-2 border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm">
                Talk to a Grant Specialist
              </button>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}