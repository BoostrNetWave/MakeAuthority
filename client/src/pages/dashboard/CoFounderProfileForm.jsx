import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUpload from '@/components/FileUpload'

const INDUSTRIES = [
  "fintech", "healthtech", "edtech", "agritech",
  "saas", "ecommerce", "logistics", "cleantech",
  "deeptech", "gaming", "media", "legaltech",
  "hrtech", "proptech", "foodtech", "other"
]

export default function CoFounderProfileForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    currentRole: 'business',
    experienceYears: 0,
    skills: '',
    bio: '',
    linkedinUrl: '',
    avatar: '',
    lookingForRole: 'technical',
    industryInterests: [],
    city: '',
    state: '',
    country: 'India',
    status: 'actively_looking'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleIndustryToggle = (industry) => {
    setFormData(prev => {
      const isSelected = prev.industryInterests.includes(industry)
      if (isSelected) {
        return { ...prev, industryInterests: prev.industryInterests.filter(i => i !== industry) }
      } else {
        return { ...prev, industryInterests: [...prev.industryInterests, industry] }
      }
    })
  }

  const handleImageUpload = (url) => {
    setFormData(prev => ({ ...prev, avatar: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        experienceYears: Number(formData.experienceYears),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      }

      const res = await api.post('/cofounders/profile', payload)
      if (res.data.success) {
        navigate('/cofounder-match')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create profile.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <Link to="/cofounder-match" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Matches
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Co-Founder Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your profile to join the matchmaking pool.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center mb-8">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* Avatar Upload */}
          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Picture</h3>
            <FileUpload
              onUpload={handleImageUpload}
              defaultImage={formData.avatar}
              folder="boostr_cofounders"
            />
          </div>

          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Who You Are</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Current Role *
                </label>
                <select name="currentRole" value={formData.currentRole} onChange={handleChange} required className={inputClass}>
                  <option value="technical">Technical (CTO)</option>
                  <option value="business">Business (CEO/COO)</option>
                  <option value="marketing">Marketing (CMO)</option>
                  <option value="design">Design</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Experience (Years) *
                </label>
                <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} required min={0} max={40} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Skills (Comma separated)
              </label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Growth Hacking, Sales" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                LinkedIn URL
              </label>
              <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength={1000} placeholder="Tell potential co-founders about yourself..." className={`${inputClass} min-h-[120px]`} />
            </div>
          </div>

          <div className="bg-white p-4 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">What You're Looking For</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Looking for Role *
                </label>
                <select name="lookingForRole" value={formData.lookingForRole} onChange={handleChange} required className={inputClass}>
                  <option value="technical">Technical (CTO)</option>
                  <option value="business">Business (CEO/COO)</option>
                  <option value="marketing">Marketing (CMO)</option>
                  <option value="design">Design</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="legal">Legal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Status *
                </label>
                <select name="status" value={formData.status} onChange={handleChange} required className={inputClass}>
                  <option value="actively_looking">Actively Looking</option>
                  <option value="open_to_ideas">Open to Ideas</option>
                  <option value="not_looking">Not Looking right now</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Industry Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => {
                  const isSelected = formData.industryInterests.includes(ind)
                  return (
                    <button key={ind} type="button" onClick={() => handleIndustryToggle(ind)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${isSelected ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}>
                      {ind.toUpperCase()}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm shadow-violet-200 flex items-center gap-2 transition-all">
              {loading ? 'Saving...' : 'Save Profile'} <Save size={18} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
