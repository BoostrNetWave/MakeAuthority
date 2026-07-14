import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Briefcase, Mail, Send, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

export default function ServiceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [message, setMessage] = useState('')
  const [budget, setBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchService()
  }, [id])

  const fetchService = async () => {
    try {
      const { data } = await api.get(`/services/${id}`)
      if (data.success) {
        setService(data.service)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post(`/services/${id}/proposals`, { message, budget })
      if (res.data.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit proposal.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-2xl font-bold text-gray-900">Service not found.</div>
          <Link to="/marketplace" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-max">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          
          {/* LEFT COL: SERVICE INFO */}
          <div>
            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-200 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-violet-50 text-violet-600 border border-violet-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {service.category}
                </span>
                {service.averageRating > 0 && (
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                    <Star size={14} fill="currentColor" /> {service.averageRating.toFixed(1)} ({service.numReviews} reviews)
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
                {service.title}
              </h1>

              {/* Provider Mini Profile */}
              <div className="flex items-center gap-4 py-5 border-y border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                  {service.provider?.avatar 
                    ? <img src={service.provider.avatar} className="w-full h-full rounded-xl object-cover" /> 
                    : service.provider?.name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-bold text-gray-900 mb-0.5">{service.provider?.name}</div>
                  <div className="text-sm font-medium text-gray-500">Service Provider</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-200 shadow-sm mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this Service</h3>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {service.description}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews</h3>
              {service.reviews?.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {service.reviews.map(review => (
                    <div key={review._id} className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {/* Initials placeholder */}
                            <span className="text-[10px] font-bold text-gray-500">{(review.user?.name || 'U').charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{review.user?.name || 'User'}</span>
                        </div>
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                          ))}
                        </div>
                      </div>
                      <p className="m-0 text-sm text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 font-medium italic text-sm">No reviews yet.</div>
              )}
            </div>
          </div>

          {/* RIGHT COL: PRICING & PROPOSAL FORM */}
          <div className="lg:sticky lg:top-8 self-start">
            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-200 shadow-sm">
              
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Price</div>
              <div className="text-4xl font-extrabold text-emerald-500 mb-8 tracking-tight">
                {service.price}
              </div>

              {success ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 md:p-6 rounded-2xl text-center">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-emerald-600 mb-2">Proposal Sent!</h3>
                  <p className="text-sm text-emerald-700/80 font-medium m-0">The provider will review your enquiry and get back to you shortly.</p>
                </div>
              ) : user?.role === 'founder' ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <h3 className="text-lg font-bold text-gray-900 m-0">Send an Enquiry</h3>
                  
                  {error && (
                    <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm font-bold border border-red-100">{error}</div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Message</label>
                    <textarea 
                      required value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Hi, we are looking for help with..."
                      className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Budget (Optional)</label>
                    <input 
                      type="text" value={budget} onChange={e => setBudget(e.target.value)}
                      placeholder="e.g. ₹50,000 or Flexible"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder-gray-400"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-colors shadow-sm shadow-violet-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : <><Send size={18} /> Submit Enquiry</>}
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 p-4 md:p-6 rounded-2xl text-center border border-gray-200">
                  <p className="m-0 text-sm font-bold text-gray-500">Log in as a Founder to send enquiries to service providers.</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
