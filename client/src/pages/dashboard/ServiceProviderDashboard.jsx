import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Star, MessageSquare, Plus, TrendingUp,
  Clock, CheckCircle2, XCircle, Mail, IndianRupee,
  User, ChevronRight, AlertCircle
} from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

const STATUS = {
  pending:  { bg: 'bg-amber-50',   text: 'text-amber-600',   label: 'Pending',  Icon: Clock },
  accepted: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Accepted', Icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50',     text: 'text-red-500',     label: 'Rejected', Icon: XCircle },
}

function ProposalCard({ proposal, onStatusUpdate }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const s = STATUS[proposal.status] || STATUS.pending

  const update = async (status) => {
    setLoading(true)
    setErr('')
    try {
      const res = await api.put(`/services/proposals/${proposal._id}`, { status })
      if (res.data.success) onStatusUpdate(proposal._id, status)
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 font-black shrink-0">
            {proposal.founder?.name?.charAt(0).toUpperCase() || <User size={18} />}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{proposal.founder?.name || 'Unknown'}</div>
            <a
              href={`mailto:${proposal.founder?.email}`}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium mt-0.5"
            >
              <Mail size={11} /> {proposal.founder?.email}
            </a>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}>
          <s.Icon size={13} /> {s.label}
        </div>
      </div>


      <div className="p-5 space-y-4">

        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Requested</span>
          <div className="mt-1 text-sm font-bold text-gray-900">{proposal.service?.title || '—'}</div>
        </div>


        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Their Budget</span>
          <div className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-600">
            <IndianRupee size={14} /> {proposal.budget}
          </div>
        </div>


        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</span>
          <p className="mt-1 text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
            {proposal.message}
          </p>
        </div>


        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={11} /> Received {new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        {err && (
          <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
            <AlertCircle size={13} /> {err}
          </div>
        )}
      </div>


      {proposal.status === 'pending' && (
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={() => update('accepted')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
          >
            <CheckCircle2 size={15} /> {loading ? 'Saving...' : 'Accept'}
          </button>
          <button
            onClick={() => update('rejected')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-all"
          >
            <XCircle size={15} /> Decline
          </button>
        </div>
      )}


      {proposal.status === 'accepted' && (
        <div className="mx-5 mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-700">You accepted this proposal 🎉 Reach out to get started!</span>
          <a
            href={`mailto:${proposal.founder?.email}?subject=Re: ${proposal.service?.title} Proposal&body=Hi ${proposal.founder?.name},%0A%0AThank you for your proposal. I'd love to discuss further...`}
            className="ml-3 shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
          >
            <Mail size={12} /> Email Client
          </a>
        </div>
      )}
    </div>
  )
}

export default function ServiceProviderDashboard() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState([])
  const [services,  setServices]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all') // all | pending | accepted | rejected

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [propRes, svcRes] = await Promise.all([
          api.get('/services/proposals/me'),
          api.get('/services?myServices=true'),
        ])
        setProposals(propRes.data.proposals || [])
        setServices(svcRes.data.services || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleStatusUpdate = (id, newStatus) => {
    setProposals(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p))
  }

  const avgRating = services.length
    ? (services.reduce((acc, s) => acc + (s.averageRating || 0), 0) / services.length).toFixed(1)
    : '0.0'

  const pendingCount  = proposals.filter(p => p.status === 'pending').length
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length

  const filtered = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter)

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">


        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Here is what is happening with your service offerings today.
            </p>
          </div>
          <Link
            to="/dashboard/services/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm shadow-violet-200 shrink-0"
          >
            <Plus size={16} /> List New Service
          </Link>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-blue-500">
              <div className="p-1.5 bg-blue-50 rounded-lg"><Briefcase size={16} /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{loading ? '—' : services.length}</div>
            <div className="text-xs text-gray-400 mt-1">Services listed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-50 rounded-lg"><Clock size={16} className="text-amber-500" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pending</span>
            </div>
            <div className="text-3xl font-black text-amber-600">{loading ? '—' : pendingCount}</div>
            <div className="text-xs text-gray-400 mt-1">Awaiting response</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 rounded-lg"><CheckCircle2 size={16} className="text-emerald-500" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Accepted</span>
            </div>
            <div className="text-3xl font-black text-emerald-600">{loading ? '—' : acceptedCount}</div>
            <div className="text-xs text-gray-400 mt-1">Proposals accepted</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-50 rounded-lg"><Star size={16} className="text-amber-400" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Rating</span>
            </div>
            <div className="text-3xl font-black text-amber-500">{loading ? '—' : avgRating}</div>
            <div className="text-xs text-gray-400 mt-1">Average rating</div>
          </div>
        </div>


        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Incoming Proposals</h2>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {['all', 'pending', 'accepted', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f === 'all' ? `All (${proposals.length})` : f}
                {f === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-400 text-white rounded-full text-[10px]">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300">
              <MessageSquare size={36} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No proposals yet' : `No ${filter} proposals`}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              {filter === 'all'
                ? 'When startups or founders submit proposals for your services, they will appear here with their contact details.'
                : `You have no ${filter} proposals right now.`}
            </p>
            {filter === 'all' && (
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                <TrendingUp size={16} /> View Marketplace
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(p => (
              <ProposalCard
                key={p._id}
                proposal={p}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
