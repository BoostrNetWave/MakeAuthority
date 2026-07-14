import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Plus, AlertCircle, CheckCircle2, XCircle, Globe, Link2, Trash2, Edit, Save, ArrowLeft, ArrowRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import FileUpload from '@/components/FileUpload'
import DashboardLayout from '@/components/layout/DashboardLayout'

const INVESTOR_TYPES = [
  { value: "angel", label: "Angel Investor" },
  { value: "venture_capital", label: "Venture Capital (VC)" },
  { value: "family_office", label: "Family Office" },
  { value: "corporate_vc", label: "Corporate VC (CVC)" },
  { value: "micro_vc", label: "Micro VC" },
  { value: "hni", label: "High Net Worth Individual (HNI)" },
  { value: "accelerator", label: "Accelerator / Incubator" },
]

const INDUSTRIES = [
  "fintech", "healthtech", "edtech", "agritech",
  "saas", "ecommerce", "logistics", "cleantech",
  "deeptech", "gaming", "media", "legaltech",
  "hrtech", "proptech", "foodtech", "other",
]

const STAGES = [
  "idea", "pre_seed", "seed", "series_a", "series_b", "series_c", "growth"
]

export default function InvestorProfileForm() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)

  // Form State
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firmName: '',
    designation: '',
    avatar: '',
    bio: '',
    investorType: 'angel',
    investmentStages: [],
    industriesOfInterest: [],
    geographicPreference: ['India'],
    ticketSizeMin: '',
    ticketSizeMax: '',
    portfolioCompanies: [],
    linkedin: '',
    website: '',
    twitter: '',
    city: '',
    state: '',
    country: 'India'
  })

  // Dynamic lists helpers
  const [newIndustry, setNewIndustry] = useState('fintech')
  const [newGeo, setNewGeo] = useState('')
  const [newCompany, setNewCompany] = useState({ name: '', website: '', stage: '', year: '', amount: '', exitStatus: 'active' })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/profile/investor/me')
      if (res.data.success && res.data.profile) {
        setProfile(res.data.profile)
        setFormData({
          firmName: res.data.profile.firmName || '',
          designation: res.data.profile.designation || '',
          avatar: res.data.profile.avatar || '',
          bio: res.data.profile.bio || '',
          investorType: res.data.profile.investorType || 'angel',
          investmentStages: res.data.profile.investmentStages || [],
          industriesOfInterest: res.data.profile.industriesOfInterest || [],
          geographicPreference: res.data.profile.geographicPreference || ['India'],
          ticketSizeMin: res.data.profile.ticketSizeMin || '',
          ticketSizeMax: res.data.profile.ticketSizeMax || '',
          portfolioCompanies: res.data.profile.portfolioCompanies || [],
          linkedin: res.data.profile.linkedin || '',
          website: res.data.profile.website || '',
          twitter: res.data.profile.twitter || '',
          city: res.data.profile.city || '',
          state: res.data.profile.state || '',
          country: res.data.profile.country || 'India'
        })
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setProfile(null) // Prompt to create
      } else {
        setError('Failed to load profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStageToggle = (stage) => {
    setFormData(prev => {
      const stages = prev.investmentStages.includes(stage)
        ? prev.investmentStages.filter(s => s !== stage)
        : [...prev.investmentStages, stage]
      return { ...prev, investmentStages: stages }
    })
  }

  const handleIndustryAdd = (e) => {
    e.preventDefault()
    if (newIndustry && !formData.industriesOfInterest.includes(newIndustry)) {
      setFormData(prev => ({
        ...prev,
        industriesOfInterest: [...prev.industriesOfInterest, newIndustry]
      }))
    }
  }

  const handleIndustryRemove = (ind) => {
    setFormData(prev => ({
      ...prev,
      industriesOfInterest: prev.industriesOfInterest.filter(i => i !== ind)
    }))
  }

  const handleGeoAdd = (e) => {
    e.preventDefault()
    if (newGeo.trim() && !formData.geographicPreference.includes(newGeo.trim())) {
      setFormData(prev => ({
        ...prev,
        geographicPreference: [...prev.geographicPreference, newGeo.trim()]
      }))
      setNewGeo('')
    }
  }

  const handleGeoRemove = (geo) => {
    setFormData(prev => ({
      ...prev,
      geographicPreference: prev.geographicPreference.filter(g => g !== geo)
    }))
  }

  const handleCompanyAdd = (e) => {
    e.preventDefault()
    if (newCompany.name.trim()) {
      setFormData(prev => ({
        ...prev,
        portfolioCompanies: [...prev.portfolioCompanies, { ...newCompany }]
      }))
      setNewCompany({ name: '', website: '', stage: '', year: '', amount: '', exitStatus: 'active' })
    }
  }

  const handleCompanyRemove = (idx) => {
    setFormData(prev => ({
      ...prev,
      portfolioCompanies: prev.portfolioCompanies.filter((_, i) => i !== idx)
    }))
  }

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (profile) {
        res = await api.put('/profile/investor/me', formData)
      } else {
        res = await api.post('/profile/investor', formData)
      }

      if (res.data.success) {
        setProfile(res.data.profile)
        setIsEditMode(false)
        fetchProfile()
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Something went wrong. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Investor Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your public investment identity and thesis.</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-600 mb-4">{error}</p>
            <button onClick={fetchProfile} className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium text-sm">Try Again</button>
          </div>
        ) : !profile && !isEditMode ? (
          /* ── WIZARD FOR CREATION ── */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Investor Profile</h2>
              <p className="text-sm text-gray-500">Set up your investment thesis to discover high-quality deal flow.</p>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-violet-600' : 'bg-gray-100'}`} />
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm">
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Basic Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Firm / Entity Name *</label>
                      <input type="text" name="firmName" value={formData.firmName} onChange={handleInputChange} className={inputClass} placeholder="Sequoia Capital / John Doe" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className={inputClass} placeholder="Partner / Angel Investor" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Investor Type</label>
                    <select name="investorType" value={formData.investorType} onChange={handleInputChange} className={inputClass}>
                      {INVESTOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio / Thesis</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} className={`${inputClass} min-h-[120px]`} placeholder="We invest in early stage B2B SaaS..." />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">2. Investment Thesis</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Investment Stages</label>
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map(stage => {
                        const isSelected = formData.investmentStages.includes(stage)
                        return (
                          <button
                            key={stage}
                            type="button"
                            onClick={() => handleStageToggle(stage)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                              isSelected ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                            }`}
                          >
                            {stage.replace('_', ' ').toUpperCase()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Ticket Size (INR)</label>
                      <input type="number" name="ticketSizeMin" value={formData.ticketSizeMin} onChange={handleInputChange} className={inputClass} placeholder="1000000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Ticket Size (INR)</label>
                      <input type="number" name="ticketSizeMax" value={formData.ticketSizeMax} onChange={handleInputChange} className={inputClass} placeholder="50000000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Industries of Interest</label>
                    <form onSubmit={handleIndustryAdd} className="flex gap-2 mb-3">
                      <select value={newIndustry} onChange={e => setNewIndustry(e.target.value)} className={`${inputClass} flex-1`}>
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.toUpperCase()}</option>)}
                      </select>
                      <button type="submit" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Add</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {formData.industriesOfInterest.map(ind => (
                        <span key={ind} className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                          {ind.toUpperCase()} <XCircle size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleIndustryRemove(ind)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">3. Portfolio & Geography</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Geographic Preferences</label>
                    <form onSubmit={handleGeoAdd} className="flex gap-2 mb-3">
                      <input type="text" value={newGeo} onChange={e => setNewGeo(e.target.value)} className={`${inputClass} flex-1`} placeholder="e.g. India, SEA, US" />
                      <button type="submit" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Add</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {formData.geographicPreference.map(geo => (
                        <span key={geo} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                          {geo} <XCircle size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleGeoRemove(geo)} />
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Add Portfolio Company</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Company Name" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} className={inputClass} />
                      <input type="url" placeholder="Website" value={newCompany.website} onChange={e => setNewCompany({ ...newCompany, website: e.target.value })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <select value={newCompany.stage} onChange={e => setNewCompany({ ...newCompany, stage: e.target.value })} className={inputClass}>
                        <option value="">Stage Invested</option>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={newCompany.exitStatus} onChange={e => setNewCompany({ ...newCompany, exitStatus: e.target.value })} className={inputClass}>
                        <option value="active">Active</option>
                        <option value="acquired">Acquired</option>
                        <option value="ipo">IPO</option>
                        <option value="written_off">Written Off</option>
                      </select>
                    </div>
                    <button onClick={handleCompanyAdd} className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">Add Company</button>
                  </div>
                  <div className="space-y-2">
                    {formData.portfolioCompanies.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                        <div>
                          <div className="text-sm font-bold text-gray-900 leading-tight">{c.name}</div>
                          <div className="text-xs text-gray-500 font-medium capitalize">{c.stage} • {c.exitStatus}</div>
                        </div>
                        <button onClick={() => handleCompanyRemove(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">4. Links & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} placeholder="Mumbai" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} placeholder="Maharashtra" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                      <input type="url" name="website" value={formData.website} onChange={handleInputChange} className={inputClass} placeholder="https://..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className={inputClass} placeholder="https://linkedin.com/..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Twitter URL</label>
                    <input type="url" name="twitter" value={formData.twitter} onChange={handleInputChange} className={inputClass} placeholder="https://twitter.com/..." />
                  </div>
                </div>
              )}

              {/* Wizard Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className={`px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-50 ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <ArrowLeft size={16} /> Back
                </button>
                {step < 4 ? (
                  <button disabled={step === 1 && !formData.firmName} onClick={() => setStep(s => s + 1)} className="px-6 py-2 bg-violet-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-violet-700 shadow-sm shadow-violet-200">
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleFormSubmit} disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                    {saving ? 'Creating Profile...' : 'Save & Publish'} <Save size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── OVERVIEW MODE / STANDARD FORM MODE ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Sidebar Details */}
            <div className="lg:col-span-1 space-y-6 sticky top-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-center shadow-sm">
                <div className="w-24 h-24 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden">
                  {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : profile.firmName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{profile.firmName}</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{profile.designation}</p>
                <p className="text-xs font-bold text-violet-600 bg-violet-50 rounded-full px-3 py-1 inline-block mb-6">{profile.investorType.replace('_', ' ').toUpperCase()}</p>
                
                {!isEditMode ? (
                  <button onClick={() => setIsEditMode(true)} className="w-full px-4 py-2.5 bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:border-violet-300 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2">
                    <Edit size={16} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button onClick={handleFormSubmit} disabled={saving} className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-sm shadow-emerald-200">
                      <Save size={16} /> {saving ? 'Saving...' : 'Save Updates'}
                    </button>
                    <button onClick={() => { setIsEditMode(false); fetchProfile() }} className="w-full px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm">
              {!isEditMode ? (
                /* VIEW DETAILS */
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Investment Thesis & Bio</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{profile.bio || "No description provided yet."}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ticket Size</p>
                      <p className="text-sm font-bold text-gray-900">
                        {profile.ticketSizeMin ? `₹${(profile.ticketSizeMin/100000).toFixed(1)}L` : '0'} - {profile.ticketSizeMax ? `₹${(profile.ticketSizeMax/10000000).toFixed(1)}Cr` : '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900">{profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Not set'}</p>
                    </div>
                  </div>

                  {profile.investmentStages?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Investment Stages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.investmentStages.map(s => (
                          <span key={s} className="px-3 py-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold rounded-full uppercase tracking-wider">{s.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.industriesOfInterest?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Industries</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.industriesOfInterest.map(s => (
                          <span key={s} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.portfolioCompanies?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Portfolio</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {profile.portfolioCompanies.map((c, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                              <p className="text-sm font-bold text-gray-900 mb-1">{c.name}</p>
                              <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.stage}</span>
                                <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.exitStatus}</span>
                              </div>
                            </div>
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg text-gray-400 hover:text-violet-600 border border-gray-200 shadow-sm">
                                <Link2 size={16} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex gap-2 items-center">
                          <Globe size={16} /> Website
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 flex gap-2 items-center">
                          <Link2 size={16} /> LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT PROFILE FORM (Simpler flat layout) */
                <form onSubmit={handleFormSubmit} className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Firm Basics</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Firm Name</label>
                        <input type="text" name="firmName" value={formData.firmName} onChange={handleInputChange} className={inputClass} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Investor Type</label>
                          <select name="investorType" value={formData.investorType} onChange={handleInputChange} className={inputClass}>
                            {INVESTOR_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Designation</label>
                          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className={`${inputClass} min-h-[100px]`} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Investment Criteria</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Min Ticket (INR)</label>
                        <input type="number" name="ticketSizeMin" value={formData.ticketSizeMin} onChange={handleInputChange} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Max Ticket (INR)</label>
                        <input type="number" name="ticketSizeMax" value={formData.ticketSizeMax} onChange={handleInputChange} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Location & Social</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className={inputClass} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Website</label>
                        <input type="url" name="website" value={formData.website} onChange={handleInputChange} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">LinkedIn</label>
                        <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className={inputClass} />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
