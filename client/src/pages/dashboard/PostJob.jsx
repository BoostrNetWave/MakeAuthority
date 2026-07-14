import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Briefcase, MapPin, DollarSign, ListChecks, Type, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function PostJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'Full-time',
    workModel: 'Remote',
    salaryRange: '',
    description: '',
    requirements: '',
    applyUrl: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
      }

      const { data } = await api.post('/jobs', payload)
      if (data.success) {
        setSuccess('Job posted successfully!')
        setTimeout(() => {
          navigate('/jobs')
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <button onClick={() => navigate('/jobs')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Post a New Job</h1>
            <p className="text-sm text-gray-500 mt-1">Find the best talent from the Boostr ecosystem to join your startup.</p>
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

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Type size={14} /> Job Title
              </label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="e.g. Senior Frontend Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <Briefcase size={14} /> Company Name
              </label>
              <input 
                type="text" name="companyName" value={formData.companyName} onChange={handleChange} required
                placeholder="Your Startup Name"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <MapPin size={14} /> Location
              </label>
              <input 
                type="text" name="location" value={formData.location} onChange={handleChange} required
                placeholder="e.g. San Francisco, CA or Remote"
                className={inputClass}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <DollarSign size={14} /> Salary Range
              </label>
              <input 
                type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange}
                placeholder="e.g. $120k - $150k"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Type</label>
              <select 
                name="jobType" value={formData.jobType} onChange={handleChange}
                className={inputClass}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Work Model</label>
              <select 
                name="workModel" value={formData.workModel} onChange={handleChange}
                className={inputClass}
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} required
              placeholder="Describe the role, responsibilities, and impact..."
              rows={5}
              className={`${inputClass} min-h-[120px]`}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <ListChecks size={14} /> Requirements (One per line)
            </label>
            <textarea 
              name="requirements" value={formData.requirements} onChange={handleChange} required
              placeholder="3+ years of React experience&#10;Strong understanding of UI/UX principles&#10;Excellent communication skills..."
              rows={5}
              className={`${inputClass} min-h-[120px] whitespace-pre-wrap`}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 transition-all min-w-[200px]"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Post Job'} <Save size={18} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
