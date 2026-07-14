import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Bookmark, CheckCircle,
  AlertCircle, Clock, FileText, ExternalLink,
  Sparkles, Plus, Bell, Compass, LayoutGrid,
  Wrench, BarChart2, Users, Settings,
  HelpCircle, LogOut, ChevronRight,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

const CATEGORY_LABELS = {
  government:    'Government',
  csr:           'CSR Fund',
  women_founder: 'Women in Tech',
  technology:    'Tech / AI',
  startup:       'Startup',
  research:      'Research',
}

const CATEGORY_COLORS = {
  government:    { bg: 'bg-blue-50 text-blue-500 border-blue-200' },
  csr:           { bg: 'bg-emerald-50 text-emerald-500 border-emerald-200' },
  women_founder: { bg: 'bg-pink-50 text-pink-500 border-pink-200' },
  technology:    { bg: 'bg-violet-50 text-violet-500 border-violet-200' },
  startup:       { bg: 'bg-amber-50 text-amber-500 border-amber-200' },
  research:      { bg: 'bg-red-50 text-red-500 border-red-200' },
}

function SectionHeading({ children }) {
  return (
    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
      {children}
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 capitalize font-medium">
      {children}
    </span>
  )
}

function daysUntil(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function DeadlineBadge({ deadline, isRolling }) {
  if (isRolling) return (
    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
      Rolling deadline
    </span>
  )
  const days = daysUntil(deadline)
  if (!days) return null
  if (days < 0) return (
    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
      <AlertCircle size={12} /> Expired
    </span>
  )
  if (days <= 7) return (
    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
      <AlertCircle size={12} /> {days} days left — Urgent!
    </span>
  )
  if (days <= 30) return (
    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5">
      <Clock size={12} /> {days} days left
    </span>
  )
  return (
    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
      <Clock size={12} /> {days} days left
    </span>
  )
}

function formatAmount(min, max) {
  const fmt = n => {
    if (!n) return null
    if (n >= 10_000_000) return `$${(n/10_000_000).toFixed(1)}M`
    if (n >= 100_000)    return `$${(n/100_000).toFixed(0)}L`
    return `$${n.toLocaleString()}`
  }
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  if (max) return `Up to ${fmt(max)}`
  return 'Varies'
}

function LoadingSkeleton() {
  const bar = (w, h = 'h-3.5', mb = 'mb-0') => (
    <div className={`w-[${w}] ${h} ${mb} rounded-md bg-gray-200 animate-pulse`} />
  )
  return (
    <div className="p-5 md:p-10">
      <div className="flex gap-5 mb-8">
        <div className="flex-1">
          {bar('45%', 'h-7', 'mb-3')}
          {bar('30%', 'h-3.5', 'mb-2')}
          {bar('70%', 'h-3')}
        </div>
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="mb-5">
          {bar('30%', 'h-3', 'mb-3')}
          {bar('95%', 'h-3.5', 'mb-1.5')}
          {bar('88%', 'h-3.5')}
        </div>
      ))}
    </div>
  )
}

function NotFound({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 md:p-10 text-center">
      <div className="text-5xl">💰</div>
      <div className="text-xl font-bold text-gray-900">Grant not found</div>
      <div className="text-sm text-gray-500 max-w-xs font-medium">
        This grant may have expired or the link is incorrect.
      </div>
      <button onClick={onBack} className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200">
        ← Back to Grants
      </button>
    </div>
  )
}

