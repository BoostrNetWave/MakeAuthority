import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Globe, Link2, MapPin, TrendingUp,
  CheckCircle, ExternalLink, ChevronRight,
  Plus, Bell, Compass, LayoutGrid, Wrench,
  BarChart2, Users, Settings, HelpCircle, LogOut,
  Building2, DollarSign, Target, Eye,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import DashboardLayout from '@/components/layout/DashboardLayout'

const INVESTOR_TYPE_LABELS = {
  angel:           'Angel Investor',
  venture_capital: 'Venture Capital',
  family_office:   'Family Office',
  corporate_vc:    'Corporate VC',
  micro_vc:        'Micro VC',
  hni:             'HNI Investor',
}

const INVESTOR_TYPE_COLORS = {
  angel:           { bg: 'bg-amber-50 text-amber-500 border-amber-200' },
  venture_capital: { bg: 'bg-violet-50 text-violet-500 border-violet-200' },
  family_office:   { bg: 'bg-emerald-50 text-emerald-500 border-emerald-200' },
  corporate_vc:    { bg: 'bg-blue-50 text-blue-500 border-blue-200' },
  micro_vc:        { bg: 'bg-pink-50 text-pink-500 border-pink-200' },
  hni:             { bg: 'bg-red-50 text-red-500 border-red-200' },
}

const ICON_GRADIENTS = [
  'from-violet-600 to-fuchsia-600',
  'from-emerald-600 to-teal-500',
  'from-blue-600 to-indigo-500',
  'from-orange-600 to-amber-500',
  'from-pink-600 to-rose-500',
  'from-indigo-600 to-blue-500',
]

function SectionHeading({ children }) {
  return (
    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
      {children}
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 capitalize font-medium">
      {children}
    </span>
  )
}

function LoadingSkeleton() {
  const bar = (w, h = 'h-3.5', mb = 'mb-0') => (
    <div className={`w-[${w}] ${h} ${mb} rounded-md bg-gray-200 animate-pulse`} />
  )
  return (
    <div className="p-5 md:p-10">
      <div className="flex gap-5 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1">
          {bar('55%', 'h-7', 'mb-3')}
          {bar('35%', 'h-3.5', 'mb-2')}
          {bar('80%', 'h-3')}
        </div>
      </div>
      {[1,2,3].map(i => (
        <div key={i} className="mb-5">
          {bar('30%', 'h-3', 'mb-3')}
          {bar('95%', 'h-3.5', 'mb-1.5')}
          {bar('88%', 'h-3.5')}
        </div>
      ))}
    </div>
  )
}

function NotFound({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-5 md:p-10 text-center">
      <div className="text-5xl">💼</div>
      <div className="text-xl font-bold text-gray-900">Investor not found</div>
      <div className="text-sm text-gray-500 max-w-xs font-medium">
        This investor may not be approved yet or the link is incorrect.
      </div>
      <button onClick={onBack} className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200">
        ← Back to Directory
      </button>
    </div>
  )
}

