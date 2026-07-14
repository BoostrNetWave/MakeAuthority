import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, X, Check, ExternalLink, Mail, AlertCircle, Calendar } from 'lucide-react'
import api from '@/lib/api'

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/notifications')
      if (res.data.success) {
        setNotifications(res.data.notifications)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'GRANT_ALERT': return <AlertCircle size={18} className="text-amber-500" />
      case 'EVENT': return <Calendar size={18} className="text-blue-500" />
      case 'MESSAGE': return <Mail size={18} className="text-emerald-500" />
      default: return <Bell size={18} className="text-violet-500" />
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
              <Bell size={20} className="text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Notifications</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Activity</span>
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Check size={14} /> Mark all read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <span className="text-sm font-medium text-gray-500">Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Bell size={24} className="text-gray-300" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">All caught up!</h3>
              <p className="text-sm text-gray-500 font-medium">You don't have any new notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`p-5 transition-colors flex gap-4 ${notification.isRead ? 'bg-white opacity-70' : 'bg-violet-50/30'}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm mb-1 ${notification.isRead ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                      {notification.link && (
                        <Link 
                          to={notification.link}
                          onClick={() => onClose()}
                          className="text-[12px] font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                          View Details <ExternalLink size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0 mt-2">
                      <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
