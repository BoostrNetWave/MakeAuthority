import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ShieldCheck, FileText, TrendingUp,
  CheckCircle, XCircle, Bell, Search,
  RefreshCw, ChevronRight, AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, subGreen = true, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
          <Icon size={16} className="text-violet-600" />
        </div>
      </div>
      {loading
        ? <div className="skeleton h-9 w-24 rounded-lg mb-2" />
        : <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      }
      {sub && !loading && (
        <p className={`text-xs font-semibold mt-1.5 ${subGreen ? 'text-green-600' : 'text-red-500'}`}>{sub}</p>
      )}
    </div>
  )
}

// ── Growth Sparkline ─────────────────────────────────────────
function GrowthChart() {
  const pts = [20,35,28,45,60,55,75,85,78,95]
  const max = Math.max(...pts)
  const w = 260, h = 100, pad = 8
  const xs = pts.map((_,i) => pad + (i/(pts.length-1))*(w-pad*2))
  const ys = pts.map(p => h - pad - (p/max)*(h-pad*2))
  const pathD = xs.map((x,i) => `${i===0?'M':'L'}${x},${ys[i]}`).join(' ')
  const areaD = `${pathD} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="block">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#g1)" />
        <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {xs.map((x,i) => <circle key={i} cx={x} cy={ys[i]} r="2.5" fill="#8B5CF6" />)}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {['May','Jun','Jul','Aug','Sep','Oct'].map(m => (
          <span key={m} className="text-[10px] text-gray-400">{m}</span>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate         = useNavigate()
  const { user }         = useAuth()
  const [stats,            setStats]            = useState(null)
  const [startups,         setStartups]         = useState([])
  const [investors,        setInvestors]        = useState([])
  const [incubators,       setIncubators]       = useState([])
  const [serviceProviders, setServiceProviders] = useState([])
  const [loading,          setLoading]          = useState(true)
  const [actionLoading,    setActionLoading]    = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sR, stR, iR, incR, spR] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/pending-startups'),
        api.get('/admin/pending-investors'),
        api.get('/admin/pending-incubators'),
        api.get('/admin/pending-service-providers'),
      ])
      if (sR.status   === 'fulfilled' && sR.value.data.success)   setStats(sR.value.data.stats)
      if (stR.status  === 'fulfilled' && stR.value.data.success)  setStartups(stR.value.data.startups)
      if (iR.status   === 'fulfilled' && iR.value.data.success)   setInvestors(iR.value.data.investors)
      if (incR.status === 'fulfilled' && incR.value.data.success) setIncubators(incR.value.data.incubators)
      if (spR.status  === 'fulfilled' && spR.value.data.success)  setServiceProviders(spR.value.data.providers)
    } catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (type, id) => {
    setActionLoading(p => ({ ...p, [id]: true }))
    try {
      // Unified approve endpoint for investor, incubator, service_provider
      // Startup uses its own dedicated route
      const url = type === 'startup'
        ? `/startups/${id}/approve`
        : `/admin/users/${id}/approve`
      await api.patch(url)
      if (type === 'startup')          setStartups(p         => p.filter(x => x._id !== id))
      if (type === 'investor')         setInvestors(p        => p.filter(x => x._id !== id))
      if (type === 'incubator')        setIncubators(p       => p.filter(x => x._id !== id))
      if (type === 'service_provider') setServiceProviders(p => p.filter(x => x._id !== id))
      setStats(p => p ? { ...p, pendingVerifications: Math.max(0, p.pendingVerifications - 1) } : p)
    } catch(e){ console.error(e) }
    finally{ setActionLoading(p => ({ ...p, [id]: false })) }
  }

  const handleReject = async (type, id) => {
    setActionLoading(p => ({ ...p, [`r_${id}`]: true }))
    try {
      if (type === 'startup') { await api.patch(`/startups/${id}/reject`); setStartups(p => p.filter(x => x._id !== id)) }
    } catch(e){ console.error(e) }
    finally{ setActionLoading(p => ({ ...p, [`r_${id}`]: false })) }
  }

  const pending = [
    ...startups.map(s        => ({ ...s, kind: 'startup' })),
    ...investors.map(i       => ({ ...i, kind: 'investor' })),
    ...incubators.map(i      => ({ ...i, kind: 'incubator' })),
    ...serviceProviders.map(p=> ({ ...p, kind: 'service_provider' })),
  ].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-7 max-w-7xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Platform overview and verification queue</p>
          </div>
          <button
            onClick={load}
            className="btn-secondary"
            title="Refresh"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={Users}       label="Total Users"         value={loading ? '—' : (stats?.totalUsers || 0).toLocaleString()}              sub="+12% this month" loading={loading} />
          <StatCard icon={ShieldCheck} label="Pending Reviews"     value={loading ? '—' : stats?.pendingVerifications || 0}                        sub={`${stats?.pendingVerifications || 0} need action`} subGreen={false} loading={loading} />
          <StatCard icon={FileText}    label="Total Grants"        value={loading ? '—' : (stats?.totalGrants || 0).toLocaleString()}              sub="Active listings" loading={loading} />
          <StatCard icon={TrendingUp}  label="Applications"        value={loading ? '—' : (stats?.totalApplications || 0).toLocaleString()}       sub="+8% this week" loading={loading} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Verification Queue — 2 cols */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Verification Queue</h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pending.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {pending.length} pending
              </span>
            </div>

            <div className="divide-y divide-gray-50">
              {loading ? (
                <div className="p-4 md:p-6 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-3">
                    <CheckCircle size={22} className="text-green-500" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">All caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending verifications.</p>
                </div>
              ) : (
                pending.map(item => {
                  const isStartup         = item.kind === 'startup'
                  const isIncubator        = item.kind === 'incubator'
                  const isServiceProvider  = item.kind === 'service_provider'
                  const name = isStartup
                    ? (item.startupName || item.name)
                    : isIncubator
                    ? (item.organizationName || item.name)
                    : (item.firmName || item.name)   // investor / service_provider
                  const sub  = isStartup
                    ? (item.city || 'India')
                    : isIncubator
                    ? (item.city || 'India')
                    : isServiceProvider
                    ? 'Service Provider'
                    : (item.investorType?.replace(/_/g,' ') || 'Investor')
                  const industry = isStartup
                    ? (item.industry || '—')
                    : isIncubator
                    ? (item.category?.replace(/_/g,' ') || 'Incubator')
                    : isServiceProvider
                    ? 'Marketplace'
                    : (item.industriesOfInterest?.[0] || '—')
                  const approving = actionLoading[item._id]
                  const rejecting = actionLoading[`r_${item._id}`]
                  const colors = isStartup
                    ? 'bg-violet-100 text-violet-600'
                    : isIncubator
                    ? 'bg-emerald-100 text-emerald-600'
                    : isServiceProvider
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-blue-100 text-blue-600'
                  const kindLabel = isServiceProvider ? 'Service Provider' : item.kind

                  return (
                    <div key={item._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${colors}`}>
                        {name?.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 capitalize">{sub}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-xs font-medium text-gray-500 capitalize">{kindLabel}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg capitalize hidden sm:block">{industry}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(item.kind, item._id)}
                          disabled={approving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer disabled:opacity-60"
                        >
                          <CheckCircle size={12} /> {approving ? 'Approving…' : 'Approve'}
                        </button>
                        {isStartup && (
                          <button
                            onClick={() => handleReject(item.kind, item._id)}
                            disabled={rejecting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors border-none cursor-pointer disabled:opacity-60"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Growth Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Growth Performance</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Monthly</span>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">+28.4%</span>
                <p className="text-xs text-gray-400 mt-0.5">Platform activity</p>
              </div>
              <GrowthChart />
            </div>

            {/* Platform Health */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 md:p-6 text-white">
              <h3 className="text-sm font-semibold text-white mb-1">Platform Health</h3>
              <p className="text-2xl font-bold text-white mb-0.5">99.98%</p>
              <p className="text-xs text-violet-200 mb-4">Uptime — all systems operational</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                {['API', 'Database', 'Auth', 'Storage'].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-violet-100">{s}</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-white text-violet-700 font-semibold text-sm py-2.5 rounded-xl border-none cursor-pointer hover:bg-violet-50 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}