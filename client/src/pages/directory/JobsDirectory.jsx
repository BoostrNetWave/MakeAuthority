import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, ArrowRight, Star, SlidersHorizontal
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

import DashboardLayout from '@/components/layout/DashboardLayout'

// ── Filter Pill ──
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
        active 
          ? 'bg-violet-50 text-violet-700 border border-violet-200' 
          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  )
}

// ── Job Card ──
function JobCard({ job, onView }) {
  const isInternship = job.jobType === 'Internship'
  const isRemote = job.workModel === 'Remote'
  
  let badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100'
  let badgeText = job.jobType
  
  if (isRemote) {
    badgeColor = 'bg-blue-50 text-blue-600 border-blue-100'
    badgeText = 'Remote'
  }
  if (isInternship) {
    badgeColor = 'bg-violet-50 text-violet-600 border-violet-100'
  }

  // Generate placeholder skills if requirements are missing
  const skills = job.requirements?.length > 0 ? job.requirements.slice(0, 3) : ['React', 'Node.js', 'UI/UX']

  return (
    <div
      className="card p-4 md:p-6 flex flex-col hover:border-violet-300 hover:shadow-md transition-all group cursor-default"
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden p-1">
            {job.startup?.logo ? (
              <img src={job.startup.logo} alt={job.companyName} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg" />
            )}
          </div>
          {/* Title & Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight tracking-tight">
              {job.title}
            </h3>
            <div className="text-xs font-bold text-gray-400">
              {job.companyName} <span className="mx-1">•</span> {job.location}
            </div>
          </div>
        </div>
        {/* Type Badge */}
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badgeColor}`}>
          {badgeText}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2 flex-1">
        {job.description}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.map((skill, idx) => (
          <div key={idx} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            {skill}
          </div>
        ))}
      </div>

      {/* Footer Row */}
      <div className="flex justify-between items-center mt-auto pt-5 border-t border-gray-100">
        <div className="text-base font-black text-emerald-500">
          {job.salaryRange || 'Competitive'}
        </div>
        <button 
          onClick={() => onView(job._id)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-sm transition-all"
        >
          Apply <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──
function Skeleton() {
  return (
    <div className="h-60 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
  )
}

// ── Main Page ──
export default function JobsDirectory() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Jobs')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (activeFilter === 'Remote') params.append('workModel', 'Remote')
      if (activeFilter === 'Full-time') params.append('type', 'Full-time')
      if (activeFilter === 'Internship') params.append('type', 'Internship')

      const { data } = await api.get(`/jobs?${params}`)
      if (data.success) {
        setJobs(data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchJobs, 300)
    return () => clearTimeout(t)
  }, [search, activeFilter])

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50/30">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0 shadow-sm sticky top-0 z-30">
          {/* Search */}
          <div className="relative w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search opportunities..."
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
                Find your next boost
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Explore high-growth opportunities across our curated ecosystem.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {user && user.role !== 'founder' && user.role !== 'super_admin' && (
                <button 
                  onClick={() => navigate('/jobs/my-applications')}
                  className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  My Applications
                </button>
              )}
              {user && (user.role === 'founder' || user.role === 'super_admin') && (
                <>
                  <button 
                    onClick={() => navigate('/jobs/manage')}
                    className="px-5 py-2.5 bg-violet-50 border border-violet-200 rounded-xl text-sm font-bold text-violet-700 hover:bg-violet-100 transition-colors shadow-sm"
                  >
                    Manage Applicants
                  </button>
                  <button 
                    onClick={() => navigate('/jobs/new')}
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    Post a Job
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── FILTER PILLS ── */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <FilterPill label="All Jobs" active={activeFilter === 'All Jobs'} onClick={() => setActiveFilter('All Jobs')} />
            <FilterPill label="Remote" active={activeFilter === 'Remote'} onClick={() => setActiveFilter('Remote')} />
            <FilterPill label="Full-time" active={activeFilter === 'Full-time'} onClick={() => setActiveFilter('Full-time')} />
            <FilterPill label="Internship" active={activeFilter === 'Internship'} onClick={() => setActiveFilter('Internship')} />
            
            <div className="w-px h-5 bg-gray-200 mx-2" />
            
            <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 text-xs font-bold transition-all">
              <SlidersHorizontal size={14} /> Advanced Filters
            </button>
          </div>

          {/* Cards grid (2 columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {loading ? (
              <>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onView={(id) => navigate(`/jobs/${id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <div className="text-5xl mb-4">🚀</div>
                <div className="text-lg font-bold text-gray-900 mb-2">No jobs found</div>
                <div className="text-sm text-gray-500 font-medium">
                  Try adjusting your filters to see more opportunities.
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Left Block: AI Boost Banner */}
            <div className="lg:col-span-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-4 md:p-10 flex flex-col justify-center relative overflow-hidden shadow-lg shadow-violet-200 text-center md:text-left">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-lg mx-auto md:mx-0">
                <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                  Boost your application with AI
                </h2>
                <p className="text-sm text-violet-100 font-medium leading-relaxed mb-6">
                  Our pro tools help you optimize your resume for each role, increasing your interview chances by 40%.
                </p>
                <button className="bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm">
                  Get Pro Access
                </button>
              </div>
            </div>

            {/* Right Block: Saved Jobs */}
            <div className="card p-4 md:p-8 flex flex-col items-center justify-center text-center h-full">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-5 border border-amber-100">
                <Star size={24} className="text-amber-500 fill-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Saved Jobs</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                You have 12 saved opportunities. Don't let them expire!
              </p>
              <button className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
                View All
              </button>
            </div>

          </div>

        </main>
      </div>
    </DashboardLayout>
  )
}
