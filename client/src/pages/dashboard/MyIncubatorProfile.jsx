import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2, Save, ArrowLeft, CheckCircle2, AlertCircle, XCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import FileUpload from '@/components/FileUpload'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyIncubatorProfile() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    organizationName: '',
    programName: '',
    logo: '',
    description: '',
    category: 'private_accelerator',
    duration: '',
    alumniCount: 0,
    city: '',
    state: '',
    country: 'India',
    website: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    focusIndustries: [],
    benefits: []
  })

  const [newIndustry, setNewIndustry] = useState('')
  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/incubators/profile/me')
        if (data.success && data.incubator) {
          setFormData({
            ...data.incubator,
            focusIndustries: data.incubator.focusIndustries || [],
            benefits: data.incubator.benefits || []
          })
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addIndustry = () => {
    if (newIndustry.trim() && !formData.focusIndustries.includes(newIndustry.trim())) {
      setFormData(prev => ({ ...prev, focusIndustries: [...prev.focusIndustries, newIndustry.trim()] }))
      setNewIndustry('')
    }
  }

  const removeIndustry = (ind) => {
    setFormData(prev => ({ ...prev, focusIndustries: prev.focusIndustries.filter(i => i !== ind) }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (ben) => {
    setFormData(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== ben) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let res
      if (formData._id) {
        res = await api.put('/incubators/profile/me', formData)
      } else {
        res = await api.post('/incubators/profile/me', formData)
      }
      
      if (res.data.success) {
        setSuccess('Incubator profile saved successfully!')
        const saved = res.data.incubator
        setFormData({
            ...saved,
            focusIndustries: saved.focusIndustries || [],
            benefits: saved.benefits || []
        })
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 items-center justify-center h-64 w-full">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Incubator Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Set up your incubator details to attract founders.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center mb-8">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Organization Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Organization Name *</label>
                <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Program Name</label>
                <input type="text" name="programName" value={formData.programName} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                  <option value="iit_incubator">IIT Incubator</option>
                  <option value="iim_incubator">IIM Incubator</option>
                  <option value="university_incubator">University Incubator</option>
                  <option value="government_incubator">Government Incubator</option>
                  <option value="corporate_accelerator">Corporate Accelerator</option>
                  <option value="private_accelerator">Private Accelerator</option>
                </select>
              </div>
              <div>
                <FileUpload 
                  label="Logo URL" 
                  accept="image/*" 
                  currentFileUrl={formData.logo} 
                  onUploadSuccess={(url) => setFormData(p => ({ ...p, logo: url }))} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className={`${inputClass} min-h-[120px]`} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Program Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (e.g., 6 Months)</label>
                <input type="text" name="duration" value={formData.duration} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alumni Count</label>
                <input type="number" name="alumniCount" value={formData.alumniCount} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Benefits (Add one by one)</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="e.g., Seed Funding up to ₹50L"
                  className={`${inputClass} flex-1`}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <button type="button" onClick={addBenefit} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                    {b} <XCircle size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeBenefit(b)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Focus Industries</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="e.g., Fintech"
                  className={`${inputClass} flex-1`}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                />
                <button type="button" onClick={addIndustry} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.focusIndustries.map((ind, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                    {ind} <XCircle size={14} className="cursor-pointer opacity-70 hover:opacity-100" onClick={() => removeIndustry(ind)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Location & Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Website</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={saving} className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm shadow-violet-200 flex items-center gap-2 transition-all">
              {saving ? 'Saving...' : 'Save Profile'} <Save size={18} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
