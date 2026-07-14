import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Kanban, Plus, MoreHorizontal, MessageSquare, 
  Building2, UserCircle, FileText, CheckCircle2,
  X, LayoutList, ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'

const COLUMNS = [
  { id: 'submitted',    label: 'Pitched',      color: 'bg-blue-500',      border: 'border-blue-200',      bg: 'bg-blue-50/50' },
  { id: 'under_review', label: 'In Talks',     color: 'bg-amber-500',     border: 'border-amber-200',     bg: 'bg-amber-50/50' },
  { id: 'accepted',     label: 'Term Sheet',   color: 'bg-emerald-500',   border: 'border-emerald-200',   bg: 'bg-emerald-50/50' },
  { id: 'funded',       label: 'Funded ✅',    color: 'bg-violet-500',    border: 'border-violet-200',    bg: 'bg-violet-50/50' },
  { id: 'rejected',     label: 'Passed',       color: 'bg-red-500',       border: 'border-red-200',       bg: 'bg-red-50/50' },
]

// Custom Draggable Card Component
function DraggableCard({ app, openModal }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app._id,
    data: app
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-xl border transition-colors relative group ${isDragging ? 'cursor-grabbing border-gray-300 shadow-lg' : 'cursor-grab border-gray-200 hover:border-violet-300 shadow-sm'}`}
      {...listeners}
      {...attributes}
      onDoubleClick={() => openModal(app)}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${app.isExternal ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
          {app.isExternal ? 'External Lead' : app.targetType}
        </span>
        <button 
          onPointerDown={(e) => {
            e.stopPropagation(); 
            openModal(app);
          }} 
          className="text-gray-400 hover:text-gray-900 transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
        {app.isExternal ? (
          <><UserCircle size={14} className="text-gray-400" /> {app.externalName}</>
        ) : app.targetType === 'investor' && app.investor ? (
          <><UserCircle size={14} className="text-gray-400" /> {app.investor.firmName || app.investor.user?.name || 'Investor'}</>
        ) : app.targetType === 'incubator' && app.incubator ? (
          <><Building2 size={14} className="text-gray-400" /> {app.incubator.organizationName || 'Incubator'}</>
        ) : app.targetType === 'grant' && app.grant ? (
          <><FileText size={14} className="text-gray-400" /> {app.grant.title || 'Grant'}</>
        ) : 'Unknown Target'}
      </h4>

      {app.isExternal && app.externalOrg && (
        <p className="text-xs text-gray-500 mb-2 font-medium">{app.externalOrg}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
        <span className="font-medium">{new Date(app.createdAt).toLocaleDateString()}</span>
        {app.notes && <MessageSquare size={14} className="text-violet-500" />}
      </div>
    </div>
  )
}

// Droppable Column Component
function DroppableColumn({ col, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id
  })

  return (
    <div 
      ref={setNodeRef}
      className={`w-80 shrink-0 rounded-2xl flex flex-col max-h-[calc(100vh-160px)] transition-all border ${isOver ? `border-dashed ${col.border} bg-gray-50` : 'border-gray-200 bg-white shadow-sm'}`}
    >
      {/* Column Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
          <span className="text-sm font-bold text-gray-900">{col.label}</span>
        </div>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {children.length}
        </span>
      </div>

      {/* Column Body */}
      <div className={`p-4 overflow-y-auto flex-1 flex flex-col gap-3 ${col.bg}`}>
        {children}
      </div>
    </div>
  )
}


export default function FundingCRM() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)
  
  const [selectedApp, setSelectedApp] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'list' : 'kanban')

  const [showAddLeadModal, setShowAddLeadModal] = useState(false)
  const [newLead, setNewLead] = useState({ targetType: 'investor', externalName: '', externalOrg: '', notes: '' })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/applications/me')
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- DND KIT LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts, allows click/double-click to work
      },
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    setActiveId(null)
    const { active, over } = event
    
    if (!over) return
    if (active.data.current.status === over.id) return // Same column

    const columnId = over.id
    const appId = active.id

    // Optimistic update
    const previousState = [...applications]
    setApplications(prev => prev.map(a => 
      a._id === appId ? { ...a, status: columnId } : a
    ))

    try {
      await api.put(`/applications/${appId}`, { status: columnId })
    } catch (err) {
      console.error('Failed to update status', err)
      setApplications(previousState)
      toast.error('Failed to move application.')
    }
  }

  // --- DETAILS MODAL ---
  const openModal = (app) => {
    setSelectedApp(app)
    setNotes(app.notes || '')
  }
  
  const saveNotes = async () => {
    setSaving(true)
    try {
      await api.put(`/applications/${selectedApp._id}`, { notes })
      setApplications(prev => prev.map(a => 
        a._id === selectedApp._id ? { ...a, notes } : a
      ))
      setSelectedApp(null)
    } catch (err) {
      toast.error('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  // --- ADD EXTERNAL LEAD ---
  const handleAddLead = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        isExternal: true,
        targetType: newLead.targetType,
        externalName: newLead.externalName,
        externalOrg: newLead.externalOrg,
        notes: newLead.notes,
        status: 'submitted' // 'Pitched' column
      }
      const res = await api.post('/applications', payload)
      if (res.data.success) {
        setApplications([...applications, res.data.application])
        setShowAddLeadModal(false)
        setNewLead({ targetType: 'investor', externalName: '', externalOrg: '', notes: '' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add external lead')
    } finally {
      setSaving(false)
    }
  }

  const getActiveApp = () => applications.find(a => a._id === activeId)

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-all"

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        
        {/* HEADER */}
        <div className="px-4 md:px-8 py-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-1">
              <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                <Kanban size={24} />
              </div>
              Funding Pipeline
            </h1>
            <p className="text-sm text-gray-500 font-medium">Track your pitch applications and investor relations</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="md:hidden flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('kanban')} className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}><Kanban size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}><LayoutList size={16} /></button>
            </div>
            <button 
              onClick={() => setShowAddLeadModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex flex-1 justify-center md:flex-none items-center gap-2 transition-colors shadow-sm shadow-violet-200"
            >
              <Plus size={16} /> Add External Lead
            </button>
          </div>
        </div>

        {/* BOARD OR LIST */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-gray-50 p-4 md:p-8">
          {viewMode === 'kanban' ? (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
              <div className="flex gap-6 h-full items-start w-max pb-4">
                {COLUMNS.map(col => {
                  const colApps = applications.filter(a => (a.status === col.id) || (col.id === 'submitted' && a.status === 'draft'))
                  return (
                    <DroppableColumn key={col.id} col={col}>
                      {colApps.map(app => <DraggableCard key={app._id} app={app} openModal={openModal} />)}
                    </DroppableColumn>
                  )
                })}
              </div>
              <DragOverlay>
                {activeId ? <DraggableCard app={getActiveApp()} openModal={openModal} /> : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="space-y-8 max-w-3xl mx-auto">
              {COLUMNS.map(col => {
                const colApps = applications.filter(a => (a.status === col.id) || (col.id === 'submitted' && a.status === 'draft'))
                if (colApps.length === 0) return null
                return (
                  <div key={col.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className={`px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <span className="text-sm font-bold text-gray-900">{col.label}</span>
                      </div>
                      <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{colApps.length}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {colApps.map(app => (
                        <div key={app._id} onClick={() => openModal(app)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">
                              {app.isExternal ? app.externalName : app.targetType === 'investor' && app.investor ? (app.investor.firmName || 'Investor') : app.targetType === 'incubator' && app.incubator ? (app.incubator.organizationName || 'Incubator') : app.grant?.title || 'Unknown'}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium">
                              {app.isExternal && app.externalOrg ? app.externalOrg : app.targetType}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* DETAILS MODAL */}
        {selectedApp && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Application Details</h2>
                <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-900 p-1 rounded-md transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Private Notes</label>
                  <textarea 
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Add meeting notes, feedback, or next steps here..."
                    className={`${inputClass} min-h-[160px]`}
                  />
                </div>
                <button 
                  onClick={saveNotes} disabled={saving} 
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD EXTERNAL LEAD MODAL */}
        {showAddLeadModal && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Add External Lead</h2>
                <button onClick={() => setShowAddLeadModal(false)} className="text-gray-400 hover:text-gray-900 p-1 rounded-md transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddLead} className="p-4 md:p-6 space-y-5">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lead Type</label>
                  <select 
                    value={newLead.targetType} onChange={e => setNewLead({ ...newLead, targetType: e.target.value })}
                    className={inputClass}
                  >
                    <option value="investor">Investor</option>
                    <option value="grant">Grant</option>
                    <option value="incubator">Incubator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Name (Person or Event) *</label>
                  <input 
                    type="text" required value={newLead.externalName} onChange={e => setNewLead({ ...newLead, externalName: e.target.value })}
                    placeholder="e.g. John Doe / YC Startup School"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Organization / Firm</label>
                  <input 
                    type="text" value={newLead.externalOrg} onChange={e => setNewLead({ ...newLead, externalOrg: e.target.value })}
                    placeholder="e.g. Sequoia Capital"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Notes</label>
                  <textarea 
                    value={newLead.notes} onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                    placeholder="Met at a coffee shop..." rows={3}
                    className={`${inputClass} min-h-[100px]`}
                  />
                </div>

                <button 
                  type="submit" disabled={saving} 
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-2"
                >
                  {saving ? 'Adding...' : 'Add Lead to Pipeline'}
                </button>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </DashboardLayout>
  )
}
