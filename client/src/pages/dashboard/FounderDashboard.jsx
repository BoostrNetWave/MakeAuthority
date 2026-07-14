import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Eye, Bookmark, Zap, Sparkles, Clock,
  ChevronRight, AlertCircle, CalendarDays, LayoutList, Briefcase
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'


function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysUntil(d) {
  if (!d) return null
  return Math.ceil((new Date(d) - new Date()) / 86400000)
}

function fmtAmount(min, max) {
  const f = n => {
    if (!n) return null
    if (n >= 10_000_000) return `$${(n / 10_000_000).toFixed(1)}M`
    if (n >= 100_000)    return `$${(n / 100_000).toFixed(0)}L`
    return `$${n.toLocaleString()}`
  }
  if (min && max) return `${f(min)} – ${f(max)}`
  if (min) return `${f(min)}+`
  if (max) return `Up to ${f(max)}`
  return 'Varies'
}


function KpiCard({ label, value, sub, icon: Icon, loading, color = 'violet' }) {
  const colors = {
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
  }
  const c = colors[color] || colors.violet

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={16} className={c.text} />
        </div>
      </div>
      {loading
        ? <div className="skeleton h-9 w-24 rounded-lg mb-2" />
        : <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      }
      {sub && !loading && <p className="text-xs text-gray-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  )
}


const STATUS = {
  submitted:    { bg: 'bg-amber-50 text-amber-700 border-amber-200',  label: 'Submitted' },
  under_review: { bg: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'In Review' },
  accepted:     { bg: 'bg-green-50 text-green-700 border-green-200',  label: 'Accepted' },
  funded:       { bg: 'bg-green-50 text-green-700 border-green-200',  label: 'Funded' },
  rejected:     { bg: 'bg-red-50 text-red-700 border-red-200',        label: 'Rejected' },
  withdrawn:    { bg: 'bg-gray-100 text-gray-500 border-gray-200',    label: 'Withdrawn' },
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.submitted
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg}`}>
      {s.label}
    </span>
  )
}


export default function FounderDashboard() {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const [profile,      setProfile]      = useState(null)
  const [appStats,     setAppStats]     = useState(null)
  const [applications, setApplications] = useState([])
  const [grants,       setGrants]       = useState([])
  const [investors,    setInvestors]    = useState([])
  const [serviceProposals, setServiceProposals] = useState([])
  const [loading,      setLoading]      = useState(true)

  const firstName = user?.name?.split(' ')[0] || 'Founder'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        api.get('/profile/founder/me'),
        api.get('/applications/stats'),
        api.get('/applications/me'),
        api.get('/grants?isActive=true&limit=4'),
        api.get('/matchmaking/investors?limit=3'),
        api.get('/services/proposals/me')
      ])
      if (results[0].status === 'fulfilled' && results[0].value.data.success) setProfile(results[0].value.data.profile)
      if (results[1].status === 'fulfilled' && results[1].value.data.success) setAppStats(results[1].value.data.stats)
      if (results[2].status === 'fulfilled' && results[2].value.data.success) setApplications(results[2].value.data.applications || [])
      if (results[3].status === 'fulfilled' && results[3].value.data.success) setGrants(results[3].value.data.grants || [])
      if (results[4].status === 'fulfilled' && results[4].value.data.success) {
        setInvestors(results[4].value.data.investors || [])
      } else {
        try {
          const fb = await api.get('/investors?limit=3')
          if (fb.data.success) setInvestors(fb.data.investors || [])
        } catch {}
      }
      if (results[5].status === 'fulfilled' && results[5].value.data.success) setServiceProposals(results[5].value.data.proposals || [])

    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const avatarColors = ['from-violet-500 to-indigo-500','from-emerald-500 to-teal-500','from-amber-500 to-orange-500','from-pink-500 to-rose-500']

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-7 max-w-7xl">


        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div>
              <p className="text-violet-200 text-sm font-medium mb-1">{greeting()},</p>
              <h1 className="text-3xl font-bold text-white mb-2">{firstName} 👋</h1>
              <p className="text-violet-200 max-w-lg text-sm leading-relaxed">
                {profile
                  ? `You have ${grants.filter(g => { const d = daysUntil(g.deadline); return d !== null && d <= 30 && d > 0 }).length} grant deadlines approaching. Let's maximize your startup's potential.`
                  : 'Welcome to Boostr! Set up your startup profile to get discovered by investors.'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {profile ? (
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: `conic-gradient(#fff ${(profile.completionScore||0)*3.6}deg, rgba(255,255,255,0.15) 0)` }}
                  >
                    <div className="w-14 h-14 rounded-full bg-violet-700 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{profile.completionScore || 0}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-violet-200 font-medium">Profile Strength</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/my-startup')}
                  className="bg-white text-violet-700 hover:bg-violet-50 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all cursor-pointer border-none flex items-center gap-2"
                >
                  Set Up Profile <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard label="Applications" value={loading ? '—' : appStats?.total ?? 0} sub={`${appStats?.accepted || 0} accepted`} icon={TrendingUp} loading={loading} color="violet" />
          <KpiCard label="Profile Views" value={loading ? '—' : profile?.investorViews ?? 0} sub="Impressions this week" icon={Eye} loading={loading} color="blue" />
          <KpiCard label="Saved Grants" value={loading ? '—' : profile?.bookmarkCount ?? 0} sub="Ready to apply" icon={Bookmark} loading={loading} color="green" />
          <KpiCard label="Match Score" value={loading ? '—' : `${profile?.completionScore ?? 0}%`} sub="Profile completeness" icon={Zap} loading={loading} color="amber" />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" /> AI Investor Matches
              </h2>
              <button onClick={() => navigate('/investors')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {loading
                ? [1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)
                : investors.length === 0
                  ? <p className="text-center text-gray-400 text-sm py-8">No investor matches yet</p>
                  : investors.map((inv, idx) => {
                    const name = inv.firmName || inv.user?.name || 'Investor'
                    const score = inv.matchScore
                    const scoreColor = score >= 90 ? 'text-green-600 bg-green-50' : score >= 75 ? 'text-violet-600 bg-violet-50' : 'text-amber-600 bg-amber-50'
                    return (
                      <div
                        key={inv._id}
                        onClick={() => navigate(`/investors/${inv._id}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden`}>
                          {inv.avatar ? <img src={inv.avatar} alt="" className="w-full h-full object-cover" /> : name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-500 capitalize">{(inv.investorType || 'Venture Capital').replace(/_/g, ' ')}</p>
                        </div>
                        {score !== undefined && (
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreColor}`}>{score}% Match</span>
                        )}
                      </div>
                    )
                  })
              }
            </div>
          </div>


          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> Grant Deadlines
              </h2>
              <button onClick={() => navigate('/grants')} className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 bg-transparent border-none cursor-pointer">
                Browse <ChevronRight size={14} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              {loading
                ? [1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)
                : grants.length === 0
                  ? <p className="text-center text-gray-400 text-sm py-8">No active grants found</p>
                  : grants.map(g => {
                    const days = daysUntil(g.deadline)
                    const urgent = !g.isRollingDeadline && days !== null && days <= 7
                    return (
                      <div
                        key={g._id}
                        onClick={() => navigate(`/grants/${g.slug}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${urgent ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                          {urgent ? <AlertCircle size={18} /> : <CalendarDays size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{g.grantName}</p>
                          <p className={`text-xs font-medium ${urgent ? 'text-red-500' : 'text-gray-400'}`}>
                            {g.isRollingDeadline ? 'Rolling deadline' : days ? `${days} days left` : 'Closed'}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg whitespace-nowrap">
                          {fmtAmount(g.fundingAmountMin, g.fundingAmountMax)}
                        </span>
                      </div>
                    )
                  })
              }
            </div>
          </div>
        </div>


        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <LayoutList size={16} className="text-blue-500" /> Application Tracker
            </h2>
            {appStats && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">{appStats.accepted || 0} Accepted</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">{appStats.underReview || 0} In Review</span>
              </div>
            )}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No active applications</h3>
                <p className="text-sm text-gray-500 mb-5">Start your fundraising journey by applying to grants or investors.</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => navigate('/grants')} className="btn-primary">Explore Grants</button>
                  <button onClick={() => navigate('/investors')} className="btn-secondary">Find Investors</button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pl-2">Target</th>
                      <th className="text-left pb-3">Type</th>
                      <th className="text-left pb-3">Status</th>
                      <th className="text-right pb-3 pr-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {applications.map(app => {
                      const isGrant = app.targetType === 'grant'
                      const name = isGrant ? app.grant?.grantName : app.investor?.firmName
                      const org  = isGrant ? app.grant?.organization : app.investor?.investorType?.replace(/_/g, ' ')
                      return (
                        <tr key={app._id} className="hover:bg-gray-50 rounded-xl transition-colors">
                          <td className="py-3 pl-2 pr-4">
                            <p className="text-sm font-semibold text-gray-900">{name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 capitalize">{org || '—'}</p>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isGrant ? 'text-green-700 bg-green-50' : 'text-violet-700 bg-violet-50'}`}>
                              {app.targetType}
                            </span>
                          </td>
                          <td className="py-3"><StatusBadge status={app.status} /></td>
                          <td className="py-3 text-xs text-gray-400 text-right pr-2">
                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-violet-500" /> Service Proposals
            </h2>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-2">{[1,2].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : serviceProposals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No service proposals</h3>
                <p className="text-sm text-gray-500 mb-5">You haven't requested any services from the marketplace yet.</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => navigate('/marketplace')} className="btn-primary">Browse Marketplace</button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pl-2">Service</th>
                      <th className="text-left pb-3">Budget</th>
                      <th className="text-left pb-3">Status</th>
                      <th className="text-right pb-3 pr-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {serviceProposals.map(prop => (
                      <tr key={prop._id} className="hover:bg-gray-50 rounded-xl transition-colors">
                        <td className="py-3 pl-2 pr-4">
                          <p className="text-sm font-semibold text-gray-900">{prop.service?.title || 'Unknown Service'}</p>
                          <p className="text-xs text-gray-500 capitalize">{prop.service?.category || '—'}</p>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-semibold text-gray-700">{prop.budget}</span>
                        </td>
                        <td className="py-3"><StatusBadge status={prop.status} /></td>
                        <td className="py-3 text-xs text-gray-400 text-right pr-2">
                          {new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}