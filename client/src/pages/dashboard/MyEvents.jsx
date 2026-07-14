import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, CheckCircle2, Ticket, Clock, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function MyEvents() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      const res = await api.get('/events/my-events')
      if (res.data.success) {
        setRegistrations(res.data.registrations)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-100 flex items-center justify-center text-fuchsia-600">
              <Ticket size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Events & Passes</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your event registrations and access your QR passes.</p>
            </div>
          </div>
          <Link to="/events" className="hidden md:flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 transition-colors shadow-sm">
            <Calendar size={18} className="text-gray-400" /> Discover Events
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl text-center border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Ticket size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Registered Events</h3>
            <p className="text-gray-500 font-medium mb-8">You haven't registered for any events yet.</p>
            <Link to="/events" className="inline-block px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-xl transition-colors shadow-sm shadow-fuchsia-200">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map(reg => {
              const event = reg.event
              if (!event) return null
              const isPast = new Date(event.startDateTime) < new Date()
              
              let statusBorder = 'border-fuchsia-500'
              if (reg.status === 'Cancelled') statusBorder = 'border-red-500'
              else if (reg.attended) statusBorder = 'border-emerald-500'
              else if (isPast) statusBorder = 'border-gray-400'
              
              return (
                <div key={reg._id} className={`bg-white rounded-2xl p-6 border border-gray-200 flex flex-col relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md ${isPast || reg.status === 'Cancelled' ? 'opacity-70 grayscale-[30%]' : ''}`}>
                  {/* Status Banner */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    reg.status === 'Cancelled' ? 'bg-red-500' : 
                    reg.attended ? 'bg-emerald-500' : 
                    isPast ? 'bg-gray-400' : 'bg-fuchsia-500'
                  }`} />

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-600">
                      <Ticket size={14} /> {event.type}
                    </div>
                    {reg.attended ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        <CheckCircle2 size={12} /> Attended
                      </span>
                    ) : reg.status === 'Cancelled' ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        <AlertCircle size={12} /> Cancelled
                      </span>
                    ) : isPast ? (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        Ended
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {event.title}
                  </h3>

                  <div className="flex flex-col gap-3 mb-6 text-sm text-gray-600 font-medium">
                    <div className="flex items-start gap-2.5">
                      <Clock size={16} className="text-fuchsia-400 shrink-0 mt-0.5" /> <span>{formatDate(event.startDateTime)}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-fuchsia-400 shrink-0 mt-0.5" /> <span>{event.format === 'Online' ? 'Online Event' : event.location || 'TBA'}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-dashed border-gray-200 flex gap-5 items-center">
                    {/* QR Code Thumb */}
                    {reg.qrCode && reg.status === 'Registered' && !isPast && (
                      <div className="w-20 h-20 bg-gray-900 rounded-xl p-1 shrink-0">
                        <img src={reg.qrCode} alt="QR Code" className="w-full h-full object-cover rounded-lg" />
                      </div>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider uppercase">Registration ID</div>
                      <div className="text-xs font-mono text-gray-900 mb-3 truncate bg-gray-50 px-2 py-1 rounded">
                        {reg._id}
                      </div>
                      <Link to={`/events/${event._id}`} className="text-sm font-bold text-fuchsia-600 hover:text-fuchsia-700 transition-colors">
                        View Details →
                      </Link>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}
