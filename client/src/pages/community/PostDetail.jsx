import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowUp, MessageSquare, Share2, MoreHorizontal, ArrowLeft, Send } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/context/AuthContext'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  useEffect(() => {
    fetchPostData()
  }, [id])

  const fetchPostData = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/community/posts/${id}`),
        api.get(`/community/posts/${id}/comments`)
      ])
      
      if (postRes.data.success) {
        setPost(postRes.data.post)
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.comments)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePostUpvote = async () => {
    try {
      const res = await api.post(`/community/posts/${id}/upvote`)
      if (res.data.success) {
        const hasUpvoted = post.upvotes?.includes(user._id)
        let newUpvotes = [...(post.upvotes || [])]
        if (hasUpvoted) {
          newUpvotes = newUpvotes.filter(uid => uid !== user._id)
        } else {
          newUpvotes.push(user._id)
        }
        setPost({ ...post, upvoteCount: res.data.upvotes, upvotes: newUpvotes })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const res = await api.post(`/community/posts/${id}/comments`, {
        body: newComment,
        parentComment: replyingTo?._id || null
      })

      if (res.data.success) {
        setNewComment('')
        setReplyingTo(null)
        fetchPostData() // refresh comments tree
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

  const renderCommentTree = (commentList, level = 0) => {
    return commentList.map(comment => (
      <div key={comment._id} className={`mt-4 ${level > 0 ? 'ml-8 pl-4 border-l-2 border-gray-100' : ''}`}>
        <div className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
            {comment.author?.avatar ? (
              <img src={comment.author.avatar} alt="Author" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                {comment.author?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between mb-2">
                <div className="text-sm font-bold text-gray-900">
                  {comment.author?.name} <span className="text-gray-400 font-medium ml-2">{timeAgo(comment.createdAt)}</span>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-gray-700">
                {comment.body}
              </div>
            </div>
            
            {/* Comment Actions */}
            <div className="flex gap-4 mt-2 pl-2">
              <button className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowUp size={14} /> {comment.upvoteCount}
              </button>
              <button 
                onClick={() => setReplyingTo(comment)}
                className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Reply
              </button>
            </div>

            {/* Render Replies Recursively */}
            {comment.replies && comment.replies.length > 0 && renderCommentTree(comment.replies, level + 1)}
          </div>
        </div>
      </div>
    ))
  }

  if (loading) return <DashboardLayout><div className="p-16 text-center text-gray-500 font-medium">Loading...</div></DashboardLayout>
  if (!post) return <DashboardLayout><div className="p-16 text-center text-gray-500 font-medium">Post not found</div></DashboardLayout>

  const hasUpvoted = post.upvotes?.includes(user?._id)

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        
        <button onClick={() => navigate('/community')} className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Community
        </button>

        {/* POST CONTAINER */}
        <div className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-8 mb-10 shadow-sm">
          {/* Post Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 text-lg">
                    {post.author?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[17px] font-bold text-gray-900">{post.author?.name}</div>
                <div className="text-[13px] font-medium text-gray-500">
                  {post.author?.role} • {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 leading-snug tracking-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-xs font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.coverImage && (
            <div className="w-full rounded-2xl overflow-hidden mb-6">
              <img src={post.coverImage} alt="Cover" className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          <div className="text-[15px] leading-relaxed text-gray-800 mb-8 whitespace-pre-wrap">
            {post.body}
          </div>

          {/* Post Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <div className="flex gap-6">
              <button 
                onClick={handlePostUpvote} 
                className={`flex items-center gap-2 text-[15px] font-bold transition-colors ${hasUpvoted ? 'text-violet-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <ArrowUp size={20} /> {post.upvoteCount}
              </button>
              <div className="flex items-center gap-2 text-gray-500 text-[15px] font-bold">
                <MessageSquare size={20} /> {post.commentCount}
              </div>
            </div>
            <button className="flex items-center gap-2 text-[15px] font-bold text-gray-500 hover:text-gray-900 transition-colors">
              <Share2 size={20} /> Share
            </button>
          </div>
        </div>

        {/* COMMENTS SECTION */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Comments ({post.commentCount})</h3>
          
          {/* Add Comment Input */}
          <div className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 mb-10 shadow-sm">
            {replyingTo && (
              <div className="flex justify-between items-center mb-3 px-3 py-2 bg-violet-50 rounded-lg">
                <span className="text-xs font-bold text-violet-600">Replying to {replyingTo.author?.name}</span>
                <button onClick={() => setReplyingTo(null)} className="text-[11px] font-bold text-violet-500 hover:text-violet-700">Cancel</button>
              </div>
            )}
            <form onSubmit={handleCommentSubmit} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {user?.avatar ? (
                   <img src={user.avatar} alt="You" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full min-h-[80px] bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-xl p-4 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y"
                />
                <div className="flex justify-end mt-3">
                  <button 
                    type="submit" 
                    disabled={!newComment.trim()} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-bold text-sm transition-all shadow-sm shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} /> Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Comment Tree */}
          <div className="flex flex-col gap-6">
            {renderCommentTree(comments)}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
