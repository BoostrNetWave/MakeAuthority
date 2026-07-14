import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Briefcase, FileText, Layout, Code, PenTool, Lightbulb, TrendingUp, SlidersHorizontal } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

const CATEGORIES = [
  { name: 'All', icon: Briefcase },
  { name: 'Legal', icon: FileText },
  { name: 'CA Services', icon: TrendingUp },
  { name: 'GST', icon: FileText },
  { name: 'Trademark', icon: Star },
  { name: 'Patent', icon: Lightbulb },
  { name: 'Software Dev', icon: Code },
  { name: 'UI/UX', icon: Layout },
  { name: 'Digital Marketing', icon: TrendingUp },
  { name: 'Fundraising Consultants', icon: PenTool }
]

export default function ServiceMarketplace() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchServices()
  }, [category])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/services`, { params: { category, search } })
      if (data.success) {
        setServices(data.services)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchServices()
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full bg-gray-50/30">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                Service Marketplace
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Connecting elite startup providers across design, dev, and more.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <SlidersHorizontal size={16} /> Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                <TrendingUp size={16} /> Relevance
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-10">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                <input 
                  type="text" 
                  placeholder="Search providers, skills, or services..." 
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full py-4 pl-12 pr-4 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all shadow-sm font-medium"
                />
              </div>
            </form>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex gap-6 border-b border-gray-200 mb-10 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(c => {
              const active = category === c.name
              return (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={`pb-3 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                    active ? 'border-violet-600 text-violet-700' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>

          {/* RESULTS GRID */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-96 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No services found</h3>
              <p className="text-sm text-gray-500 font-medium">Try adjusting your search or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(service => (
                <div 
                  key={service._id}
                  className="card flex flex-col hover:border-violet-300 hover:shadow-lg transition-all group overflow-hidden"
                >
                  {/* COVER IMAGE */}
                  <div className="h-40 w-full relative bg-gray-100 shrink-0">
                    {service.coverImage ? (
                      <img src={service.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100" />
                    )}
                    
                    {/* TOP RATED BADGE */}
                    {service.averageRating >= 4.5 && (
                      <div className="absolute top-3 right-3 bg-white text-gray-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                        Top Rated
                      </div>
                    )}
                  </div>

                  {/* CARD BODY */}
                  <div className="p-4 md:p-6 flex flex-col flex-1 relative bg-white">
                    
                    {/* OVERLAPPING AVATAR */}
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border-4 border-white shadow-sm -mt-12 mb-4 flex items-center justify-center text-xl font-black text-gray-600 overflow-hidden shrink-0 relative z-10">
                      {service.provider?.avatar ? (
                        <img src={service.provider.avatar} alt="Provider" className="w-full h-full object-cover" />
                      ) : (
                        service.provider?.name?.slice(0,2).toUpperCase() || 'SP'
                      )}
                    </div>

                    {/* TITLE & RATING */}
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight tracking-tight line-clamp-2">
                        {service.title}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-black shrink-0 pt-1">
                        <Star size={14} className="fill-amber-500" /> {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'New'} 
                        <span className="text-gray-400 font-bold ml-0.5">({service.numReviews})</span>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-2 flex-1">
                      {service.description}
                    </p>

                    {/* TAGS */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(service.tags && service.tags.length > 0 ? service.tags : [service.category]).slice(0, 3).map((tag, i) => (
                        <span key={i} className="bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="flex justify-between items-center pt-5 border-t border-gray-100 mt-auto">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting at</div>
                        <div className="text-lg font-black text-gray-900">{service.price}</div>
                      </div>
                      <Link to={`/marketplace/${service._id}`} className="px-5 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-sm border border-violet-200 hover:border-violet-300 transition-all text-center">
                        View Service
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LOAD MORE BUTTON */}
          {!loading && services.length > 0 && (
            <div className="text-center mt-16 pb-8">
              <button className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                Load More Providers
              </button>
              <div className="text-xs font-medium text-gray-400 mt-4">
                Showing {services.length} elite providers
              </div>
            </div>
          )}

        </main>
      </div>
    </DashboardLayout>
  )
}
