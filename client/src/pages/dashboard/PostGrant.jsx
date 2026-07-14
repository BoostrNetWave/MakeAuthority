import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function PostGrant() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'startup',
    description: '',
    minAmount: '',
    maxAmount: '',
    deadline: '',
    requirements: '',
    focusIndustries: '',
    websiteUrl: '',
    isRolling: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const payload = {
        ...formData,
        minAmount: formData.minAmount ? Number(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? Number(formData.maxAmount) : undefined,
        requirements: formData.requirements ? formData.requirements.split(',').map(s => s.trim()) : [],
        focusIndustries: formData.focusIndustries ? formData.focusIndustries.split(',').map(s => s.trim()) : []
      }
      
      const { data } = await api.post('/grants', payload)
      if (data.success) {
        navigate('/dashboard/admin')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post grant')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <button onClick={() => navigate('/dashboard/admin')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Post New Grant</h1>
            <p className="text-sm text-gray-500 mt-1">Add a funding opportunity for startups and founders.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center mb-8">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Grant Title *</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Innovation Seed Fund" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Organization Name *</label>
              <input required name="organization" value={formData.organization} onChange={handleChange} placeholder="e.g. Startup India" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description *</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Detail what this grant provides..." rows={4} className={`${inputClass} min-h-[120px]`} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category *</label>
              <select required name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="startup">Startup</option>
                <option value="research">Research</option>
                <option value="ngo">NGO</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Min Amount ($)</label>
              <input type="number" name="minAmount" value={formData.minAmount} onChange={handleChange} placeholder="e.g. 10000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Max Amount ($)</label>
              <input type="number" name="maxAmount" value={formData.maxAmount} onChange={handleChange} placeholder="e.g. 50000" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Application Deadline</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} disabled={formData.isRolling} className={`${inputClass} ${formData.isRolling ? 'opacity-50' : ''}`} />
              <label className="flex items-center gap-2 mt-3 text-sm font-bold text-gray-600 cursor-pointer select-none">
                <input type="checkbox" name="isRolling" checked={formData.isRolling} onChange={handleChange} className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500" /> This grant has a rolling deadline
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Official Website URL</label>
              <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requirements (Comma-separated)</label>
            <input name="requirements" value={formData.requirements} onChange={handleChange} placeholder="e.g. Registered in India, Early-stage, Tech focus" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Focus Industries (Comma-separated)</label>
            <input name="focusIndustries" value={formData.focusIndustries} onChange={handleChange} placeholder="e.g. AI, Healthcare, EdTech" className={inputClass} />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm shadow-blue-200 flex items-center justify-center gap-2 transition-all min-w-[200px]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Post Grant'}
            </button>
          </div>
          
        </form>
      </div>
    </DashboardLayout>
  )
}
