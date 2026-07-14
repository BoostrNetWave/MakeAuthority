import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Link2, AtSign, Camera,
  MapPin, Users, TrendingUp, Bookmark,
  CheckCircle, ExternalLink, Play, ChevronRight,
  Plus, Bell, Compass, LayoutGrid, Wrench,
  BarChart2, Settings, HelpCircle, LogOut,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

// ── Constants ─────────────────────────────────────────────
const STAGE_LABELS = {
  idea: 'Idea', pre_seed: 'Pre-Seed', seed: 'Seed',
  series_a: 'Series A', series_b: 'Series B',
  series_c: 'Series C', growth: 'Late Stage', profitable: 'Profitable',
}
const REVENUE_LABELS = {
  pre_revenue: 'Pre-Revenue', early_revenue: 'Early Revenue',
  growing: 'Growing', scaling: 'Scaling', profitable: 'Profitable',
}
const ICON_GRADIENTS = [
  'from-violet-600 to-fuchsia-600',
  'from-emerald-600 to-teal-500',
  'from-blue-600 to-indigo-500',
  'from-cyan-600 to-sky-500',
  'from-orange-600 to-amber-500',
  'from-pink-600 to-rose-500',
  'from-indigo-600 to-blue-500',
  'from-green-600 to-emerald-500',
]

