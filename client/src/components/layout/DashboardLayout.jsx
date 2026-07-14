import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '@/lib/api'
import NotificationDrawer from '../notifications/NotificationDrawer'
import {
  Compass, LayoutDashboard, Wrench, BarChart2,
  Users, Settings, HelpCircle, LogOut, Bell,
  Search, Plus, ChevronDown, Menu, X,
  Building2, Briefcase, FileText, Bot, CalendarDays,
  Target, Lightbulb, UserCircle, Zap, Box, Ticket, MessageSquare
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 60000) // Poll every 60s
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      if (res.data.success) {
        setUnreadCount(res.data.count)
      }
    } catch (err) {
      // silent fail for polling
    }
  }

  const getNavSections = () => {
    const role = user?.role || 'guest'
    
    const ecosystem = [
      { icon: Building2,    label: 'Startups',     path: '/startups' },
      { icon: Users,        label: 'Investors',    path: '/investors' },
      { icon: Target,       label: 'Incubators',   path: '/incubators' },
      { icon: Briefcase,    label: 'Jobs',          path: '/jobs' },
      { icon: Lightbulb,   label: 'Grants',        path: '/grants' },
      { icon: Box,          label: 'Marketplace',  path: '/marketplace' },
      { icon: CalendarDays, label: 'Events',       path: '/events' },
      { icon: MessageSquare,label: 'Community',    path: '/community' },
      { icon: Bot,          label: 'AI Assistant', path: '/ai' },
      { icon: Target,       label: 'Data Vault',   path: '/vault' },
    ]

    let dashboard = []
    
    if (role === 'founder') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard/founder' },
        { icon: Box,             label: 'My Startup',       path: '/my-startup' },
        { icon: FileText,        label: 'Manage Applicants',path: '/jobs/manage' },
        { icon: Users,           label: 'Co-Founders',      path: '/cofounder-match' },
        { icon: Ticket,          label: 'My Events',        path: '/dashboard/events/my-events' },
      ]
    } else if (role === 'investor') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard/investor' },
        { icon: UserCircle,      label: 'My Profile', path: '/profile/investor' },
        { icon: Ticket,          label: 'My Events',  path: '/dashboard/events/my-events' },
      ]
    } else if (role === 'incubator') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Dashboard',  path: '/dashboard/incubator' },
        { icon: Building2,       label: 'Edit Profile',path: '/my-incubator' },
        { icon: Plus,            label: 'Post Event', path: '/dashboard/events/new' },
        { icon: Ticket,          label: 'My Events',  path: '/dashboard/events/my-events' },
      ]
    } else if (role === 'super_admin') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Admin Panel', path: '/dashboard/admin' },
        { icon: Plus,            label: 'Post Grant',  path: '/admin/grants/new' },
        { icon: Plus,            label: 'Post Job',    path: '/jobs/new' },
        { icon: Plus,            label: 'Post Event',  path: '/dashboard/events/new' },
        { icon: Ticket,          label: 'My Events',   path: '/dashboard/events/my-events' },
      ]
    } else if (role === 'service_provider') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard/service_provider' },
        { icon: Plus,            label: 'List a Service', path: '/dashboard/services/new' },
        { icon: Ticket,          label: 'My Events',      path: '/dashboard/events/my-events' },
      ]
    } else if (role === 'job_seeker') {
      dashboard = [
        { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard/jobseeker' },
        { icon: FileText,        label: 'My Applications', path: '/jobs/my-applications' },
        { icon: Ticket,          label: 'My Events',       path: '/dashboard/events/my-events' },
      ]
    } else {
      dashboard = [{ icon: Compass, label: 'Discover', path: '/discover' }]
    }

    return [
      { heading: 'WORKSPACE', items: dashboard },
      { heading: 'ECOSYSTEM', items: ecosystem }
    ]
  }

  const sections = getNavSections()
  const initials = user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ── MOBILE BACKDROP ─────────────────────────────── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col h-screen transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Mobile Sidebar Header (Close button) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 no-underline" onClick={() => setSidebarOpen(false)}>
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">B</span>
            </div>
            <span className="text-base font-bold text-gray-900">Boostr</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 hidden lg:block">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">B</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Boostr</span>
          </Link>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                {user?.avatar
                  ? <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  : initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-violet-500 font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Button */}
        {user && (
          <div className="px-3 py-3 border-b border-gray-100">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-gray-400 group-hover:text-violet-600 transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Notifications</span>
              </div>
              {unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                {section.heading}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item, idx) => {
                  const Icon = item.icon
                  const active = location.pathname === item.path || 
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 no-underline group ${
                        active
                          ? 'bg-violet-50 text-violet-700 font-semibold'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className={active ? 'text-violet-600' : 'text-gray-400 group-hover:text-gray-600'} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all no-underline"
          >
            <Settings size={16} className="text-gray-400" /> Settings
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen bg-gray-50 overflow-x-hidden w-full">
        {/* Mobile Top Header (Visible only on small screens) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">B</span>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Boostr</span>
            </Link>
          </div>
          
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </header>

        <div className="flex-1 w-full max-w-full">
          {children}
        </div>
      </main>

      <NotificationDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false)
          fetchUnreadCount() // Refresh count when drawer closes
        }} 
      />
    </div>
  )
}