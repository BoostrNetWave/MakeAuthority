import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, MapPin, Users, Target, Search, Filter,
  ChevronDown, ExternalLink, Calendar, CheckCircle2, ChevronRight, Check,
  Grid, Map, Bell, ChevronLeft
} from 'lucide-react'
import { toast } from 'react-hot-toast'
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

const INDUSTRIES = ['All', 'tech', 'social', 'agritech', 'fintech']
const CATEGORIES = ['All', 'iit_incubator', 'iim_incubator', 'university_incubator', 'government_incubator', 'corporate_accelerator', 'private_accelerator']

const INDUSTRY_LABELS = {
  tech: 'Tech',
  social: 'Social',
  agritech: 'Agritech',
  fintech: 'FinTech',
}

const CATEGORY_LABELS = {
  iit_incubator: 'IIT Incubator',
  iim_incubator: 'IIM Incubator',
  university_incubator: 'University',
  government_incubator: 'Govt Incubator',
  corporate_accelerator: 'Corporate Accel',
  private_accelerator: 'Private Accel',
}

const CATEGORY_COLORS = {
  iit_incubator:         { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-200' },
  iim_incubator:         { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200' },
  university_incubator:  { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200' },
  government_incubator:  { bg: 'bg-yellow-50',  text: 'text-yellow-600',  border: 'border-yellow-200' },
  corporate_accelerator: { bg: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-200' },
  private_accelerator:   { bg: 'bg-rose-50',    text: 'text-rose-600',    border: 'border-rose-200' },
}

const AVATAR_GRADIENTS = [
  'from-violet-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-cyan-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
]

const CITY_COORDS = {
  mumbai: { x: 21, y: 56, label: 'Mumbai' },
  pune: { x: 23, y: 60, label: 'Pune' },
  begaluru: { x: 33, y: 77, label: 'Bengaluru' },
  bangalore: { x: 33, y: 77, label: 'Bengaluru' },
  delhi: { x: 35, y: 28, label: 'Delhi NCR' },
  ncr: { x: 35, y: 28, label: 'Delhi NCR' },
  noida: { x: 36, y: 28, label: 'Noida' },
  gurugram: { x: 34, y: 28, label: 'Gurugram' },
  kolkata: { x: 77, y: 49, label: 'Kolkata' },
  chennai: { x: 40, y: 81, label: 'Chennai' },
  hyderabad: { x: 38, y: 62, label: 'Hyderabad' },
  ahmedabad: { x: 18, y: 47, label: 'Ahmedabad' },
  jaipur: { x: 27, y: 34, label: 'Jaipur' },
}

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

// ── Incubator Card ─────────────────────────────────────────
function IncubatorCard({ incubator, index, applyingId, onApply, onClick }) {
  const bgClass = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const name = incubator.organizationName || 'Incubator'
  const initials = name.slice(0, 2).toUpperCase()
  const typeInfo = CATEGORY_COLORS[incubator.category] || CATEGORY_COLORS.iit_incubator
  const typeLabel = CATEGORY_LABELS[incubator.category] || (incubator.category || '').replace(/_/g, ' ')

  const cohortVal = incubator.alumniCount !== undefined && incubator.alumniCount !== null ? `${incubator.alumniCount} Startups` : 'Not Specified'
  const durationVal = incubator.duration || 'Not Specified'

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col group cursor-pointer"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden shadow-sm`}>
          {incubator.logo ? <img src={incubator.logo} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeInfo.bg} ${typeInfo.text} ${typeInfo.border}`}>
          {typeLabel}
        </span>
      </div>

      {/* Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate leading-tight">{name}</h3>
        {incubator.programName && (
          <p className="text-sm font-semibold text-violet-600 mb-2 truncate">{incubator.programName}</p>
        )}
        <p className="text-xs font-medium text-gray-500 line-clamp-2 min-h-[32px]">
          {incubator.description || 'No description specified.'}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 py-3 border-y border-gray-100 mb-5">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cohort Size</p>
          <p className="text-sm font-bold text-gray-900">{cohortVal}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
          <p className="text-sm font-bold text-gray-900">{durationVal}</p>
        </div>
      </div>

      {/* Benefits */}
      <ul className="space-y-2 mb-6 min-h-[72px]">
        {(incubator.benefits && incubator.benefits.length > 0) ? (
          incubator.benefits.slice(0, 3).map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> <span className="truncate">{b}</span>
            </li>
          ))
        ) : (
          <li className="text-xs font-medium text-gray-400 italic">No specific benefits listed.</li>
        )}
      </ul>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onApply(incubator._id, name)
        }}
        disabled={applyingId === incubator._id}
        className="w-full btn-secondary text-violet-600 hover:bg-violet-600 hover:text-white transition-colors"
      >
        {applyingId === incubator._id ? 'Submitting...' : 'Apply Now'}
      </button>
    </div>
  )
}

// ── Main Directory ─────────────────────────────────────────
export default function IncubatorsDirectory() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [incubators, setIncubators] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [applyingId, setApplyingId] = useState(null)
  const [viewType, setViewType] = useState('grid') 
  const [seeding, setSeeding] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)

  const fetchIncubators = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (selectedIndustry !== 'All') p.append('industry', selectedIndustry)
      if (selectedCategory !== 'All') p.append('category', selectedCategory)
      if (search) p.append('search', search)
      p.append('page', page); p.append('limit', 5)

      const { data } = await api.get(`/incubators?${p}`)
      if (data.success) {
        setIncubators(data.incubators || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedIndustry, selectedCategory])

  useEffect(() => {
    const t = setTimeout(fetchIncubators, 300)
    return () => clearTimeout(t)
  }, [fetchIncubators])

  const handleApply = async (id, name) => {
    if (!user) return navigate('/login')
    if (user.role !== 'founder') return toast.error('Only startup founders can apply.')
    try {
      setApplyingId(id)
      const res = await api.post(`/incubators/${id}/apply`)
      if (res.data.success) {
        toast.success(`Successfully applied to ${name}!`)
        setIncubators(prev => prev.map(inc => 
          inc._id === id ? { ...inc, applicationCount: (inc.applicationCount || 0) + 1 } : inc
        ))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.')
    } finally {
      setApplyingId(null)
    }
  }

  const handleCreateMockData = async () => {
    setSeeding(true);
    try {
      const mocks = [
        {
          organizationName: "Nexus Accelerate", programName: "Cohort 12 Venture Accelerator", category: "corporate_accelerator",
          description: "High-stakes acceleration for AI and DeepTech ventures seeking Seed funding.",
          duration: "16 Weeks", benefits: ["$250k Initial Investment", "Global Partner Network", "Dedicated CTO Mentorship"],
          city: "Mumbai", state: "Maharashtra", isFeatured: true
        },
        {
          organizationName: "Bloom Impact", programName: "ESG Impact Cohort 2026", category: "corporate_accelerator",
          description: "Supporting scalable solutions for the world's most pressing environmental issues.",
          duration: "24 Weeks", benefits: ["Equity-free Grants", "ESG Reporting Tools", "Impact Investor Access"],
          city: "Bengaluru", state: "Karnataka"
        },
      ];
      for (const m of mocks) await api.post('/incubators/admin/create', m);
      fetchIncubators();
    } catch (err) {
      toast.error('Seeding mock profiles failed. Make sure you are logged in as super_admin.');
    } finally {
      setSeeding(false);
    }
  };

  const anyFilter = selectedIndustry !== 'All' || selectedCategory !== 'All'
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Startup Incubators</h1>
            <p className="text-sm text-gray-500 mt-1">
              Accelerate your growth with world-class mentorship and capital.
            </p>
          </div>
          
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
            <button 
              onClick={() => setViewType('grid')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${viewType === 'grid' ? 'bg-violet-100 text-violet-700' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Grid size={14} /> Grid
            </button>
            <button 
              onClick={() => setViewType('map')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border-none cursor-pointer ${viewType === 'map' ? 'bg-violet-100 text-violet-700' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Map size={14} /> Map
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-400 mr-2" />
            <FilterPill label="Industry" options={INDUSTRIES} value={selectedIndustry} onChange={v => { setSelectedIndustry(v); setPage(1) }} labelMap={INDUSTRY_LABELS} />
            <FilterPill label="Category" options={CATEGORIES} value={selectedCategory} onChange={v => { setSelectedCategory(v); setPage(1) }} labelMap={CATEGORY_LABELS} />
            {anyFilter && (
              <button onClick={() => { setSelectedIndustry('All'); setSelectedCategory('All'); setPage(1) }} className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-2 py-1 bg-transparent border-none cursor-pointer">
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

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-[440px] rounded-2xl" />)}
          </div>
        ) : incubators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No programs found</h3>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
            {user?.role === 'super_admin' ? (
              <button onClick={handleCreateMockData} disabled={seeding} className="btn-primary">
                {seeding ? 'Initializing...' : 'Seed Sample Programs'}
              </button>
            ) : (
              <button onClick={() => { setSearch(''); setSelectedIndustry('All'); setSelectedCategory('All') }} className="btn-secondary">Clear Filters</button>
            )}
          </div>
        ) : (
          <>
            {viewType === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incubators.map((inc, i) => (
                  <IncubatorCard 
                    key={inc._id} 
                    incubator={inc} 
                    index={i} 
                    applyingId={applyingId} 
                    onApply={handleApply}
                    onClick={() => navigate(`/incubators/${inc.slug}`)}
                  />
                ))}
              </div>
            ) : (
              /* Map View Placeholder */
              <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative shadow-inner">
                  <div className="text-center">
                    <Map size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Interactive Map</h3>
                    <p className="text-sm text-gray-500">Map visualization component is active</p>
                  </div>
                </div>
                <div className="w-full lg:w-96 bg-white border border-gray-100 rounded-2xl p-4 md:p-6 flex flex-col shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    {selectedCity ? `${CITY_COORDS[selectedCity]?.label || selectedCity} Programs` : 'All Programs'}
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {incubators.map(inc => (
                      <div key={inc._id} onClick={() => navigate(`/incubators/${inc.slug}`)} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-violet-200 hover:shadow-sm transition-all cursor-pointer">
                        <p className="text-sm font-bold text-gray-900 mb-1">{inc.organizationName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{inc.programName || inc.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
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

      </div>
    </DashboardLayout>
  )
}