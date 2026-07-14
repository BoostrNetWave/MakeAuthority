import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Briefcase, Tag, DollarSign, AlignLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUpload from '@/components/FileUpload'

const CATEGORIES = [
  "Legal",
  "CA Services",
  "GST",
  "Trademark",
  "Patent",
  "Software Dev",
  "UI/UX",
  "Digital Marketing",
  "Fundraising Consultants"
]

export default function ListService() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    price: '',
    description: '',
    coverImage: '',
    tags: []
  })
  
  const [newTag, setNewTag] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleTagAdd = (e) => {
    e.preventDefault()
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/services', formData)
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => navigate('/marketplace'), 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">List a Service</h1>
            <p className="text-sm text-gray-500 mt-1">Offer your professional services to founders across the Boostr ecosystem.</p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 md:p-10 text-center shadow-sm">
            <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">Service Listed Successfully!</h2>
            <p className="text-emerald-600/80 font-medium">Your service is now live on the marketplace. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 font-bold text-sm mb-6 flex items-center gap-3">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Briefcase size={14} /> Service Title *
              </label>
              <input 
                type="text" required
                placeholder="e.g. Full-Stack Web Development for MVP"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Tag size={14} /> Category *
                </label>
                <select 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className={inputClass}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <DollarSign size={14} /> Pricing *
                </label>
                <input 
                  type="text" required
                  placeholder="e.g. ₹5,000 / hr or Custom Quote"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <FileUpload 
                label="Service Cover Image" 
                accept="image/*" 
                currentFileUrl={formData.coverImage} 
                onUploadSuccess={(url) => setFormData(p => ({ ...p, coverImage: url }))} 
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Tag size={14} /> Service Tags
              </label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={newTag} 
                  onChange={e => setNewTag(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleTagAdd(e)}
                  placeholder="e.g. React, Branding, SEO" 
                  className={`${inputClass} flex-1`}
                />
                <button type="button" onClick={handleTagAdd} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  Add
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-100">
                    {tag}
                    <XCircle size={14} className="cursor-pointer text-violet-400 hover:text-violet-700 transition-colors" onClick={() => handleTagRemove(tag)} />
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <AlignLeft size={14} /> Service Description *
              </label>
              <textarea 
                required rows={8}
                placeholder="Describe what you offer, your process, and what founders can expect..."
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className={`${inputClass} min-h-[160px]`}
              />
            </div>

            <div className="pt-4 flex justify-end border-t border-gray-100">
              <button type="submit" disabled={loading} className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl shadow-sm shadow-fuchsia-200 flex items-center justify-center gap-2 transition-all min-w-[220px]">
                {loading ? 'Publishing...' : <><Plus size={18} /> Publish Listing</>}
              </button>
            </div>
          </form>
        )}

      </div>
    </DashboardLayout>
  )
}
