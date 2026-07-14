import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { Briefcase, Users, FileText, CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { toast } from 'react-hot-toast'

export default function ManageJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  // Detail view state
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [applicantsLoading, setApplicantsLoading] = useState(false)

  // Fetch Jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/jobs/me')
        if (data.success) {
          setJobs(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Fetch Applicants for a selected job
  const fetchApplicants = async (jobId) => {
    setApplicantsLoading(true)
    try {
      const { data } = await api.get(`/job-applications/job/${jobId}`)
      if (data.success) {
        setApplicants(data.applicants)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setApplicantsLoading(false)
    }
  }

  const handleSelectJob = (job) => {
    setSelectedJob(job)
    fetchApplicants(job._id)
  }

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/job-applications/${appId}/status`, { status: newStatus })
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a))
      toast.success('Status updated successfully')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleSaveNotes = async (appId, notes) => {
    try {
      await api.patch(`/job-applications/${appId}/status`, { founderNotes: notes })
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, founderNotes: notes } : a))
    } catch (err) {
      alert('Failed to save notes')
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        
        {!selectedJob ? (
        // --- LIST OF POSTED JOBS ---
        <>
          <div className="mb-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Jobs</h1>
              <p className="text-sm text-gray-500 mt-1">Review applicants and track hiring progress for your posted jobs.</p>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Briefcase size={32} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">No Jobs Posted</h2>
              <p className="text-gray-500 font-medium">You haven't posted any jobs yet. Go to Post a Job to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map(job => (
                <div key={job._id} 
                  onClick={() => handleSelectJob(job)}
                  className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 cursor-pointer flex justify-between items-center transition-all hover:border-indigo-300 hover:shadow-md group shadow-sm"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <div className="flex gap-6 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {job.applicantCount || 0} Applicants</span>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    View Applicants
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // --- APPLICANTS FOR SELECTED JOB ---
        <>
          <button 
            onClick={() => setSelectedJob(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <ChevronLeft size={16} /> Back to Jobs
          </button>

          <div className="mb-10 pb-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Applicants for <span className="text-indigo-600">{selectedJob.title}</span></h1>
              <p className="text-gray-500 text-sm font-medium">Review, update status, and take notes on candidates.</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Users size={16} />
              {applicants.length} Total
            </div>
          </div>

          {applicantsLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Users size={32} />
              </div>
              <p className="text-gray-500 font-medium">No applicants yet for this position.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {applicants.map(app => (
                <ApplicantCard 
                  key={app._id} 
                  app={app} 
                  onStatusChange={(status) => handleStatusChange(app._id, status)}
                  onSaveNotes={(notes) => handleSaveNotes(app._id, notes)}
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </DashboardLayout>
  )
}

function ApplicantCard({ app, onStatusChange, onSaveNotes }) {
  const [localNotes, setLocalNotes] = useState(app.founderNotes || '')
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-8 shadow-sm">
      
      {/* Left Col: Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-3">
              {app.applicant?.name}
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                  app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                  app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                  app.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-600'}
              `}>
                {app.status.replace('_', ' ')}
              </span>
            </h3>
            <div className="text-sm text-gray-500 font-medium">{app.applicant?.email}</div>
          </div>
        </div>

        {app.coverLetter && (
          <div className="bg-gray-50 p-4 rounded-xl mb-4 text-sm text-gray-600 italic border border-gray-100 leading-relaxed">
            "{app.coverLetter}"
          </div>
        )}

        <div className="flex gap-3 mb-6">
          {app.resumeUrl && (
            <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors border border-blue-100">
              <FileText size={14} /> View Resume
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap border-t border-gray-100 pt-4">
          <button onClick={() => onStatusChange('shortlisted')} className={btnClass(app.status, 'shortlisted', 'bg-blue-600 text-white')}>Shortlist</button>
          <button onClick={() => onStatusChange('interview_scheduled')} className={btnClass(app.status, 'interview_scheduled', 'bg-purple-600 text-white')}>Schedule Interview</button>
          <button onClick={() => onStatusChange('accepted')} className={btnClass(app.status, 'accepted', 'bg-emerald-600 text-white')}><CheckCircle size={14} /> Accept</button>
          <button onClick={() => onStatusChange('rejected')} className={btnClass(app.status, 'rejected', 'bg-red-600 text-white')}><XCircle size={14} /> Reject</button>
        </div>
      </div>

      {/* Right Col: Private Notes */}
      <div className="w-full md:w-80 md:border-l border-gray-100 md:pl-8 flex flex-col pt-6 md:pt-0 border-t md:border-t-0">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          Private Notes
        </label>
        <textarea 
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="Interview feedback, thoughts..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none mb-3 min-h-[120px]"
        />
        <button 
          onClick={() => onSaveNotes(localNotes)}
          disabled={localNotes === app.founderNotes}
          className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${localNotes === app.founderNotes ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200'}`}
        >
          {localNotes === app.founderNotes ? 'Saved' : 'Save Notes'}
        </button>
      </div>

    </div>
  )
}

function btnClass(currentStatus, targetStatus, activeClasses) {
  const isActive = currentStatus === targetStatus
  return `flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isActive ? `${activeClasses} border-transparent shadow-sm` : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`
}
