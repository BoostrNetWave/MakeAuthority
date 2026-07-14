import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Clock, Bookmark, Plus } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

const EVENT_TYPES = [
  { name: 'All Events', value: '' },
  { name: 'Networking', value: 'Networking Mixer' },
  { name: 'Workshops', value: 'Workshop' },
  { name: 'Demo Days', value: 'Demo Day' },
  { name: 'Conferences', value: 'Conference' }
]

const TYPE_COLORS = {
  'Networking Mixer': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', dot: 'bg-violet-500' },
  'Workshop': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' },
  'Demo Day': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-500' },
  'Conference': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', dot: 'bg-red-500' },
  'Webinar': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' },
  'Pitch Competition': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', dot: 'bg-pink-500' },
  'Investor Meet': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' }
}

export default function EventsDirectory() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [type])

  const fetchEvents = async (searchQuery = '') => {
    try {
      setLoading(true)
      let url = `/events?`
      if (type) url += `type=${type}&`
      if (searchQuery) url += `search=${searchQuery}&`
      
      const res = await api.get(url)
      if (res.data.success) {
        setEvents(res.data.events)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchEvents(search)
  }

  const getDayAndMonth = (dateString) => {
    const d = new Date(dateString)
    return {
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    }
  }

  const getTimeString = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const canCreateEvent = ['super_admin', 'incubator', 'community_partner'].includes(user?.role)

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50/30">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                Ecosystem Events
              </h1>
              <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {events.length} upcoming events this month
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm"
                />
              </form>
              
              {canCreateEvent && (
                <Link to="/dashboard/events/new" className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 shrink-0">
                  <Plus size={16} /> Create Event
                </Link>
              )}
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            {EVENT_TYPES.map(c => {
              const active = type === c.value
              return (
                <button
                  key={c.name}
                  onClick={() => setType(c.value)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>

          {/* RESULTS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-56 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming events found</h3>
              <p className="text-sm text-gray-500 font-medium">Try adjusting your search or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {events.map((event) => {
                const colors = TYPE_COLORS[event.type] || TYPE_COLORS['Networking Mixer']
                const dateObj = getDayAndMonth(event.startDateTime)
                
                return (
                  <div key={event._id} className="card p-4 md:p-6 flex flex-col hover:border-violet-300 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${colors.dot}`} />
                    
                    <div className="flex gap-6 pl-2">
                      {/* LEFT DATE BOX */}
                      <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0">
                        <span className={`text-xl font-black leading-none mb-1 ${colors.text}`}>{dateObj.day}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dateObj.month}</span>
                      </div>

                      {/* RIGHT CONTENT */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-current/10 ${colors.bg} ${colors.text}`}>
                            {event.type}
                          </span>
                          <button className="text-gray-300 hover:text-gray-500 transition-colors">
                            <Bookmark size={18} />
                          </button>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                          {event.title}
                        </h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <MapPin size={16} className="text-gray-400" /> {event.format === 'Online' ? 'Online Event' : event.location || 'TBA'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Clock size={16} className="text-gray-400" /> {getTimeString(event.startDateTime)} - {getTimeString(event.endDateTime)}
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex justify-between items-center mt-auto">
                          {/* Avatars */}
                          <div className="flex items-center">
                            <div className="flex -space-x-2">
                              {[1,2,3].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white"></div>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-400 ml-3">
                              +{event.capacity > 0 ? event.capacity : 50}
                            </span>
                          </div>

                          <Link to={`/events/${event._id}`} className="px-5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-sm border border-violet-200 hover:border-violet-300 transition-all">
                            Register
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </main>
      </div>
    </DashboardLayout>
  )
}
