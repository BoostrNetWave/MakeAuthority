import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Building2, Eye, TrendingUp, Star, MapPin,
  ChevronRight, Sparkles, Briefcase, Clock
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

const STAGE_COLORS = {
  idea:     { bg: 'bg-violet-100', color: 'text-violet-700' },
  pre_seed: { bg: 'bg-blue-100', color: 'text-blue-700' },
  seed:     { bg: 'bg-emerald-100', color: 'text-emerald-700' },
  series_a: { bg: 'bg-amber-100', color: 'text-amber-700' },
  series_b: { bg: 'bg-red-100',  color: 'text-red-700' },
  growth:   { bg: 'bg-pink-100', color: 'text-pink-700' },
}

const ICON_GRADIENTS = [
  'from-violet-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-cyan-500 to-blue-500',
  'from-purple-500 to-indigo-500',
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Shimmer({ h = 'h-3.5', w = 'w-full', r = 'rounded-md', mb = '' }) {
  return (
    <div className={`${h} ${w} ${r} ${mb} bg-gray-100 animate-pulse`} />
  )
}

function KpiCard({ label, value, sub, icon: Icon, accentClass, loading }) {
  return (
    <div className="card p-4 md:p-6 relative overflow-hidden group hover:border-violet-200 transition-all">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClass} bg-opacity-10`}>
          <Icon size={18} className={accentClass.replace('bg-', 'text-').split(' ')[0]} strokeWidth={2.5} />
        </div>
      </div>
      <div className="relative z-10">
        {loading
          ? <Shimmer h="h-9" w="w-16" r="rounded-lg" />
          : <div className="text-3xl font-black text-gray-900 tracking-tight leading-none">{value}</div>
        }
        {sub && !loading && (
          <div className="text-xs text-gray-500 mt-2 font-medium">{sub}</div>
        )}
      </div>
    </div>
  )
}

function StartupCard({ startup, index, onView }) {
  const stage = STAGE_COLORS[startup.fundingStage] || STAGE_COLORS.seed
  const initials = startup.startupName?.slice(0, 2).toUpperCase() || 'ST'
  const gradient = ICON_GRADIENTS[index % ICON_GRADIENTS.length]

  return (
    <div 
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-violet-200 hover:shadow-sm cursor-pointer transition-all group"
      onClick={() => onView(startup.slug)}
    >
      {/* Logo */}
      <div className={`w-12 h-12 rounded-xl shrink-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-black text-white shadow-md overflow-hidden`}>
        {startup.logo
          ? <img src={startup.logo} alt="" className="w-full h-full object-cover" />
          : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900 mb-1 truncate">
          {startup.startupName}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="capitalize">{startup.industry}</span>
          {startup.city && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {startup.city}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Stage + arrow */}
      <div className="flex items-center gap-3 shrink-0">
        {startup.matchScore !== undefined && (
          <span 
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${startup.matchScore >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : startup.matchScore >= 75 ? 'bg-violet-50 text-violet-600 border-violet-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}
            title="AI Match Score"
          >
            {startup.matchScore}% Match
          </span>
        )}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${stage.bg} ${stage.color} border-current/20`}>
          {startup.fundingStage?.replace('_', ' ')}
        </span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-500 transition-colors" />
      </div>
    </div>
  )
}

