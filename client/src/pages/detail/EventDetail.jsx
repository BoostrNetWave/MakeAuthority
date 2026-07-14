import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Users, ArrowLeft, Clock, Share2, Plus, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

export default function EventDetail() {
  const { user } = useAuth()
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [registration, setRegistration] = useState(null)
  const [registeredCount, setRegisteredCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/events/${id}`)
      if (res.data.success) {
        setEvent(res.data.event)
        setRegistration(res.data.registration)
        setRegisteredCount(res.data.registeredCount)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      setRegistering(true)
      setError('')
      const res = await api.post(`/events/${id}/register`)
      if (res.data.success) {
        setRegistration(res.data.registration)
        setRegisteredCount(prev => prev + 1)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    try {
      setRegistering(true)
      const res = await api.delete(`/events/${id}/register`)
      if (res.data.success) {
        setRegistration(null)
        setRegisteredCount(prev => prev - 1)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration')
    } finally {
      setRegistering(false)
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

  if (!event) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="font-bold text-xl">!</span>
          </div>
          <div className="text-red-600 font-bold mb-4">{error || 'Event not found'}</div>
          <Link to="/events" className="text-violet-600 hover:text-violet-700 font-bold flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Events
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isFull = event.capacity > 0 && registeredCount >= event.capacity
  const isPast = new Date(event.startDateTime) < new Date()

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <Link to="/events" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-bold mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        {/* HERO BANNER */}
        <div className="h-[400px] rounded-[24px] bg-white mb-12 overflow-hidden relative shadow-sm border border-gray-200">
          {event.coverImage ? (
            <img src={event.coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex gap-3 mb-4">
              <span className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                {event.type}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/20">
                {event.format}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-6 text-white/90 text-sm font-medium">
              <div className="flex items-center gap-2.5"><Calendar size={18} /> {new Date(event.startDateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="flex items-center gap-2.5"><Clock size={18} /> {new Date(event.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flex items-center gap-2.5"><MapPin size={18} /> {event.format === 'Online' ? 'Online Event' : event.location || 'TBA'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Event</h2>
            <div className="text-base text-gray-600 leading-relaxed mb-12 whitespace-pre-wrap font-medium">
              {event.description}
            </div>

            {event.speakers && event.speakers.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Speakers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {event.speakers.map((speaker, i) => (
                    <div key={i} className="flex gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-all hover:border-violet-300">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                        {speaker.avatar ? (
                          <img src={speaker.avatar} alt={speaker.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 bg-gray-100">
                            {speaker.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900 mb-1">{speaker.name}</div>
                        <div className="text-sm font-bold text-violet-600 mb-0.5">{speaker.title}</div>
                        <div className="text-sm text-gray-500 font-medium">{speaker.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 md:p-8 rounded-[24px] border border-gray-200 shadow-sm sticky top-8">
              
              {/* REGISTRATION TICKET OR ORGANIZER PANEL */}
              {user?._id === event.organizer?._id ? (
                <div className="text-center mb-8">
                  <div className="bg-violet-50 text-violet-700 p-3 rounded-xl font-bold mb-6 border border-violet-100 text-sm">
                    You are hosting this event
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {registeredCount}
                  </div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                    Users Registered
                  </div>
                </div>
              ) : registration && registration.status === 'Waitlisted' ? (
                <div className="text-center mb-8">
                  <div className="bg-amber-50 text-amber-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6 border border-amber-100">
                    <Clock size={20} /> You're on the Waitlist!
                  </div>
                  
                  <div className="text-sm text-gray-600 font-medium mb-6 leading-relaxed">
                    We'll automatically upgrade you to a full ticket if someone cancels. Keep an eye out!
                  </div>
                  
                  <button onClick={handleCancelRegistration} disabled={registering} className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                    {registering ? 'Cancelling...' : 'Leave Waitlist'}
                  </button>
                </div>
              ) : registration && registration.status === 'Registered' ? (
                <div className="text-center mb-8">
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-6 border border-emerald-100">
                    <CheckCircle2 size={20} /> You are registered!
                  </div>
                  
                  <div className="bg-gray-900 p-4 rounded-2xl inline-block mb-4 shadow-md">
                    {registration.qrCode ? (
                      <img src={registration.qrCode} alt="Event Ticket QR" className="w-48 h-48 rounded-xl bg-white" />
                    ) : (
                      <div className="w-48 h-48 bg-white/10 rounded-xl flex items-center justify-center text-white/50 font-bold">QR Pending</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 font-medium mb-6">Present this QR code at check-in.</div>
                  
                  <a href={`http://localhost:5000/api/events/${event._id}/calendar.ics`} download className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 w-full rounded-xl font-bold transition-colors mb-4">
                    <Calendar size={18} /> Add to Calendar
                  </a>

                  <button onClick={handleCancelRegistration} disabled={registering} className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                    {registering ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="text-2xl font-bold text-gray-900 mb-2">{isFull ? 'Waitlist Open' : 'Free Admission'}</div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-6">
                    <Users size={16} /> 
                    {event.capacity > 0 ? (
                      isFull ? 'Event is currently full' : `${event.capacity - registeredCount} spots remaining`
                    ) : (
                      'Unlimited capacity'
                    )}
                  </div>

                  {error && <div className="text-red-500 text-sm font-bold mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                  <button 
                    onClick={handleRegister} 
                    disabled={registering || isPast} 
                    className={`w-full py-4 rounded-xl text-base font-bold transition-colors shadow-sm
                      ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                        isFull ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' : 
                        'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-200'}`}
                  >
                    {registering ? 'Processing...' : isPast ? 'Event Ended' : isFull ? 'Join Waitlist' : 'Register Now'}
                  </button>
                </div>
              )}

              <div className="border-t border-gray-100 pt-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Organized By</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                    {event.organizer?.avatar ? (
                      <img src={event.organizer.avatar} alt="Organizer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                        {event.organizer?.name?.charAt(0) || 'O'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900">{event.organizer?.name}</div>
                    <Link to={`/incubators`} className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">View Profile</Link>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
