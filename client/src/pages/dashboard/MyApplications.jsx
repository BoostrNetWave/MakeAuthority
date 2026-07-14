import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { Briefcase, Building2, MapPin, Clock, ChevronLeft, CheckCircle2, Circle, XCircle, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState(null)

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data } = await api.get('/job-applications/me')
        if (data.success) {
          setApplications(data.applications)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <button 
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ChevronLeft size={16} /> Back to Jobs Directory
        </button>

        {!selectedApp ? (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Applications</h1>
              <p className="text-gray-500 text-sm font-medium">Track the status of all the jobs you've applied to.</p>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white p-16 rounded-2xl text-center border border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Briefcase size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
                <p className="text-gray-500 font-medium mb-8">You haven't applied to any jobs yet.</p>
                <button 
                  onClick={() => navigate('/jobs')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shadow-indigo-200"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map(app => (
                  <ApplicationCard key={app._id} app={app} onClick={() => setSelectedApp(app)} />
                ))}
              </div>
            )}
          </>
        ) : (
          <ApplicationDetails app={selectedApp} onBack={() => setSelectedApp(null)} />
        )}
      </div>
    </DashboardLayout>
  )
}

function ApplicationCard({ app, onClick }) {
  const { job, status, createdAt } = app
  
  if (!job) return null

  let statusClass = 'bg-blue-50 text-blue-700 border-blue-200'
  let statusText = status.replace('_', ' ').toUpperCase()

  if (status === 'shortlisted' || status === 'interview_scheduled') {
    statusClass = 'bg-purple-50 text-purple-700 border-purple-200'
  } else if (status === 'accepted') {
    statusClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (status === 'rejected') {
    statusClass = 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col h-full cursor-pointer transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md group shadow-sm"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">{job.title}</h3>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1.5">
            <Building2 size={14} className="text-gray-400" /> {job.companyName}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <MapPin size={14} className="text-gray-400" /> {job.location} <span className="text-gray-300">•</span> {job.workModel}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
          <Clock size={12} /> Applied {new Date(createdAt).toLocaleDateString()}
        </div>
        
        <div className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider border ${statusClass}`}>
          {statusText}
        </div>
      </div>
    </div>
  )
}

function ApplicationDetails({ app, onBack }) {
  const { job, status, createdAt, statusHistory, coverLetter, resumeUrl, interviewDate, interviewNotes } = app

  const PIPELINE = [
    { id: 'submitted', label: 'Submitted' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'interview_scheduled', label: 'Interview Scheduled' },
    { id: 'decision', label: 'Decision' },
  ]

  const getStepStatus = (stepId, currentStatus) => {
    const isRejected = currentStatus === 'rejected'
    if (stepId === 'decision') {
      if (currentStatus === 'accepted') return 'completed'
      if (currentStatus === 'rejected') return 'rejected'
      return 'pending'
    }
    
    const currentIndex = PIPELINE.findIndex(s => s.id === currentStatus)
    const stepIndex = PIPELINE.findIndex(s => s.id === stepId)
    
    if (isRejected && stepIndex > currentIndex) return 'pending'
    if (stepIndex < currentIndex || (stepIndex === currentIndex && currentStatus !== 'rejected')) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
      >
        <ChevronLeft size={16} /> Back to Applications
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-10 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12 pb-8 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-6 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-2"><Building2 size={16} className="text-gray-400" /> {job.companyName}</span>
              <span className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {job.location} ({job.workModel})</span>
              <span className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400" /> {job.type}</span>
              <span className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> Applied: {new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {resumeUrl && (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-bold transition-colors border border-indigo-100">
              <FileText size={16} /> View Submitted Resume
            </a>
          )}
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Application Status</h3>
          <div className="flex justify-between relative max-w-4xl mx-auto">
            
            {/* Connecting Line */}
            <div className="absolute top-4 left-10 right-10 h-0.5 bg-gray-100 z-0" />
            
            {PIPELINE.map((step, idx) => {
              const state = getStepStatus(step.id, status)
              const isRejectedNode = state === 'rejected'
              const isCompleted = state === 'completed' || isRejectedNode
              const isCurrent = state === 'current'

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10 w-28 text-center">
                  <div className={`
                    w-8 h-8 rounded-full mb-3 flex items-center justify-center transition-colors shadow-sm
                    ${isRejectedNode ? 'bg-red-500 text-white' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' : 
                      'bg-white border-2 border-gray-200'}
                  `}>
                    {isRejectedNode ? <XCircle size={16} /> : isCompleted ? <CheckCircle2 size={16} /> : <Circle size={10} className={isCurrent ? 'text-indigo-600 opacity-0' : 'text-gray-300'} />}
                  </div>
                  <div className={`
                    text-xs font-bold leading-tight
                    ${isRejectedNode ? 'text-red-600' : isCompleted ? 'text-emerald-600' : isCurrent ? 'text-indigo-600' : 'text-gray-400'}
                  `}>
                    {isRejectedNode ? 'Rejected' : step.id === 'decision' && status === 'accepted' ? 'Offer Extended' : step.label}
                  </div>
                  {/* Timeline date */}
                  {statusHistory && statusHistory.find(h => h.status === step.id) && (
                     <div className="text-[10px] text-gray-400 font-medium mt-1">
                       {new Date(statusHistory.find(h => h.status === step.id).changedAt).toLocaleDateString()}
                     </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actionable or Detailed Info based on status */}
        <div className="flex flex-col md:flex-row gap-8">
          {coverLetter && (
            <div className="flex-1 bg-gray-50 p-4 md:p-6 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Cover Letter</h4>
              <p className="text-sm text-gray-600 italic leading-relaxed">"{coverLetter}"</p>
            </div>
          )}
          
          {(status === 'interview_scheduled' || interviewDate || interviewNotes) && (
            <div className="flex-1 bg-indigo-50/50 border border-indigo-100 p-4 md:p-6 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} /> Interview Details
              </h4>
              {interviewDate ? (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase">Scheduled For:</span>
                  <div className="font-bold text-gray-900 mt-1">{new Date(interviewDate).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 font-medium italic mb-4">The founder will reach out to schedule an interview time.</div>
              )}
              
              {interviewNotes && (
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">Notes / Instructions:</span>
                  <div className="text-sm text-gray-800 mt-1">{interviewNotes}</div>
                </div>
              )}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