export default function GrantDetail() {
  const { slug }         = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()

  const [grant,      setGrant]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [checking,   setChecking]   = useState(false)
  const [eligibility, setEligibility] = useState(null)
  const [applying,   setApplying]   = useState(false)
  const [applied,    setApplied]    = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setNotFound(false)
      try {
        const { data } = await api.get(`/grants/${slug}`)
        if (data.success) {
          setGrant(data.grant)
          try {
            const bm = await api.get('/grants/bookmarks/me')
            if (bm.data.success) {
              setBookmarked(bm.data.bookmarks.some(g => g._id === data.grant._id))
            }
          } catch { /* not logged in */ }
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleBookmark = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const { data } = await api.post(`/grants/${grant._id}/bookmark`)
      if (data.success) setBookmarked(data.bookmarked)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCheckEligibility = async () => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'founder') {
      toast.error('Only founders can check eligibility.')
      return
    }
    setChecking(true)
    try {
      const { data } = await api.post(`/grants/${slug}/check-eligibility`)
      if (data.success) setEligibility(data)
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'founder') {
      toast.error('Only founders can apply for grants.')
      return
    }
    setApplying(true)
    try {
      const { data } = await api.post('/applications', {
        targetType: 'grant',
        grant: grant._id,
      })
      if (data.success) setApplied(true)
    } catch (err) {
      console.error(err)
    } finally {
      setApplying(false)
    }
  }

  const catInfo  = CATEGORY_COLORS[grant?.category] || CATEGORY_COLORS.startup
  const catLabel = CATEGORY_LABELS[grant?.category]  || grant?.category

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSkeleton />
      </DashboardLayout>
    )
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <NotFound onBack={() => navigate('/grants')} />
      </DashboardLayout>
    )
  }

  if (!grant) return null

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <button 
          onClick={() => navigate('/grants')} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ArrowLeft size={16} /> Back to Grants Database
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── LEFT COLUMN ─────────────────────────── */}
          <div className="min-w-0 flex flex-col gap-6">

            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm relative overflow-hidden">
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${catInfo.bg}`}>
                      {catLabel}
                    </span>
                    <DeadlineBadge deadline={grant.deadline} isRolling={grant.isRollingDeadline} />
                    {grant.isFeatured && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                        ⭐ Featured
                      </span>
                    )}
                    {grant.womenFoundersOnly && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-pink-50 text-pink-500 border border-pink-200">
                        ♀ Women Founders Only
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">
                    {grant.grantName}
                  </h1>
                  <p className="text-base text-gray-500 font-medium">
                    by <strong className="text-gray-700">{grant.organization}</strong>
                  </p>
                </div>
                
                <button 
                  onClick={handleBookmark} 
                  className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${bookmarked ? 'bg-violet-50 border-violet-200 text-violet-600 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'}`}
                >
                  <Bookmark size={20} fill={bookmarked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                {[
                  { label: 'Funding Amount', value: formatAmount(grant.fundingAmountMin, grant.fundingAmountMax) },
                  { label: 'Deadline',        value: grant.isRollingDeadline ? 'Rolling' : grant.deadline ? new Date(grant.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Open' },
                  { label: 'Bookmarks',       value: grant.bookmarkCount || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
                    <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>
                  </div>
                ))}
              </div>

              {/* Website link */}
              {grant.officialWebsite && (
                <a href={grant.officialWebsite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-bold transition-colors">
                  <Globe size={16} /> {grant.officialWebsite} <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
              <SectionHeading>About this Grant</SectionHeading>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {grant.description}
              </p>
            </div>

            {/* Eligibility */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
              <SectionHeading>Eligibility Criteria</SectionHeading>
              <p className="text-sm text-gray-700 leading-relaxed font-medium mb-6">
                {grant.eligibility}
              </p>

              {/* Eligible stages */}
              {grant.eligibleStages?.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Eligible Stages</div>
                  <div className="flex gap-2 flex-wrap">
                    {grant.eligibleStages.map(s => <Tag key={s}>{s.replace('_', ' ')}</Tag>)}
                  </div>
                </div>
              )}

              {/* Eligible industries */}
              {grant.eligibleIndustries?.length > 0 && !grant.eligibleIndustries.includes('all') && (
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Eligible Industries</div>
                  <div className="flex gap-2 flex-wrap">
                    {grant.eligibleIndustries.map(i => <Tag key={i}>{i}</Tag>)}
                  </div>
                </div>
              )}
            </div>

            {/* Application process */}
            {grant.applicationProcess && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Application Process</SectionHeading>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {grant.applicationProcess}
                </p>
              </div>
            )}

            {/* Required documents */}
            {grant.requiredDocuments?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Required Documents</SectionHeading>
                <div className="flex flex-col gap-3">
                  {grant.requiredDocuments.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <FileText size={16} className="text-violet-500 shrink-0" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────── */}
          <div className="flex flex-col gap-6 sticky top-8">

            {/* Apply CTA */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <div className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                {formatAmount(grant.fundingAmountMin, grant.fundingAmountMax)}
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
                {grant.equityRequired
                  ? `${grant.equityPercentage || 'Some'}% equity required`
                  : 'Non-dilutive — no equity'}
              </div>

              {/* Apply button */}
              <button 
                onClick={handleApply} 
                disabled={applying || applied} 
                className={`w-full py-3.5 rounded-xl text-sm font-bold mb-3 transition-colors shadow-sm flex items-center justify-center gap-2
                  ${applied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
              >
                {applying ? 'Submitting...' : applied ? '✓ Application Tracked' : 'Track Application →'}
              </button>

              {/* Official apply link */}
              {grant.applyUrl && (
                <a href={grant.applyUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold transition-colors">
                  <ExternalLink size={16} /> Apply on Official Site
                </a>
              )}
            </div>

            {/* AI Eligibility checker */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-violet-500" />
                <div className="text-base font-bold text-gray-900">AI Eligibility Check</div>
              </div>
              <div className="text-sm text-gray-500 font-medium mb-6">
                Instantly check if your startup qualifies for this grant based on your profile.
              </div>

              {/* Result */}
              {eligibility && (
                <div className={`p-4 rounded-xl mb-4 border ${eligibility.eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <div className={`text-sm font-bold mb-3 ${eligibility.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                    {eligibility.eligible ? '✓ You may be eligible!' : '✗ Not eligible'}
                  </div>
                  {eligibility.reasons?.map((r, i) => (
                    <div key={i} className="text-xs text-gray-600 font-medium leading-relaxed mb-1.5 flex items-start gap-1.5">
                      <span className="text-gray-400 mt-0.5">•</span> {r}
                    </div>
                  ))}
                </div>
              )}

              <button 
                onClick={handleCheckEligibility} 
                disabled={checking} 
                className="w-full py-3 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles size={16} />
                {checking ? 'Checking...' : eligibility ? 'Check Again' : 'Check My Eligibility'}
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <SectionHeading>Grant Details</SectionHeading>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Organization',   value: grant.organization },
                  { label: 'Category',        value: catLabel },
                  { label: 'Equity Required', value: grant.equityRequired ? 'Yes' : 'No' },
                  { label: 'Applications',    value: grant.bookmarkCount || 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}