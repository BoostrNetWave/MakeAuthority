import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, User, Link, Image as ImageIcon,
  CheckCircle2, Settings as SettingsIcon, AlertCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: user?.name || '',
    linkedinId: user?.linkedinId || '',
    avatar: user?.avatar || ''
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
      const { data } = await api.put('/auth/me', formData)
      if (data.success) {
        setSuccess('Profile updated successfully!')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
            <SettingsIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your personal profile and account preferences.</p>
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

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6 md:space-y-8">
          
          <div>
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
              Personal Information
            </h2>

            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <ImageIcon size={14} /> Avatar URL
                </label>
                <input 
                  type="text" name="avatar" value={formData.avatar} onChange={handleChange}
                  placeholder="https://example.com/my-photo.jpg"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <User size={14} /> Full Name
                </label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Your Name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Link size={14} /> LinkedIn Profile
                </label>
                <input 
                  type="text" name="linkedinId" value={formData.linkedinId} onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input 
                type="email" value={user?.email || ''} disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-2 font-medium">Email address cannot be changed currently.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" disabled={loading}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm shadow-violet-200 flex items-center justify-center gap-2 transition-all min-w-[200px]"
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 md:p-6 rounded-2xl bg-red-50 border border-red-200">
          <h3 className="text-base font-bold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4 font-medium">Permanently delete your account and all associated data.</p>
          <button className="px-5 py-2.5 rounded-xl border-2 border-red-200 hover:border-red-300 text-red-600 font-bold text-sm bg-white hover:bg-red-50 transition-colors">
            Delete Account
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}
