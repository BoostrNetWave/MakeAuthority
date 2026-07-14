import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, AlignLeft, Users, Clock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUpload from '@/components/FileUpload'

export default function CreateEvent() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Webinar',
    format: 'Online',
    coverImage: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    meetingLink: '',
    capacity: 0,
    tags: [],
    status: 'Published'
  })

  const [newTag, setNewTag] = useState('')

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
      const res = await api.post('/events', formData)
      if (res.data.success) {
        navigate('/events')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <button onClick={() => navigate('/events')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Events
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Host an Event</h1>
            <p className="text-sm text-gray-500 mt-1">Publish a webinar, pitch day, or networking mixer to the ecosystem.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center mb-8">
            <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Event Title *
            </label>
            <input 
              type="text" required
              placeholder="e.g. Seed Funding Demystified"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Event Type
              </label>
              <select 
                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                className={inputClass}
              >
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
                <option value="Demo Day">Demo Day</option>
                <option value="Investor Meet">Investor Meet</option>
                <option value="Networking Mixer">Networking Mixer</option>
                <option value="Pitch Competition">Pitch Competition</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Format
              </label>
              <select 
                value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}
                className={inputClass}
              >
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Start Date & Time *
              </label>
              <input 
                type="datetime-local" required
                value={formData.startDateTime} onChange={e => setFormData({...formData, startDateTime: e.target.value})}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                End Date & Time *
              </label>
              <input 
                type="datetime-local" required
                value={formData.endDateTime} onChange={e => setFormData({...formData, endDateTime: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>

          {formData.format !== 'Online' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Physical Location
              </label>
              <input 
                type="text" 
                placeholder="e.g. 123 Startup Hub, Block B, Bangalore"
                value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                className={inputClass}
              />
            </div>
          )}

          {formData.format !== 'In-Person' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Meeting Link (Zoom, Meet, etc)
              </label>
              <input 
                type="url" 
                placeholder="https://zoom.us/j/123456"
                value={formData.meetingLink} onChange={e => setFormData({...formData, meetingLink: e.target.value})}
                className={inputClass}
              />
            </div>
          )}

          <div>
            <FileUpload 
              label="Event Banner Image" 
              accept="image/*" 
              currentFileUrl={formData.coverImage} 
              onUploadSuccess={(url) => setFormData(p => ({ ...p, coverImage: url }))} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea 
              required rows={6}
              placeholder="Describe what attendees will learn, agenda, speakers, etc."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className={`${inputClass} min-h-[120px]`}
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="flex gap-3 mb-3">
              <input 
                type="text" 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleTagAdd(e)}
                placeholder="e.g. Fundraising, SaaS, AI" 
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
                  <span className="cursor-pointer text-violet-400 hover:text-violet-700" onClick={() => handleTagRemove(tag)}>×</span>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Capacity (0 for unlimited)
            </label>
            <input 
              type="number" min="0"
              value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 text-gray-500 hover:text-gray-900 font-bold rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm shadow-violet-200 flex items-center justify-center gap-2 transition-all min-w-[200px]">
              {loading ? 'Publishing...' : 'Publish Event'} <ArrowRight size={18} />
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  )
}
