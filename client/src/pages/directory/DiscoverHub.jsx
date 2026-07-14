import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search, Building2, Users, Lightbulb, ArrowRight,
  Sparkles, MapPin, Landmark, ArrowLeft
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

export default function DiscoverHub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [counts, setCounts] = useState({ startups: 0, investors: 0, grants: 0, incubators: 0 })
  const [featuredStartups, setFeaturedStartups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [startupsRes, investorsRes, grantsRes, incubatorsRes] = await Promise.allSettled([
          api.get('/startups?limit=3'),
          api.get('/investors?limit=3'),
          api.get('/grants?limit=3'),
          api.get('/incubators?limit=1'),
        ])

        const stats = { startups: 0, investors: 0, grants: 0, incubators: 0 }
        if (startupsRes.status === 'fulfilled' && startupsRes.value.data.success) {
          stats.startups = startupsRes.value.data.total || startupsRes.value.data.startups?.length || 12
          setFeaturedStartups(startupsRes.value.data.startups || [])
        }
        if (investorsRes.status === 'fulfilled' && investorsRes.value.data.success) {
          stats.investors = investorsRes.value.data.total || investorsRes.value.data.investors?.length || 8
        }
        if (grantsRes.status === 'fulfilled' && grantsRes.value.data.success) {
          stats.grants = grantsRes.value.data.total || grantsRes.value.data.grants?.length || 15
        }
        if (incubatorsRes.status === 'fulfilled' && incubatorsRes.value.data.success) {
          stats.incubators = incubatorsRes.value.data.total || incubatorsRes.value.data.incubators?.length || 0
        }
        setCounts(stats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/startups?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    return user.role === 'super_admin' ? '/dashboard/admin' : `/dashboard/${user.role}`
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden text-gray-900">
      {/* Glow effects */}
      <div className="absolute -top-[10%] -right-[5%] w-[50vw] h-[50vw] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-[10%] -left-[5%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-violet-600 cursor-pointer" onClick={() => navigate('/')}>Boostr</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100 uppercase tracking-widest">Discover Hub</span>
          </div>

          <nav className="flex items-center gap-6">
            <button onClick={() => navigate(getDashboardLink())} className="btn-secondary text-gray-600 flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO SEARCH SECTION ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900 mb-5">
          Explore the Ecosystem
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover vetted startups raising capital, active VC/Angel investors, and corporate/government grants to fuel your venture.
        </p>

        {/* Central Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mb-4">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search startups, industries, funding stages..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-36 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 text-sm sm:text-base font-medium transition-all"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
            Find Startups
          </button>
        </form>
      </section>

      {/* ── CARD DIRECTORIES HUB ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          {/* Card 1: Startups */}
          <div className="group relative bg-white border border-gray-200 rounded-3xl p-4 md:p-8 hover:border-violet-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full" onClick={() => navigate('/startups')}>
            <div className="absolute -top-[30px] -right-[30px] w-24 h-24 rounded-full bg-violet-500/5 blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
            <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-6">
              <Building2 className="w-7 h-7 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Startup Directory</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
              Browse profiles, stages, tech stacks, and pitch decks of active companies.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                {counts.startups}+ Startups
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-violet-600 group-hover:text-violet-700 transition-colors">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 2: Investors */}
          <div className="group relative bg-white border border-gray-200 rounded-3xl p-4 md:p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full" onClick={() => navigate('/investors')}>
            <div className="absolute -top-[30px] -right-[30px] w-24 h-24 rounded-full bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all duration-300" />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Investor Network</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
              Connect with Venture Capitals, Micro VCs, Family Offices, and Angels.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                {counts.investors}+ Investors
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 3: Grants */}
          <div className="group relative bg-white border border-gray-200 rounded-3xl p-4 md:p-8 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full" onClick={() => navigate('/grants')}>
            <div className="absolute -top-[30px] -right-[30px] w-24 h-24 rounded-full bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
              <Lightbulb className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Grants Database</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
              Search and filter active government grants, corporate funds, and competitions.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                {counts.grants}+ Active Grants
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 4: Incubators */}
          <div className="group relative bg-white border border-gray-200 rounded-3xl p-4 md:p-8 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full" onClick={() => navigate('/incubators')}>
            <div className="absolute -top-[30px] -right-[30px] w-24 h-24 rounded-full bg-amber-500/5 blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
              <Landmark className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Incubators & Accel.</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
              Apply to accelerators, university cohorts, and corporate mentorship programs.
            </p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                {counts.incubators}+ Incubators
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
                Explore <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

        </div>

        {/* ── RECOMMENDED HIGHLIGHT ── */}
        <div>
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-violet-500" />
              Trending Startups
            </h2>
            <Link to="/startups" className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1">
              Browse all startups <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 rounded-3xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : featuredStartups.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm text-gray-500 font-medium">
              No startups registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredStartups.map((s, idx) => {
                const initials = s.startupName?.slice(0, 2).toUpperCase() || 'ST'
                return (
                  <div key={s._id || idx} className="group bg-white border border-gray-200 rounded-3xl p-4 md:p-6 hover:shadow-lg hover:border-violet-200 transition-all duration-300 flex flex-col justify-between cursor-pointer" onClick={() => navigate(`/startups/${s.slug}`)}>
                    <div>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                          {s.logo ? <img src={s.logo} className="w-full h-full rounded-2xl object-cover" alt="" /> : initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg group-hover:text-violet-600 transition-colors">{s.startupName}</h4>
                          <span className="text-xs font-bold text-violet-600 uppercase tracking-widest">{s.industry}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                        {s.tagline || s.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 mt-auto border-t border-gray-100">
                      {s.city ? (
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5" /> {s.city}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-lg">{s.fundingStage?.replace('_', ' ')}</span>
                      )}
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                        View Profile <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