export default function InvestorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.name?.split(' ')[0] || 'Investor'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [profRes, startupsRes] = await Promise.allSettled([
        api.get('/profile/investor/me'),
        api.get('/matchmaking/startups?limit=4'),
      ])

      if (profRes.status === 'fulfilled' && profRes.value.data.success)
        setProfile(profRes.value.data.profile)

      if (startupsRes.status === 'fulfilled' && startupsRes.value.data.success) {
        setStartups(startupsRes.value.data.startups || [])
      } else {
        try {
          const fallbackRes = await api.get('/startups?limit=4')
          if (fallbackRes.data.success) {
            setStartups(fallbackRes.data.startups || [])
          }
        } catch (err) {
          console.error('Fallback startups fetch failed:', err)
        }
      }
    } catch (e) {
      console.error('Investor dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 md:p-12 max-w-7xl mx-auto w-full">

        {/* ── HERO ── */}
        <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-10 flex flex-col md:flex-row items-center justify-between mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-blue-50/50 pointer-events-none" />
          <div className="relative z-10 mb-6 md:mb-0">
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-2">{greeting()},</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-3">
              {firstName} <span className="animate-wave text-2xl">👋</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed font-medium">
              {profile
                ? `You have ${startups.filter(s => s.fundingStage === 'seed' || s.fundingStage === 'pre_seed').length} startups matching your investment thesis today.`
                : 'Complete your investor profile to get matched with the best startups.'}
            </p>
          </div>

          {/* Strength score */}
          {profile && (
            <div className="relative z-10 text-center shrink-0">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg shadow-violet-200/50 relative"
                style={{ background: `conic-gradient(#8b5cf6 ${(profile.investorStrengthScore || 0) * 3.6}deg, #f3f4f6 0)` }}
              >
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center absolute">
                  <span className="text-xl font-black text-gray-900">{profile.investorStrengthScore || 0}%</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Investor Score
              </div>
            </div>
          )}
        </div>

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard label="Portfolio Cos."  value={loading ? '—' : profile?.portfolioCompanies?.length || 0}    sub="Active investments"    icon={Building2}   accentClass="bg-violet-500 text-violet-500" loading={loading} />
          <KpiCard label="Startups Viewed" value={loading ? '—' : profile?.profileViews || 0}                  sub="Profile impressions"   icon={Eye}         accentClass="bg-blue-500 text-blue-500" loading={loading} />
          <KpiCard label="Deals Reviewed"  value={loading ? '—' : startups.length}                             sub="This session"          icon={TrendingUp}  accentClass="bg-emerald-500 text-emerald-500" loading={loading} />
          <KpiCard label="Strength Score"  value={loading ? '—' : `${profile?.investorStrengthScore || 0}/100`} sub="Profile completeness" icon={Star}        accentClass="bg-amber-500 text-amber-500" loading={loading} />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Startup Deal Flow */}
          <div className="card p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={20} className="text-violet-500" /> Deal Flow
              </h2>
              <button onClick={() => navigate('/startups')} className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
                Browse All <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {loading
                ? [1,2,3].map(i => <Shimmer key={i} h="h-20" w="w-full" r="rounded-xl" />)
                : startups.length === 0
                  ? <div className="text-center py-12 text-gray-400 text-sm font-medium">No startups available</div>
                  : startups.slice(0, 4).map((s, i) => (
                      <StartupCard key={s._id} startup={s} index={i} onView={slug => navigate(`/startups/${slug}`)} />
                    ))
              }
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="card p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" /> My Preferences
              </h2>
              <button onClick={() => navigate('/profile/investor/edit')} className="text-xs font-bold text-violet-600 hover:text-violet-700">
                Edit
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4].map(i => <Shimmer key={i} h="h-12" />)}
              </div>
            ) : !profile ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">💼</div>
                <div className="text-base font-bold text-gray-900 mb-2">No profile yet</div>
                <div className="text-sm text-gray-500 mb-6 font-medium">Set up your investor profile to get matched</div>
                <button onClick={() => navigate('/profile/investor/create')} className="btn-primary inline-flex">
                  Create Profile
                </button>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Ticket Size */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ticket Size</div>
                  <div className="text-xl font-black text-gray-900 tracking-tight">
                    {profile.ticketSizeMin && profile.ticketSizeMax
                      ? `$${(profile.ticketSizeMin/100000).toFixed(0)}L – $${(profile.ticketSizeMax/100000).toFixed(0)}L`
                      : 'Not set'}
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Industries</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.industriesOfInterest?.length > 0
                      ? profile.industriesOfInterest.map(ind => (
                          <span key={ind} className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full capitalize">{ind}</span>
                        ))
                      : <span className="text-sm text-gray-400">Not set</span>
                    }
                  </div>
                </div>

                {/* Stages */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Investment Stages</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.investmentStages?.length > 0
                      ? profile.investmentStages.map(s => (
                          <span key={s} className="text-xs font-bold px-3 py-1 bg-violet-50 text-violet-600 border border-violet-100 rounded-full capitalize">{s.replace('_', ' ')}</span>
                        ))
                      : <span className="text-sm text-gray-400">Not set</span>
                    }
                  </div>
                </div>

                {/* Geography */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Geography</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.geographicPreference?.map(g => (
                      <span key={g} className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full capitalize">{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PORTFOLIO COMPANIES ── */}
        {profile?.portfolioCompanies?.length > 0 && (
          <div className="card p-4 md:p-8 mb-8">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Building2 size={20} className="text-amber-500" /> Portfolio Companies ({profile.portfolioCompanies.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.portfolioCompanies.map((co, i) => {
                const gradient = ICON_GRADIENTS[i % ICON_GRADIENTS.length]
                return (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className={`w-10 h-10 rounded-lg shrink-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-black text-white shadow-sm`}>
                      {co.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 truncate">{co.name}</div>
                      <div className="text-xs font-medium text-gray-500">
                        {co.stage?.replace('_', ' ')} {co.year ? `· ${co.year}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CTA — Complete Profile ── */}
        {!profile && !loading && (
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-4 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-violet-200">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h2 className="text-2xl font-black text-white mb-2">
                Set up your investor profile
              </h2>
              <p className="text-sm text-violet-100 max-w-lg font-medium leading-relaxed">
                Add your investment thesis, ticket size, and portfolio to get matched with the best startups in the ecosystem.
              </p>
            </div>
            <button onClick={() => navigate('/profile/investor/create')} className="bg-white text-violet-700 hover:bg-gray-50 font-bold px-6 py-3 rounded-xl shadow-sm whitespace-nowrap transition-colors">
              Create Profile →
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(14deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(10deg); }
          70% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </DashboardLayout>
  )
}