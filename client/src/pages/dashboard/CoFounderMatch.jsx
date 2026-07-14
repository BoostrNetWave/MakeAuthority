import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, MapPin, Briefcase, Search, Filter,
  ChevronDown, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'

function Shimmer({ h = 14, r = 6, mb = 0, w = '100%' }) {
  return (
    <div style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} className="bg-gray-100 animate-pulse" />
  )
}

function MatchRing({ score }) {
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="60" height="60" className="-rotate-90">
        <circle cx="30" cy="30" r={radius} fill="none" className="stroke-gray-100" strokeWidth="4" />
        <circle 
          cx="30" cy="30" r={radius} fill="none" stroke="url(#gradient)" strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" className="transition-all duration-1000 ease-in-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-sm font-bold text-gray-900">
        {score}%
      </div>
    </div>
  )
}

export default function CoFounderMatch() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [myProfile, setMyProfile] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectingId, setConnectingId] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const profRes = await api.get('/cofounders/profile/me').catch(e => e.response)
        if (profRes.status === 404) {
          setLoading(false)
          return
        }
        
        if (profRes.data?.success) {
          setMyProfile(profRes.data.profile)
          
          const matchRes = await api.get('/cofounders/matches')
          if (matchRes.data?.success) {
            setMatches(matchRes.data.matches)
          }
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load co-founder data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleConnect = async (matchId) => {
    setConnectingId(matchId)
    try {
      await api.post(`/cofounders/connect/${matchId}`)
      toast.success('Connection request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.')
    } finally {
      setConnectingId(null)
    }
  }

  if (!loading && !myProfile && !error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-5 md:p-10">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mb-6 text-violet-600">
            <Users size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Find Your Perfect Co-Founder</h1>
          <p className="text-gray-500 text-base text-center max-w-md mb-8 leading-relaxed font-medium">
            Join our matchmaking pool to connect with other founders who complement your skills and share your vision.
          </p>
          <button 
            onClick={() => navigate('/dashboard/cofounder/new')}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-black transition-colors"
          >
            Create Co-Founder Profile
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Co-Founder Matching</h1>
          <p className="text-gray-500 font-medium text-sm">Find your perfect co-founder based on complementary skills and shared goals.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 font-bold text-sm mb-8 flex items-center gap-3">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* YOUR PROFILE SUMMARY */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8 mb-12 flex gap-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 shrink-0 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {myProfile?.avatar ? (
                <img src={myProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-gray-400">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Your Profile</h2>
              <button onClick={() => navigate('/dashboard/cofounder/edit')} className="bg-white border border-gray-200 text-gray-600 hover:text-gray-900 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
                Edit Profile
              </button>
            </div>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <span className="text-gray-900 font-bold">Role:</span>
                <span className="capitalize">{myProfile?.currentRole || 'N/A'}</span>
                <span className="mx-2 text-gray-200">|</span>
                <span className="text-gray-900 font-bold">Looking for:</span>
                <span className="capitalize">{myProfile?.lookingForRole || 'N/A'}</span>
              </div>
              
              <div className="flex items-start gap-2 text-gray-500 font-medium">
                <span className="text-gray-900 font-bold shrink-0">Skills:</span>
                <span>{myProfile?.skills?.length ? myProfile.skills.join(', ') : 'No skills listed'}</span>
              </div>
              
              <div className="flex items-start gap-2 text-gray-500 font-medium">
                <span className="text-gray-900 font-bold shrink-0">Bio:</span>
                <span>{myProfile?.bio || 'Add a short bio to attract better matches.'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BEST MATCHES SECTION */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Best Matches</h2>
            <p className="text-gray-500 text-sm font-medium">Found {matches.length} profile{matches.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="flex gap-3">
            {['Role', 'Skills', 'Industry', 'Experience Level'].map(f => (
              <button key={f} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                {f} <ChevronDown size={14} className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-sm">
                <div className="flex gap-4 mb-5">
                  <Shimmer w={56} h={56} r={28} />
                  <div className="flex-1 pt-1">
                    <Shimmer w="60%" h={18} mb={8} />
                    <Shimmer w="40%" h={14} />
                  </div>
                  <Shimmer w={60} h={60} r={30} />
                </div>
                <Shimmer w="80%" h={14} mb={12} />
                <Shimmer w="100%" h={28} mb={16} />
                <div className="flex gap-3">
                  <Shimmer w="50%" h={40} r={10} />
                  <Shimmer w="50%" h={40} r={10} />
                </div>
              </div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6 text-gray-300">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">
              We couldn't find any profiles that match your criteria right now. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map(match => (
              <div key={match._id} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-colors">
                {/* Purple glowing background hint */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-500/20 transition-colors" />

                <div className="flex justify-between items-start mb-5 relative">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      {match.user?.avatar ? (
                        <img src={match.user.avatar} alt={match.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                          {match.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{match.user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500 font-medium capitalize mt-1">{match.currentRole}</p>
                    </div>
                  </div>
                  <MatchRing score={match.matchScore || 85} />
                </div>

                <div className="mb-5 relative">
                  <p className="text-sm text-gray-600 line-clamp-2 font-medium leading-relaxed">{match.bio}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 relative">
                  {match.skills?.slice(0, 4).map(skill => (
                    <span key={skill} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                      {skill}
                    </span>
                  ))}
                  {match.skills?.length > 4 && (
                    <span className="bg-gray-50 border border-gray-200 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                      +{match.skills.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 relative">
                  <button 
                    onClick={() => handleConnect(match._id)}
                    disabled={connectingId === match._id}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-violet-200 disabled:opacity-70 flex items-center justify-center"
                  >
                    {connectingId === match._id ? 'Sending...' : 'Connect'}
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
