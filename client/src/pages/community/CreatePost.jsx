import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import FileUpload from '@/components/FileUpload'

export default function CreatePost() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    category: 'founder_discussion',
    body: '',
    tags: '',
    coverImage: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url) => {
    setFormData(prev => ({ ...prev, coverImage: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Split tags by comma, trim, and filter empty strings
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      if (tagsArray.length > 5) {
        setError('Maximum 5 tags allowed.')
        setLoading(false)
        return
      }

      const payload = {
        title: formData.title,
        category: formData.category,
        body: formData.body,
        tags: tagsArray,
        coverImage: formData.coverImage
      }

      const res = await api.post('/community/posts', payload)
      
      if (res.data.success) {
        navigate(`/community/${res.data.post._id}`)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create post.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <Link to="/community" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Community
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Create a Post</h1>
        <p className="text-gray-500 font-medium mb-10">Share your thoughts, ask questions, or provide valuable insights.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="e.g., How did you approach your first investor meeting?"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm appearance-none"
              >
                <option value="founder_discussion">Founder Discussion</option>
                <option value="qa">Q&A</option>
                <option value="industry">Industry News</option>
                <option value="mentor">Mentorship & Advice</option>
                <option value="knowledge">Knowledge Base</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags (comma separated, max 5)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., fundraising, saas, growth"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                <FileUpload
                  onUpload={handleImageUpload}
                  defaultImage={formData.coverImage}
                  folder="boostr_community"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Body *
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                maxLength={10000}
                placeholder="Write your post here..."
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-4 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm min-h-[250px] resize-y"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-[14px] font-bold text-[15px] transition-all shadow-sm shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : <><Send size={18} /> Publish Post</>}
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