// ── Helpers ───────────────────────────────────────────────
function fmt(n) {
  if (!n) return null
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`
  return `₹${n.toLocaleString()}`
}

// ── Section heading ───────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </div>
  )
}

// ── Tag pill ──────────────────────────────────────────────
function Tag({ children }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 capitalize font-medium">
      {children}
    </span>
  )
}

// ── Social link button ────────────────────────────────────
function SocialBtn({ href, icon: Icon, label }) {
  if (!href) return null
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <Icon size={16} /> {label}
    </a>
  )
}

// ── Loading skeleton ──────────────────────────────────────
function LoadingSkeleton() {
  const bar = (w, h = 'h-3.5', mb = 'mb-0') => (
    <div className={`w-[${w}] ${h} ${mb} rounded-md bg-gray-200 animate-pulse`} />
  )
  return (
    <div className="p-5 md:p-10">
      <div className="flex gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1">
          {bar('55%', 'h-7', 'mb-3')}
          {bar('35%', 'h-3.5', 'mb-2')}
          {bar('80%', 'h-3')}
        </div>
      </div>
      {bar('100%', 'h-px', 'mb-6')}
      {[1,2,3].map(i => <div key={i} className="mb-5">{bar('30%', 'h-3', 'mb-3')}{bar('95%', 'h-3.5', 'mb-1.5')}{bar('88%', 'h-3.5')}</div>)}
    </div>
  )
}

// ── 404 State ─────────────────────────────────────────────
function NotFound({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 md:p-10 text-center">
      <div className="text-5xl">🔍</div>
      <div className="text-xl font-bold text-gray-900">Startup not found</div>
      <div className="text-sm text-gray-500 max-w-xs font-medium">
        This startup may not be approved yet or the link is incorrect.
      </div>
      <button onClick={onBack} className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200">
        ← Back to Directory
      </button>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function StartupDetail() {
  const { slug }           = useParams()
  const navigate           = useNavigate()
  const { user }           = useAuth()

  const [startup,  setStartup]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setNotFound(false)
      try {
        const { data } = await api.get(`/startups/${slug}`)
        if (data.success) setStartup(data.startup)
        else              setNotFound(true)
      } catch (e) {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const handleSave = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const { data } = await api.post(`/startups/${startup._id}/save`)
      if (data.success) setSaved(data.saved)
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  // Pick a consistent gradient based on startup name
  const gradIdx = startup ? startup.startupName.charCodeAt(0) % ICON_GRADIENTS.length : 0
  const gradientClass = ICON_GRADIENTS[gradIdx]
  const logoInitials = startup?.startupName?.slice(0, 2).toUpperCase() || 'ST'

  if (loading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>
  if (notFound) return <DashboardLayout><NotFound onBack={() => navigate('/startups')} /></DashboardLayout>
  if (!startup) return null

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <button 
          onClick={() => navigate('/startups')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── LEFT COLUMN ─────────────────────────── */}
          <div className="min-w-0 flex flex-col gap-6">

            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">

              {/* Top row: logo + name + badges */}
              <div className="flex gap-6 items-start mb-8">
                {/* Logo */}
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-sm overflow-hidden ${startup.logo ? 'bg-black' : `bg-gradient-to-br ${gradientClass}`}`}>
                  {startup.logo
                    ? <img src={startup.logo} alt={startup.startupName} className="w-full h-full object-cover" />
                    : logoInitials}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">
                      {startup.startupName}
                    </h1>
                    {startup.isVerified && (
                      <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  {startup.tagline && (
                    <p className="text-sm text-gray-500 font-medium mb-4 leading-relaxed">
                      {startup.tagline}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {/* Industry badge */}
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 capitalize tracking-wider">
                      {startup.industry}
                    </span>
                    {/* Stage badge */}
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 uppercase tracking-wider">
                      {STAGE_LABELS[startup.fundingStage] || startup.fundingStage}
                    </span>
                    {/* Location */}
                    {startup.city && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 flex items-center gap-1.5 uppercase tracking-wider">
                        <MapPin size={12} /> {startup.city}{startup.state ? `, ${startup.state}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-[1px] bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                {[
                  { label: 'Funding Raised', value: fmt(startup.fundingRaised) || '—' },
                  { label: 'Funding Target', value: fmt(startup.fundingRequired) || '—' },
                  { label: 'Team Size',       value: startup.teamSize ? `${startup.teamSize} people` : '—' },
                  { label: 'Profile Views',   value: startup.profileViews?.toLocaleString() || '0' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
                    <div className="text-base font-bold text-gray-900 tracking-tight">{value}</div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-3 flex-wrap">
                <SocialBtn href={startup.website}  icon={Globe}   label="Website" />
                <SocialBtn href={startup.linkedin}  icon={Link2}   label="LinkedIn" />
                <SocialBtn href={startup.twitter}   icon={AtSign}  label="Twitter" />
                <SocialBtn href={startup.instagram} icon={Camera}  label="Instagram" />
              </div>
            </div>

            {/* About */}
            {startup.description && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>About</SectionHeading>
                <p className="text-sm text-gray-700 leading-relaxed font-medium m-0 whitespace-pre-wrap">
                  {startup.description}
                </p>
              </div>
            )}

            {/* Tech Stack */}
            {startup.techStack?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Tech Stack</SectionHeading>
                <div className="flex gap-2 flex-wrap">
                  {startup.techStack.map(t => <Tag key={t}>{t}</Tag>)}
                </div>
              </div>
            )}

            {/* Team */}
            {startup.teamMembers?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Team ({startup.teamMembers.length})</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {startup.teamMembers.map((m, i) => {
                    const tgradientClass = ICON_GRADIENTS[i % ICON_GRADIENTS.length]
                    return (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-sm font-extrabold text-white overflow-hidden ${m.avatar ? 'bg-black' : `bg-gradient-to-br ${tgradientClass}`}`}>
                          {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : m.name?.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-gray-900 truncate">{m.name}</div>
                          <div className="text-xs text-gray-500 font-medium truncate mt-0.5">{m.role}</div>
                        </div>
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 p-1">
                            <Link2 size={16} />
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Video pitch */}
            {startup.videoPitch && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Video Pitch</SectionHeading>
                <a href={startup.videoPitch} target="_blank" rel="noreferrer"
                  className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-violet-50 hover:border-violet-200 transition-colors group text-decoration-none"
                >
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                    <Play size={20} className="text-red-500 ml-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 mb-0.5">Watch Pitch Video</div>
                    <div className="text-xs text-gray-500 font-medium truncate">{startup.videoPitch}</div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-violet-500 shrink-0 mx-2" />
                </a>
              </div>
            )}

            {/* Revenue stage */}
            {startup.revenueStage && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Revenue Stage</SectionHeading>
                <span className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 tracking-wider">
                  {REVENUE_LABELS[startup.revenueStage] || startup.revenueStage}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN (Sidebar) ───────────────── */}
          <div className="flex flex-col gap-6 sticky top-8">

            {/* CTA Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <div className="text-lg font-extrabold text-gray-900 mb-2">Interested?</div>
              <div className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                Connect with {startup.startupName} to explore investment or partnership opportunities.
              </div>
              
              {/* Connect → opens LinkedIn or mailto */}
              <button
                onClick={() => {
                  if (startup.linkedin) {
                    window.open(startup.linkedin, '_blank')
                  } else {
                    window.open(`mailto:?subject=Connecting with ${startup.startupName}`, '_blank')
                  }
                }}
                className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-sm shadow-violet-200 transition-colors flex items-center justify-center gap-2 mb-3"
              >
                Connect <ChevronRight size={16} />
              </button>

              {/* Save Startup — toggles on/off */}
              <button
                onClick={handleSave}
                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border
                  ${saved ? 'bg-violet-50 border-violet-200 text-violet-600' : 'bg-transparent border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? 'text-violet-500' : ''} />
                {saved ? '✓ Saved' : 'Save Startup'}
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <SectionHeading>Quick Info</SectionHeading>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Founded',      value: startup.createdAt ? new Date(startup.createdAt).getFullYear() : '—' },
                  { label: 'Country',      value: startup.country || 'India' },
                  { label: 'Team Size',    value: startup.teamSize ? `${startup.teamSize} members` : '—' },
                  { label: 'Stage',        value: STAGE_LABELS[startup.fundingStage] || '—' },
                  { label: 'Profile Views',value: startup.profileViews?.toLocaleString() || '0' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pitch Deck */}
            {startup.pitchDeck && (
              <a href={startup.pitchDeck} target="_blank" rel="noreferrer"
                className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-3xl hover:border-violet-300 transition-colors group text-decoration-none shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <TrendingUp size={20} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 mb-0.5">View Pitch Deck</div>
                  <div className="text-xs text-gray-500 font-medium">PDF Document</div>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-violet-500 shrink-0 mx-2" />
              </a>
            )}

            {/* Profile Completion */}
            {startup.completionScore > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Completeness</span>
                  <span className={`text-sm font-extrabold ${startup.completionScore >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {startup.completionScore}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${startup.completionScore >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} 
                    style={{ width: `${startup.completionScore}%` }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
