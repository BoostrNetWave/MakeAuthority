import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Plus, LogOut, LayoutDashboard, LayoutGrid,
  Users, Lightbulb, Briefcase, GitBranch, Bot, ShoppingBag,
  CalendarDays, MessageSquare, FolderLock, Settings, ChevronRight,
  AlertCircle, CheckCircle2, XCircle, Globe, Link2, Trash2, Edit, Save,
  ArrowLeft, ArrowRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import FileUpload from '@/components/FileUpload'
import DashboardLayout from '@/components/layout/DashboardLayout'

const INDUSTRIES = [
  "fintech", "healthtech", "edtech", "agritech",
  "saas", "ecommerce", "logistics", "cleantech",
  "deeptech", "gaming", "media", "legaltech",
  "hrtech", "proptech", "foodtech", "other",
]

const FUNDING_STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "pre_seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "series_c", label: "Series C" },
  { value: "growth", label: "Growth Stage" },
  { value: "profitable", label: "Profitable" },
]

const REVENUE_STAGES = [
  { value: "pre_revenue", label: "Pre-Revenue" },
  { value: "early_revenue", label: "Early Revenue" },
  { value: "growing", label: "Growing" },
  { value: "scaling", label: "Scaling" },
  { value: "profitable", label: "Profitable" },
]

