import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderLock, Upload, FileText, Trash2,
  Share2, Check, Link2, Clock, Eye,
  ChevronRight, Plus, Search, AlertCircle,
  File, Download, RefreshCw, X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

// ── PRD Module 13 — exact folder categories ────────────────────────────────────
const FOLDERS = [
  { id: 'all',                    label: 'All Documents',        icon: '📁', color: 'text-violet-500', bg: 'bg-violet-50' },
  { id: 'pitch_decks',            label: 'Pitch Decks',          icon: '🚀', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'business_plans',         label: 'Business Plans',       icon: '📋', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'financial_statements',   label: 'Financial Statements', icon: '📊', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'legal_documents',        label: 'Legal Documents',      icon: '⚖️', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'cap_tables',             label: 'Cap Tables',           icon: '📈', color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'company_certificates',   label: 'Certificates',         icon: '🏆', color: 'text-cyan-500', bg: 'bg-cyan-50' },
  { id: 'other',                  label: 'Other',                icon: '📄', color: 'text-gray-500', bg: 'bg-gray-50' },
]

const FILE_ICONS = {
  pdf:   '📕',
  doc:   '📝',
  docx:  '📝',
  xls:   '📊',
  xlsx:  '📊',
  ppt:   '📑',
  pptx:  '📑',
  image: '🖼️',
  other: '📄',
}

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024)       return `${bytes} B`
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  })
}