export default function InvestorDetail() {
  const { id }           = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuth()

  const [investor,  setInvestor]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [applying,  setApplying]  = useState(false)
  const [applied,   setApplied]   = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true); setNotFound(false)
      try {
        const { data } = await api.get(`/investors/${id}`)
        if (data.success) setInvestor(data.investor)
        else              setNotFound(true)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleApply = async () => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'founder') {
      toast.error('Only founders can apply to investors.')
      return
    }
    setApplying(true)
    try {
      const { data } = await api.post('/applications', {
        targetType: 'investor',
        investor: investor._id,
      })
      if (data.success) setApplied(true)
    } catch (err) {
      console.error('Apply error:', err)
    } finally {
      setApplying(false)
    }
  }

  const gradIdx  = investor ? investor.firmName?.charCodeAt(0) % ICON_GRADIENTS.length : 0
  const gradientClass = ICON_GRADIENTS[gradIdx] || ICON_GRADIENTS[0]
  const typeInfo  = INVESTOR_TYPE_COLORS[investor?.investorType] || INVESTOR_TYPE_COLORS.angel
  const typeLabel = INVESTOR_TYPE_LABELS[investor?.investorType] || 'Investor'

  const formatTicket = (min, max) => {
    const fmt = n => n >= 10000000
      ? `$${(n/10000000).toFixed(1)}M`
      : `$${(n/100000).toFixed(0)}L`
    if (min && max) return `${fmt(min)} – ${fmt(max)}`
    if (min) return `${fmt(min)}+`
    if (max) return `Up to ${fmt(max)}`
    return 'Undisclosed'
  }

  if (loading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>
  if (notFound) return <DashboardLayout><NotFound onBack={() => navigate('/investors')} /></DashboardLayout>
  if (!investor) return null

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <button 
          onClick={() => navigate('/investors')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── LEFT COLUMN ─────────────────────────── */}
          <div className="min-w-0 flex flex-col gap-6">

            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
              <div className="flex gap-6 items-start mb-8">

                {/* Avatar */}
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-sm overflow-hidden ${investor.avatar ? 'bg-black' : `bg-gradient-to-br ${gradientClass}`}`}>
                  {investor.avatar
                    ? <img src={investor.avatar} alt="" className="w-full h-full object-cover" />
                    : investor.firmName?.slice(0, 1).toUpperCase() || 'IN'}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight m-0">
                      {investor.firmName || investor.user?.name}
                    </h1>
                    {investor.isVerifiedByAdmin && (
                      <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">
                    {investor.designation || 'Investor'}
                    {investor.city ? ` · ${investor.city}` : ''}
                    {investor.country ? `, ${investor.country}` : ''}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${typeInfo.bg}`}>
                      {typeLabel}
                    </span>
                    {investor.casVerified && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
                        ✓ CAS Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-[1px] bg-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                {[
                  { label: 'Ticket Size',    value: formatTicket(investor.ticketSizeMin, investor.ticketSizeMax) },
                  { label: 'Portfolio Cos.', value: investor.portfolioCompanies?.length || 0 },
                  { label: 'Profile Views',  value: investor.profileViews?.toLocaleString() || '0' },
                  { label: 'Strength Score', value: `${investor.investorStrengthScore || 0}/100` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white p-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
                    <div className="text-base font-bold text-gray-900 tracking-tight">{value}</div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-3 flex-wrap">
                {investor.website && (
                  <a href={investor.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors">
                    <Globe size={16} /> Website
                  </a>
                )}
                {investor.linkedin && (
                  <a href={investor.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-100 transition-colors">
                    <Link2 size={16} /> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {investor.bio && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>About</SectionHeading>
                <p className="text-sm text-gray-700 leading-relaxed font-medium m-0">
                  {investor.bio}
                </p>
              </div>
            )}

            {/* Investment thesis */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
              <SectionHeading>Investment Focus</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Industries</div>
                  <div className="flex gap-2 flex-wrap">
                    {investor.industriesOfInterest?.length > 0
                      ? investor.industriesOfInterest.map(i => <Tag key={i}>{i}</Tag>)
                      : <span className="text-xs text-gray-400">Not specified</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Stages</div>
                  <div className="flex gap-2 flex-wrap">
                    {investor.investmentStages?.length > 0
                      ? investor.investmentStages.map(s => <Tag key={s}>{s.replace('_', ' ')}</Tag>)
                      : <span className="text-xs text-gray-400">Not specified</span>}
                  </div>
                </div>
              </div>
              {investor.geographicPreference?.length > 0 && (
                <div className="mt-6">
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Geography</div>
                  <div className="flex gap-2 flex-wrap">
                    {investor.geographicPreference.map(g => <Tag key={g}>{g}</Tag>)}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio */}
            {investor.portfolioCompanies?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 shadow-sm">
                <SectionHeading>Portfolio Companies ({investor.portfolioCompanies.length})</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {investor.portfolioCompanies.map((co, i) => {
                    const gradient = ICON_GRADIENTS[i % ICON_GRADIENTS.length]
                    return (
                      <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className={`w-10 h-10 rounded-lg shrink-0 bg-gradient-to-br ${gradient} flex items-center justify-center text-sm font-extrabold text-white`}>
                          {co.name?.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {co.name}
                          </div>
                          <div className="text-xs text-gray-500 font-medium truncate mt-0.5">
                            {co.stage?.replace('_', ' ')} {co.year ? `· ${co.year}` : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ────────────────────────── */}
          <div className="flex flex-col gap-6 sticky top-8">

            {/* CTA Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <div className="text-lg font-extrabold text-gray-900 mb-2">
                Pitch to {investor.firmName || 'this investor'}
              </div>
              <div className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                Submit your startup for consideration. We'll notify you when they respond.
              </div>

              <button
                onClick={handleApply}
                disabled={applying || applied}
                className={`w-full py-3 rounded-xl text-sm font-bold mb-3 transition-colors shadow-sm flex items-center justify-center gap-2
                  ${applied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
              >
                {applying ? 'Submitting...' : applied ? '✓ Application Sent' : 'Pitch My Startup →'}
              </button>

              {investor.linkedin && (
                <a href={investor.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold transition-colors">
                  <Link2 size={16} /> Connect on LinkedIn
                </a>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
              <SectionHeading>Quick Info</SectionHeading>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Investor Type',  value: typeLabel },
                  { label: 'Ticket Size',    value: formatTicket(investor.ticketSizeMin, investor.ticketSizeMax) },
                  { label: 'Location',       value: investor.city ? `${investor.city}, ${investor.country || ''}` : 'Global' },
                  { label: 'Portfolio Cos.', value: investor.portfolioCompanies?.length || 0 },
                  { label: 'Strength Score', value: `${investor.investorStrengthScore || 0} / 100` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="text-xs font-bold text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength score bar */}
            {investor.investorStrengthScore > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Investor Strength</span>
                  <span className={`text-sm font-extrabold ${investor.investorStrengthScore >= 60 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {investor.investorStrengthScore}/100
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${investor.investorStrengthScore >= 60 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} style={{ width: `${investor.investorStrengthScore}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}