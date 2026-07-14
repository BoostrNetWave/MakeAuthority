import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowUp, MessageSquare, Share2, MoreHorizontal, TrendingUp, ShieldCheck, UserPlus } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

export default function CommunityForum() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [trendingTags, setTrendingTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchTrendingTags()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts?sort=newest')
      if (res.data.success) {
        setPosts(res.data.posts)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const res = await api.get('/community/tags/trending')
      if (res.data.success) {
        setTrendingTags(res.data.tags)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpvote = async (postId) => {
    try {
      const res = await api.post(`/community/posts/${postId}/upvote`)
      if (res.data.success) {
        setPosts(posts.map(p => {
          if (p._id === postId) {
            const hasUpvoted = p.upvotes?.includes(user._id)
            let newUpvotes = [...(p.upvotes || [])]
            if (hasUpvoted) {
              newUpvotes = newUpvotes.filter(id => id !== user._id)
            } else {
              newUpvotes.push(user._id)
            }
            return { ...p, upvoteCount: res.data.upvotes, upvotes: newUpvotes }
          }
          return p
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + 'y ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + 'mo ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + 'd ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + 'h ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + 'm ago'
    return Math.floor(seconds) + 's ago'
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Founder Community</h1>
            <p className="text-gray-500 font-medium">Connect, share insights, and grow with 5,000+ startup builders.</p>
          </div>
          <Link to="/community/new" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold transition-all shadow-sm shadow-violet-200">
            <Plus size={18} /> New Post
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10 items-start">
          
          {/* LEFT: MAIN FEED */}
          <div className="min-w-0">
            {loading ? (
              <div className="text-center text-gray-500 font-medium py-16">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="text-gray-500 font-medium">No posts yet. Be the first to start a discussion!</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {posts.map(post => {
                  const hasUpvoted = post.upvotes?.includes(user?._id)
                  return (
                    <div key={post._id} className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md hover:border-violet-200">
                      
                      {/* Post Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {post.author?.avatar ? (
                              <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                                {post.author?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-gray-900">{post.author?.name}</div>
                            <div className="text-xs font-medium text-gray-500">
                              {post.author?.role} • {timeAgo(post.createdAt)}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      {/* Post Body */}
                      <Link to={`/community/${post._id}`} className="block group">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-violet-600 transition-colors">
                          {post.title}
                        </h3>
                        {post.coverImage && (
                          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-4">
                            <img src={post.coverImage} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {post.tags.map(tag => (
                              <span key={tag} className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-bold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>

                      {/* Post Footer */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="flex gap-6">
                          <button 
                            onClick={() => handleUpvote(post._id)} 
                            className={`flex items-center gap-2 text-sm font-bold transition-colors ${hasUpvoted ? 'text-violet-600' : 'text-gray-500 hover:text-gray-900'}`}
                          >
                            <ArrowUp size={18} /> {post.upvoteCount}
                          </button>
                          <Link to={`/community/${post._id}`} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            <MessageSquare size={18} /> {post.commentCount}
                          </Link>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                          <Share2 size={18} /> Share
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: SIDEBAR */}
          <div className="flex flex-col gap-6 sticky top-8">
            
            {/* Trending Topics Widget */}
            <div className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-lg font-extrabold text-gray-900 tracking-tight">
                <TrendingUp size={20} className="text-violet-600" /> Trending Topics
              </div>
              <div className="flex flex-col gap-4">
                {trendingTags.slice(0, 5).map(tag => (
                  <div key={tag._id} className="group cursor-pointer">
                    <div className="text-sm font-bold text-violet-600 mb-1 group-hover:text-violet-700 transition-colors">#{tag._id}</div>
                    <div className="text-xs font-medium text-gray-500">{tag.count} posts this week</div>
                  </div>
                ))}
                {trendingTags.length === 0 && <div className="text-sm font-medium text-gray-500">No trending tags yet.</div>}
              </div>
              <button className="w-full mt-6 py-2 text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
                View all trends
              </button>
            </div>

            {/* Suggested Founders Widget */}
            <div className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 shadow-sm">
              <div className="text-lg font-extrabold text-gray-900 tracking-tight mb-6">Suggested Founders</div>
              <div className="flex flex-col gap-4">
                {/* Mock data for layout matching */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">J</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">James Low</div>
                      <div className="text-xs font-medium text-gray-500">SaaS Expert</div>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">Follow</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">A</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Aria Moretti</div>
                      <div className="text-xs font-medium text-gray-500">Growth Lead</div>
                    </div>
                  </div>
                  <button className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">Follow</button>
                </div>
              </div>
            </div>

            {/* Platform Rules Widget */}
            <div className="bg-violet-50 rounded-[24px] p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 text-[15px] font-extrabold text-violet-900">
                <ShieldCheck size={18} className="text-violet-600" /> Community Rules
              </div>
              <ul className="text-xs font-medium text-violet-700 space-y-2 leading-relaxed">
                <li>1. Be respectful and constructive.</li>
                <li>2. No direct self-promotion outside weekly threads.</li>
                <li>3. Help others build and scale.</li>
                <li>4. Report spam to moderators.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