function UploadModal({ onClose, onSuccess }) {
  const [name,       setName]       = useState('')
  const [folder,     setFolder]     = useState('pitch_decks')
  const [fileUrl,    setFileUrl]    = useState('')
  const [fileType,   setFileType]   = useState('pdf')
  const [uploading,  setUploading]  = useState(false)
  const [error,      setError]      = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.success) {
        setFileUrl(data.url)
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ''))
        // detect file type
        const ext = file.name.split('.').pop().toLowerCase()
        setFileType(['pdf','doc','docx','xls','xlsx','ppt','pptx'].includes(ext) ? ext : 'other')
      }
    } catch {
      setError('File upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!name || !folder || !fileUrl) {
      setError('Please fill all required fields and upload a file.')
      return
    }
    try {
      await api.post('/documents', { name, folder, fileUrl, fileType })
      onSuccess()
      onClose()
    } catch {
      setError('Failed to save document. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Document</h2>
            <p className="text-sm text-gray-500 font-medium m-0">Add a new document to your vault</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-sm font-bold text-red-600 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* File upload area */}
        <label className="block mb-6 cursor-pointer">
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all
            ${fileUrl ? 'border-emerald-500/50 bg-emerald-50/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
          >
            {uploading ? (
              <div className="text-sm font-bold text-violet-600 animate-pulse">Uploading to Cloudinary...</div>
            ) : fileUrl ? (
              <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-2">
                <Check size={18} /> File uploaded successfully
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload size={32} className="text-gray-400 mb-3" />
                <div className="text-sm font-bold text-gray-700 mb-1">Click to upload PDF, DOC, XLS, PPT</div>
                <div className="text-xs text-gray-500 font-medium">Max 10MB</div>
              </div>
            )}
          </div>
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Document name */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PayFlow India - Series A Pitch Deck"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder-gray-400"
          />
        </div>

        {/* Folder */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Folder *</label>
          <select value={folder} onChange={e => setFolder(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
          >
            {FOLDERS.filter(f => f.id !== 'all').map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold transition-colors shadow-sm">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!fileUrl || !name} className="flex-[2] py-3 rounded-xl border border-transparent bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Save to Vault
          </button>
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ doc, onDelete, onShare }) {
  const folderInfo = FOLDERS.find(f => f.id === doc.folder) || FOLDERS[FOLDERS.length - 1]
  const fileIcon   = FILE_ICONS[doc.fileType] || FILE_ICONS.other

  return (
    <div className="bg-white border border-gray-200 rounded-[20px] p-5 transition-all hover:border-violet-300 hover:shadow-md hover:-translate-y-1 group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{fileIcon}</div>
        <div className="flex gap-2">
          {/* Share */}
          <button onClick={() => onShare(doc)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${doc.isShared ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`} title={doc.isShared ? 'Shared — click to revoke' : 'Share'}>
            <Share2 size={14} />
          </button>
          {/* View */}
          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center transition-colors" title="View">
            <Eye size={14} />
          </a>
          {/* Delete */}
          <button onClick={() => onDelete(doc._id)} className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Name */}
      <div className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
        {doc.name}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${folderInfo.bg} ${folderInfo.color}`}>
          {folderInfo.icon} {folderInfo.label}
        </span>
        <span className="text-xs font-medium text-gray-400">
          {formatSize(doc.fileSize)}
        </span>
      </div>

      {/* Version + date */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
          <Clock size={12} /> {formatDate(doc.updatedAt)}
        </div>
        <div className="text-xs font-bold text-gray-400">
          v{doc.currentVersion}
          {doc.versions?.length > 1 && (
            <span className="ml-1 text-violet-500">({doc.versions.length} versions)</span>
          )}
        </div>
      </div>

      {/* Shared link indicator */}
      {doc.isShared && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-500">
          <Link2 size={12} /> Shared link active
        </div>
      )}
    </div>
  )
}

export default function DocumentVault() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const [documents,     setDocuments]     = useState([])
  const [stats,         setStats]         = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [activeFolder,  setActiveFolder]  = useState('all')
  const [search,        setSearch]        = useState('')
  const [showUpload,    setShowUpload]    = useState(false)
  const [shareSuccess,  setShareSuccess]  = useState(null) // {id, link}

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeFolder !== 'all') params.append('folder', activeFolder)
      if (search)                  params.append('search', search)

      const [docsRes, statsRes] = await Promise.allSettled([
        api.get(`/documents?${params}`),
        api.get('/documents/stats'),
      ])

      if (docsRes.status === 'fulfilled' && docsRes.value.data.success)
        setDocuments(docsRes.value.data.documents)
      if (statsRes.status === 'fulfilled' && statsRes.value.data.success)
        setStats(statsRes.value.data.stats)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeFolder, search])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return
    try {
      await api.delete(`/documents/${id}`)
      setDocuments(prev => prev.filter(d => d._id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const handleShare = async (doc) => {
    try {
      const { data } = await api.post(`/documents/${doc._id}/share`, {
        isShared:   !doc.isShared,
        expiryDays: 30,
      })
      if (data.success) {
        setDocuments(prev => prev.map(d =>
          d._id === doc._id ? { ...d, isShared: data.isShared } : d
        ))
        if (data.isShared && data.shareLink) {
          setShareSuccess({ id: doc._id, link: data.shareLink })
          await navigator.clipboard.writeText(data.shareLink)
          setTimeout(() => setShareSuccess(null), 4000)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const folderCounts = stats?.byFolder || {}
  const totalSize    = stats ? formatSize(stats.totalSize) : '0 KB'

  return (
    <DashboardLayout>
      {/* Share success toast */}
      {shareSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white rounded-xl px-5 py-3 shadow-lg shadow-emerald-500/20 flex items-center gap-3 font-bold text-sm animate-in slide-in-from-bottom-5">
          <Check size={18} /> Share link copied to clipboard!
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onSuccess={load} />
      )}

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shadow-sm">
              <FolderLock size={24} className="text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Document Vault</h1>
              <p className="text-sm font-medium text-gray-500">
                {stats?.totalDocuments || 0} documents · {totalSize} used
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={load} className="w-11 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 flex items-center justify-center transition-colors shadow-sm">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => setShowUpload(true)} className="px-5 py-2.5 rounded-xl border border-transparent bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200 flex items-center gap-2">
              <Plus size={18} /> Upload Document
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          
          {/* ── LEFT — Folder sidebar ──────────────────── */}
          <div className="bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm self-start sticky top-8">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
              Folders
            </div>
            <div className="flex flex-col gap-1.5 mb-8">
              {FOLDERS.map(folder => {
                const count  = folder.id === 'all' ? (stats?.totalDocuments || 0) : (folderCounts[folder.id] || 0)
                const active = activeFolder === folder.id
                return (
                  <button key={folder.id} onClick={() => setActiveFolder(folder.id)} 
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors border ${active ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{folder.icon}</span>
                      <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>
                        {folder.label}
                      </span>
                    </div>
                    {count > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${active ? 'bg-violet-200/50 text-violet-700' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Vault stats */}
            {stats && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Vault Stats</div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Total',   value: `${stats.totalDocuments} files` },
                    { label: 'Shared',  value: `${stats.sharedCount} files` },
                    { label: 'Storage', value: totalSize },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-500">{label}</span>
                      <span className="text-xs font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Document grid ──────────────────── */}
          <div className="min-w-0">

            {/* Search */}
            <div className="relative max-w-md mb-8">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documents..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-48 rounded-[20px] bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && documents.length === 0 && (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
                <div className="text-6xl mb-6">🔒</div>
                <div className="text-xl font-bold text-gray-900 mb-2">
                  {search ? 'No documents found' : 'Your vault is empty'}
                </div>
                <div className="text-sm font-medium text-gray-500 mb-8 max-w-xs mx-auto">
                  {search ? 'Try a different search term or clear the search' : 'Upload your first document to securely store and share it.'}
                </div>
                {!search && (
                  <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-transparent bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors shadow-sm shadow-violet-200">
                    <Upload size={18} /> Upload First Document
                  </button>
                )}
              </div>
            )}

            {/* Documents grid */}
            {!loading && documents.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map(doc => (
                  <DocumentCard
                    key={doc._id}
                    doc={doc}
                    onDelete={handleDelete}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