export default function MyStartupProfile() {
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
    startupName: '', tagline: '', logo: '', description: '',
    industry: 'saas', sector: '', fundingStage: 'idea', revenueStage: 'pre_revenue',
    fundingRequired: '', fundingRaised: '', city: '', state: '', country: 'India',
    website: '', linkedin: '', twitter: '', instagram: '',
    teamSize: 1, techStack: [], pitchDeck: '', videoPitch: '', teamMembers: []
  })

  // Dynamic stack & member inputs
  const [newSkill, setNewSkill] = useState('')
  const [newMember, setNewMember] = useState({ name: '', role: '', linkedin: '', avatar: '' })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/profile/founder/me')
      if (res.data.success && res.data.profile) {
        setProfile(res.data.profile)
        setFormData({
          startupName: res.data.profile.startupName || '',
          tagline: res.data.profile.tagline || '',
          logo: res.data.profile.logo || '',
          description: res.data.profile.description || '',
          industry: res.data.profile.industry || 'saas',
          sector: res.data.profile.sector || '',
          fundingStage: res.data.profile.fundingStage || 'idea',
          revenueStage: res.data.profile.revenueStage || 'pre_revenue',
          fundingRequired: res.data.profile.fundingRequired || '',
          fundingRaised: res.data.profile.fundingRaised || '',
          city: res.data.profile.city || '',
          state: res.data.profile.state || '',
          country: res.data.profile.country || 'India',
          website: res.data.profile.website || '',
          linkedin: res.data.profile.linkedin || '',
          twitter: res.data.profile.twitter || '',
          instagram: res.data.profile.instagram || '',
          teamSize: res.data.profile.teamSize || 1,
          techStack: res.data.profile.techStack || [],
          pitchDeck: res.data.profile.pitchDeck || '',
          videoPitch: res.data.profile.videoPitch || '',
          teamMembers: res.data.profile.teamMembers || []
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

  const handleSkillAdd = (e) => {
    e.preventDefault()
    if (newSkill.trim() && !formData.techStack.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, techStack: [...prev.techStack, newSkill.trim()] }))
      setNewSkill('')
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({ ...prev, techStack: prev.techStack.filter(s => s !== skillToRemove) }))
  }

  const handleMemberAdd = (e) => {
    e.preventDefault()
    if (newMember.name.trim() && newMember.role.trim()) {
      setFormData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { ...newMember }] }))
      setNewMember({ name: '', role: '', linkedin: '', avatar: '' })
    }
  }

  const handleMemberRemove = (idx) => {
    setFormData(prev => ({ ...prev, teamMembers: prev.teamMembers.filter((_, i) => i !== idx) }))
  }

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault()
    setSaving(true)
    setError('')
    try {
      let res
      if (profile) res = await api.put('/profile/founder/me', formData)
      else res = await api.post('/profile/founder', formData)

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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Startup Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your public startup identity and funding details.</p>
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
            <button onClick={fetchProfile} className="btn-secondary text-red-600 hover:bg-red-100">Try Again</button>
          </div>
        ) : !profile && !isEditMode ? (
          /* ── WIZARD FOR CREATION ── */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Your Startup</h2>
              <p className="text-sm text-gray-500">Tell us about your venture to unlock AI matching and investor reach.</p>
            </div>

            {/* Steps indicator */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-violet-600' : 'bg-gray-100'}`} />
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm">
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Startup Basics</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Startup Name *</label>
                    <input type="text" name="startupName" value={formData.startupName} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Acme Corp" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tagline</label>
                    <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Revolutionizing digital workspaces with AI" maxLength={160} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <FileUpload label="Startup Logo (Image)" accept="image/*" currentFileUrl={formData.logo} onUploadSuccess={(url) => setFormData(p => ({ ...p, logo: url }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                      <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="https://example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Bangalore" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Karnataka" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">2. Industry & Stage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Industry *</label>
                      <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                        {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Specific Sector</label>
                      <input type="text" name="sector" value={formData.sector} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Neobank / GenAI DevTools" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Funding Stage</label>
                      <select name="fundingStage" value={formData.fundingStage} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                        {FUNDING_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Revenue Stage</label>
                      <select name="revenueStage" value={formData.revenueStage} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                        {REVENUE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Funding Required (INR)</label>
                      <input type="number" name="fundingRequired" value={formData.fundingRequired} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="5000000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Funding Raised (INR)</label>
                      <input type="number" name="fundingRaised" value={formData.fundingRaised} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="1000000" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">3. Pitch & Tech</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description (Deep Dive)</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full min-h-[120px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="Describe what you are building, the problem, and your market..." maxLength={2000} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tech Stack Tags</label>
                    <form onSubmit={handleSkillAdd} className="flex gap-2 mb-3">
                      <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} className="w-full flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="React, Node.js, Python..." />
                      <button type="submit" className="btn-secondary">Add</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {formData.techStack.map(skill => (
                        <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                          {skill} <XCircle size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => handleSkillRemove(skill)} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">4. Team Structure</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Team Size</label>
                    <input type="number" name="teamSize" value={formData.teamSize} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" min={1} />
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-bold text-gray-900 mb-4">Add Core Member</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <input type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      <input type="text" placeholder="Role (e.g. CTO, Co-Founder)" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <input type="url" placeholder="LinkedIn URL" value={newMember.linkedin} onChange={e => setNewMember({ ...newMember, linkedin: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      <input type="url" placeholder="Avatar Image URL" value={newMember.avatar} onChange={e => setNewMember({ ...newMember, avatar: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                    </div>
                    <button onClick={handleMemberAdd} className="btn-secondary text-emerald-600 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300">Add Member</button>
                  </div>
                  <div className="space-y-2">
                    {formData.teamMembers.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs overflow-hidden">
                            {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : m.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 leading-tight">{m.name}</div>
                            <div className="text-xs text-gray-500 font-medium">{m.role}</div>
                          </div>
                        </div>
                        <button onClick={() => handleMemberRemove(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">5. Socials & Pitch Deck</h3>
                  <div>
                    <FileUpload label="Pitch Deck (PDF)" accept=".pdf" currentFileUrl={formData.pitchDeck} onUploadSuccess={(url) => setFormData(p => ({ ...p, pitchDeck: url }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">YouTube Pitch Video Link</label>
                    <input type="url" name="videoPitch" value={formData.videoPitch} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="https://youtube.com/watch?v=..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">LinkedIn URL</label>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="https://linkedin.com/company/..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Twitter / X URL</label>
                      <input type="url" name="twitter" value={formData.twitter} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" placeholder="https://twitter.com/..." />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Actions */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button disabled={step === 1} onClick={() => setStep(s => s - 1)} className={`btn-secondary ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <ArrowLeft size={16} /> Back
                </button>
                {step < 5 ? (
                  <button disabled={step === 1 && !formData.startupName} onClick={() => setStep(s => s + 1)} className="btn-primary px-8">
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleFormSubmit} disabled={saving} className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 px-8">
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
                <div className="w-24 h-24 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden">
                  {profile.logo ? <img src={profile.logo} alt="" className="w-full h-full object-cover" /> : profile.startupName.slice(0, 2).toUpperCase()}
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{profile.startupName}</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{profile.industry}</p>
                
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
                  <span className="text-xs font-bold text-gray-600">Profile Completeness</span>
                  <span className="text-sm font-black text-violet-600">{profile.completionScore || 100}%</span>
                </div>

                {!isEditMode ? (
                  <button onClick={() => setIsEditMode(true)} className="w-full btn-secondary text-violet-700 border-violet-200 hover:bg-violet-50">
                    <Edit size={16} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button onClick={handleFormSubmit} disabled={saving} className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200">
                      <Save size={16} /> {saving ? 'Saving...' : 'Save Updates'}
                    </button>
                    <button onClick={() => { setIsEditMode(false); fetchProfile() }} className="w-full btn-secondary">
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
                  {profile.tagline && (
                    <div className="border-l-4 border-violet-500 pl-4">
                      <p className="text-lg font-medium italic text-gray-600">"{profile.tagline}"</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">About The Venture</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{profile.description || "No description provided yet."}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Funding Stage</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{profile.fundingStage?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Stage</p>
                      <p className="text-sm font-bold text-gray-900 capitalize">{profile.revenueStage?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Required</p>
                      <p className="text-sm font-bold text-gray-900">{profile.fundingRequired ? `₹${profile.fundingRequired.toLocaleString('en-IN')}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Raised</p>
                      <p className="text-sm font-bold text-gray-900">{profile.fundingRaised ? `₹${profile.fundingRaised.toLocaleString('en-IN')}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900">{profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Team Size</p>
                      <p className="text-sm font-bold text-gray-900">{profile.teamSize || 1} members</p>
                    </div>
                  </div>

                  {profile.techStack?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.techStack.map(s => (
                          <span key={s} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.teamMembers?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Core Team</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.teamMembers.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden">
                              {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : m.name.slice(0, 1)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">{m.name}</p>
                              <p className="text-xs font-medium text-gray-500">{m.role}</p>
                            </div>
                            {m.linkedin && (
                              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-700">
                                <Link2 size={16} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Resources & Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.pitchDeck && (
                        <a href={profile.pitchDeck} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                          <FolderLock size={16} /> Pitch Deck
                        </a>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                          <Globe size={16} /> Website
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn-secondary">
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
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Startup Basics</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Startup Name</label>
                        <input type="text" name="startupName" value={formData.startupName} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tagline</label>
                        <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full min-h-[100px] bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Logo URL</label>
                          <input type="text" name="logo" value={formData.logo} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Website URL</label>
                          <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Sector & Financing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Industry</label>
                        <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                          {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.toUpperCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Specific Sector</label>
                        <input type="text" name="sector" value={formData.sector} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Funding Stage</label>
                        <select name="fundingStage" value={formData.fundingStage} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                          {FUNDING_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Revenue Stage</label>
                        <select name="revenueStage" value={formData.revenueStage} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm">
                          {REVENUE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Funding Required (INR)</label>
                        <input type="number" name="fundingRequired" value={formData.fundingRequired} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Funding Raised (INR)</label>
                        <input type="number" name="fundingRaised" value={formData.fundingRaised} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Location & Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Team Size</label>
                        <input type="number" name="teamSize" value={formData.teamSize} onChange={handleInputChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm" />
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
