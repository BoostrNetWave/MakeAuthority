import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Briefcase, Clock, DollarSign,
  Building, CheckCircle2, ChevronRight, Share2, Bookmark, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import FileUpload from '@/components/FileUpload'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  const [applied,   setApplied]   = useState(false)
  const [applying,  setApplying]  = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const [resumeUrl, setResumeUrl] = useState('')
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}`)
        if (data.success) {
          setJob(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  useEffect(() => {
    if (user && job) {
      api.get(`/job-applications/check/${job._id}`)
        .then(({ data }) => { if (data.applied) setApplied(true) })
        .catch(() => {})
    }
  }, [job, user])

  const handleApply = async (e) => {
    e.preventDefault()
    setApplying(true)
    try {
      await api.post('/job-applications', {
        jobId: job._id,
        resumeUrl,
        coverLetter,
      })
      setApplied(true)
      setShowModal(false)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to apply.')
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

  if (!job) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-2xl font-bold text-gray-900">Job Not Found</div>
          <button onClick={() => navigate('/jobs')} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors">
            Back to Jobs
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const timeAgo = (dateStr) => {
    const days = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full relative">
        
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div className="flex gap-6 items-start">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm overflow-hidden">
              {job.startup?.logo ? (
                <img src={job.startup.logo} alt={job.companyName} className="w-14 h-14 object-contain rounded-lg" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg" />
              )}
            </div>
            
            <div className="pt-1">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium">
                <span className="flex items-center gap-2"><Building size={16} className="text-gray-400" /> {job.companyName}</span>
                <span className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {job.location} ({job.workModel})</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> Posted {timeAgo(job.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
              <Share2 size={18} />
            </button>
            <button className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm">
              <Bookmark size={18} />
            </button>
            {(!user || user._id !== job.postedBy) && (
              <button 
                onClick={() => applied ? null : setShowModal(true)}
                disabled={applied}
                className={`px-8 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm
                  ${applied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
              >
                {applied ? '✓ Applied' : 'Apply Now'} {!applied && <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="flex flex-wrap gap-10 p-4 md:p-6 rounded-2xl bg-white border border-gray-200 mb-12 shadow-sm">
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Job Type</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-violet-500" /> {job.jobType}
            </div>
          </div>
          <div className="w-px bg-gray-100 hidden md:block" />
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Work Model</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" /> {job.workModel}
            </div>
          </div>
          <div className="w-px bg-gray-100 hidden md:block" />
          <div>
            <div className="text-xs text-gray-400 mb-1.5 uppercase tracking-wider font-bold">Salary Range</div>
            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-500" /> {job.salaryRange || 'Not Disclosed'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <section className="mb-10 bg-white p-4 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">About the Role</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                {job.description}
              </div>
            </section>

            {job.requirements && job.requirements.length > 0 && (
              <section className="mb-10 bg-white p-4 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="flex flex-col gap-4">
                  {job.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-4 text-sm text-gray-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100 mt-0.5">
                        <CheckCircle2 size={14} className="text-violet-600" />
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-4 md:p-8 border border-gray-200 shadow-sm sticky top-8">
              <h3 className="text-base font-bold text-gray-900 mb-6">About {job.companyName}</h3>
              {job.startup?.website && (
                <a href={job.startup.website} target="_blank" rel="noopener noreferrer" className="block text-violet-600 font-bold text-sm mb-6 hover:text-violet-700 transition-colors">
                  Visit Website &rarr;
                </a>
              )}
              <div className="flex flex-col gap-4">
                {(!user || user._id !== job.postedBy) && (
                  <button 
                    onClick={() => applied ? null : setShowModal(true)}
                    disabled={applied}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-colors shadow-sm
                      ${applied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
                  >
                    {applied ? '✓ Applied' : 'Apply Now'}
                  </button>
                )}
                <button className="w-full py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors shadow-sm">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* APPLY MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="m-0 text-xl font-bold text-gray-900">Apply for {job.title}</h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApply} className="p-4 md:p-6">
              
              <div className="mb-6">
                <FileUpload 
                  label="Resume (PDF)" 
                  accept=".pdf" 
                  currentFileUrl={resumeUrl} 
                  onUploadSuccess={(url) => setResumeUrl(url)} 
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Letter (Optional)</label>
                <textarea 
                  value={coverLetter} 
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Why are you a good fit for this role?" 
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none placeholder-gray-400"
                />
              </div>

              <button 
                type="submit" 
                disabled={applying || !resumeUrl} 
                className="w-full py-4 rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
