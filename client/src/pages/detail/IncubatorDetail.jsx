import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, ExternalLink, Calendar,
  Users, CheckCircle, ChevronRight, Mail, Share2, Globe, GraduationCap
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function IncubatorDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [incubator, setIncubator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState('')

  useEffect(() => {
    const fetchIncubator = async () => {
      try {
        const { data } = await api.get(`/incubators/${slug}`)
        if (data.success) {
          setIncubator(data.incubator)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchIncubator()
  }, [slug])

  const handleApply = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'founder') {
      toast.error("Only founders can apply to incubators.")
      return
    }
    
    setApplying(true)
    setApplySuccess('')
    try {
      const res = await api.post(`/incubators/${incubator._id}/apply`)
      if (res.data.success) {
        setApplySuccess('Successfully applied! The incubator will review your profile.')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!incubator) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-2xl font-bold text-gray-900">Incubator Not Found</div>
          <button onClick={() => navigate('/incubators')} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors">
            Back to Incubators
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const initials = incubator.organizationName?.slice(0, 2).toUpperCase() || 'IN'

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        <button 
          onClick={() => navigate('/incubators')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        {/* Top Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-sm">
              {incubator.logo 
                ? <img src={incubator.logo} alt="" className="w-full h-full rounded-2xl object-cover" />
                : initials}
            </div>
            
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                {incubator.organizationName}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium">
                {incubator.city && (
                  <span className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {incubator.city}, {incubator.state}</span>
                )}
                {incubator.website && (
                  <a href={incubator.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-bold transition-colors">
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleApply}
              disabled={applying || !!applySuccess}
              className={`px-8 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm
                ${applySuccess ? 'bg-emerald-500 text-white shadow-emerald-200 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
            >
              {applying ? 'Applying...' : applySuccess ? 'Applied!' : 'Apply Now'} {(!applying && !applySuccess) && <ChevronRight size={18} />}
            </button>
          </div>
        </div>

        {applySuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 mb-8 flex items-center gap-3 font-bold text-sm">
            <CheckCircle size={18} /> {applySuccess}
          </div>
        )}

        {/* Quick Info Bar */}
        <div className="flex flex-wrap gap-10 p-4 md:p-6 rounded-2xl bg-white border border-gray-200 mb-12 shadow-sm">
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Category</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2 capitalize">
              {incubator.category?.replace(/_/g, ' ')}
            </div>
          </div>
          <div className="w-px bg-gray-100 hidden md:block" />
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Cohort Size</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" /> {incubator.alumniCount || 'N/A'} Startups
            </div>
          </div>
          <div className="w-px bg-gray-100 hidden md:block" />
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Duration</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" /> {incubator.duration || 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <section className="mb-10 bg-white p-4 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {incubator.organizationName}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {incubator.description || "No detailed description provided."}
              </div>
            </section>

            {incubator.benefits && incubator.benefits.length > 0 && (
              <section className="mb-10 bg-white p-4 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Program Benefits</h2>
                <div className="flex flex-col gap-4">
                  {incubator.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-sm text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                      </div>
                      <span className="leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-4 md:p-8 border border-gray-200 shadow-sm sticky top-8">
              <h3 className="text-base font-bold text-gray-900 mb-6">Program Details</h3>
              
              <div className="flex flex-col gap-6">
                {incubator.programName && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Program Name</div>
                    <div className="text-sm text-gray-900 font-bold">{incubator.programName}</div>
                  </div>
                )}
                
                {incubator.focusIndustries && incubator.focusIndustries.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Focus Industries</div>
                    <div className="flex flex-wrap gap-2">
                      {incubator.focusIndustries.map((ind, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-200">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {incubator.contactEmail && (
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1.5">Contact</div>
                    <a href={`mailto:${incubator.contactEmail}`} className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-2 transition-colors">
                      <Mail size={16} /> {incubator.contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
