import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Building2, Users, FileText, CheckCircle2,
  Clock, AlertCircle, MapPin, Briefcase,
  Eye, ThumbsUp, ThumbsDown, ChevronRight, X
} from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'

const STATUS_STYLES = {
  submitted:    { bg: 'bg-amber-50',   color: 'text-amber-600',   label: 'Submitted' },
  under_review: { bg: 'bg-blue-50',    color: 'text-blue-600',    label: 'In Review' },
  accepted:     { bg: 'bg-emerald-50', color: 'text-emerald-600', label: 'Accepted'  },
  rejected:     { bg: 'bg-red-50',     color: 'text-red-500',     label: 'Rejected'  },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function Shimmer({ h = 'h-3.5', w = 'w-full', mb = '' }) {
  return <div className={`${h} ${w} ${mb} bg-gray-100 rounded-md animate-pulse`} />
}

// ── Application review modal ────────────────────────────
function ReviewModal({ app, onClose, onReviewed }) {
  const [status, setStatus] = useState('')
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const submit = async (chosenStatus) => {
    setSaving(true)
    setErr('')
    try {
      await api.patch(`/applications/${app._id}/review`, { status: chosenStatus, notes })
      onReviewed(app._id, chosenStatus)
      onClose()
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Review Application</h3>
            <p className="text-sm text-gray-500 mt-0.5">{app.founder?.startupName || 'Unknown Startup'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Startup info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-black text-lg shrink-0">
              {app.founder?.startupName?.slice(0,2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="font-bold text-gray-900">{app.founder?.startupName || 'Unknown'}</div>
              <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1"><Briefcase size={12} />{app.founder?.industry || '—'}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{app.founder?.city || '—'}</span>
                <span className="flex items-center gap-1"><Clock size={12} />Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Current status */}
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Status: </span>
            <span className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_STYLES[app.status]?.bg} ${STATUS_STYLES[app.status]?.color}`}>
              {STATUS_STYLES[app.status]?.label}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Strong team, needs product validation..."
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm resize-none"
            />
          </div>

          {err && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
              <AlertCircle size={16} /> {err}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={() => submit('under_review')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all text-sm"
          >
            <Eye size={16} /> Mark In Review
          </button>
          <button
            onClick={() => submit('accepted')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all text-sm shadow-sm"
          >
            <ThumbsUp size={16} /> {saving ? 'Saving...' : 'Accept'}
          </button>
          <button
            onClick={() => submit('rejected')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all text-sm"
          >
            <ThumbsDown size={16} /> Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IncubatorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [profile,      setProfile]      = useState(null)
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [reviewing,    setReviewing]    = useState(null) // currently open modal app

  useEffect(() => {
    async function fetchData() {
      try {
        const [profRes, appRes] = await Promise.all([
          api.get('/incubators/profile/me'),
          api.get('/incubators/applications')
        ])
        setProfile(profRes.data.incubator)
        setApplications(appRes.data.applications || [])
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/my-incubator')
        } else {
          setError('Failed to load dashboard data.')
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  // Update local state after a review action without refetching
  const handleReviewed = (appId, newStatus) => {
    setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a))
  }

  const pendingCount   = applications.filter(a => a.status === 'submitted').length
  const reviewingCount = applications.filter(a => a.status === 'under_review').length
  const acceptedCount  = applications.filter(a => a.status === 'accepted').length

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="text-gray-500 font-medium mb-1">{greeting()},</div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
              {user?.name} <span className="text-2xl animate-wave">👋</span>
            </h1>
          </div>
          <Link to="/my-incubator" className="btn-primary bg-gray-900 hover:bg-gray-800 px-5 py-2.5 shadow-sm text-sm font-bold shadow-gray-200">
            Update Profile Settings
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3 font-medium text-sm">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 text-gray-500">
              <Users size={20} /><span className="text-sm font-bold">Profile Views</span>
            </div>
            <div className="text-4xl font-black text-gray-900">
              {loading ? <Shimmer h="h-10" w="w-20" /> : profile?.viewCount || 0}
            </div>
          </div>

          <div className="card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <FileText size={20} /><span className="text-sm font-bold">Pending Review</span>
            </div>
            <div className="text-4xl font-black text-gray-900">
              {loading ? <Shimmer h="h-10" w="w-20" /> : pendingCount}
            </div>
          </div>

          <div className="card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 text-emerald-500">
              <CheckCircle2 size={20} /><span className="text-sm font-bold">Accepted</span>
            </div>
            <div className="text-4xl font-black text-gray-900">
              {loading ? <Shimmer h="h-10" w="w-20" /> : acceptedCount}
            </div>
          </div>

          <div className="rounded-2xl p-4 md:p-6 bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100">
            <div className="text-sm font-bold text-violet-500 uppercase tracking-widest mb-3">Profile Status</div>
            <div className="text-lg font-bold text-gray-900 mb-2">
              {loading ? <Shimmer h="h-6" w="w-32" /> : profile?.isVerified ? 'Verified & Public' : 'Pending Approval'}
            </div>
            <div className="text-xs text-gray-500 font-medium leading-relaxed">
              {profile?.isVerified
                ? 'Your incubator is visible in the public directory.'
                : 'Complete your profile and wait for admin verification.'}
            </div>
          </div>
        </div>

        {/* APPLICATIONS TABLE */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Startup Applications</h2>
          {!loading && applications.length > 0 && (
            <span className="text-sm text-gray-500 font-medium">
              {reviewingCount > 0 && <span className="text-blue-600 font-bold mr-3">{reviewingCount} in review</span>}
              {applications.length} total
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-5 md:p-10 space-y-4">
              <Shimmer h="h-16" w="w-full" />
              <Shimmer h="h-16" w="w-full" />
              <Shimmer h="h-16" w="w-full" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 px-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No applications yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                When founders apply to your incubator, their applications will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map(app => {
                const s = STATUS_STYLES[app.status] || STATUS_STYLES.submitted
                return (
                  <div key={app._id} className="flex items-center p-4 md:p-5 hover:bg-gray-50 transition-colors gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-black text-lg shrink-0">
                      {app.founder?.startupName?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-gray-900 mb-1 truncate">
                        {app.founder?.startupName || 'Unknown Startup'}
                      </div>
                      <div className="text-xs font-medium text-gray-500 flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1"><Briefcase size={12} />{app.founder?.industry || 'Startup'}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} />{app.founder?.city || 'India'}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${s.bg} ${s.color}`}>
                      {s.label}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/startups/${app.founder?.slug || app.founder?._id}`}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title="View startup profile"
                      >
                        <ChevronRight size={16} />
                      </Link>
                      <button
                        onClick={() => setReviewing(app)}
                        className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm"
                        title="Review this application"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewing && (
        <ReviewModal
          app={reviewing}
          onClose={() => setReviewing(null)}
          onReviewed={handleReviewed}
        />
      )}

      <style>{`
        @keyframes wave {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(14deg); }
          30%  { transform: rotate(-8deg); }
          40%  { transform: rotate(14deg); }
          50%  { transform: rotate(-4deg); }
          60%  { transform: rotate(10deg); }
          70%  { transform: rotate(0deg); }
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
