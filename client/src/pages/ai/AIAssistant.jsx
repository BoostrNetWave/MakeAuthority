import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Send, Loader2, Copy, Check,
  ChevronRight, AlertCircle, Zap,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AI_FUNCTIONS_BY_ROLE } from '@/config/aiFunctions'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function UsageBar({ usage }) {
  if (!usage) return null
  const pct = ((usage.usedThisHour / usage.limitPerHour) * 100).toFixed(0)
  const colorClass = pct >= 80 ? 'bg-red-500 text-red-500' : pct >= 50 ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'
  
  return (
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
      <Zap size={16} className={`shrink-0 ${colorClass.split(' ')[1]}`} />
      <div className="flex-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="text-xs font-bold text-gray-500 w-24 text-right">
        {usage.usedThisHour} / {usage.limitPerHour} used
      </div>
    </div>
  )
}

export default function AIAssistant() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const AI_FUNCTIONS = AI_FUNCTIONS_BY_ROLE[user?.role] || AI_FUNCTIONS_BY_ROLE['founder']
  
  const [selectedFn, setSelectedFn] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)
  const [error,      setError]      = useState(null)
  const [usage,      setUsage]      = useState(null)

  const resultEndRef = useRef(null)

  // Load initial usage
  useEffect(() => {
    api.get('/ai/grant-recommendations').catch(err => {
      if (err.response?.status === 429) {
        setUsage({ usedThisHour: 50, limitPerHour: 50 })
      }
    })
  }, [])

  useEffect(() => {
    if (result || error) {
      resultEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [result, error, loading])

  const handleRun = async () => {
    if (!selectedFn) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const body = { ...selectedFn.body }
      if (selectedFn.hasInput && inputValue) {
        body[selectedFn.inputKey] = inputValue
      }
      
      const { data } = await api.post(selectedFn.endpoint, body)
      if (data.success) {
        setResult(data.content || data.data)
        if (data.usage) setUsage(data.usage)
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.')
        if (err.response.data?.usage) setUsage(err.response.data.usage)
      } else if (err.response?.status === 403) {
        setError('Please complete your profile to use this AI feature.')
      } else {
        setError(err.response?.data?.message || 'Failed to connect to AI service.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shadow-sm">
            <Sparkles size={24} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">AI Assistant</h1>
            <p className="text-sm font-medium text-gray-500">
              Enterprise-grade AI models fine-tuned for Indian startup workflows
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* ── LEFT — Function sidebar ──────────────── */}
          <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm overflow-hidden sticky top-8">
            <UsageBar usage={usage} />
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {AI_FUNCTIONS.map((group, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-2">
                    <group.icon size={12} /> {group.group}
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.items.map(fn => (
                      <button
                        key={fn.id}
                        onClick={() => { setSelectedFn(fn); setResult(null); setError(null); setInputValue('') }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all border ${selectedFn?.id === fn.id ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-transparent border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900'}`}
                      >
                        <div className={`text-[13px] ${selectedFn?.id === fn.id ? 'font-bold' : 'font-semibold'}`}>
                          {fn.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Chat / Results ──────────────── */}
          <div className="min-w-0">
            <div className="bg-white border border-gray-200 rounded-[24px] shadow-sm min-h-[500px] flex flex-col">
              
              {!selectedFn ? (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-violet-100 to-indigo-50 border border-violet-200 flex items-center justify-center mb-6 shadow-sm">
                    <Sparkles size={32} className="text-violet-600" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">How can I help you build?</h2>
                  <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
                    Select a tool from the left to generate pitch decks, find investors, write proposals, or discover grants.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    {AI_FUNCTIONS.slice(0,4).map((group, i) => {
                      const Icon = group.icon
                      return (
                        <div key={i} onClick={() => setSelectedFn(group.items[0])} 
                          className="p-4 rounded-[20px] bg-gray-50 border border-gray-100 cursor-pointer transition-all hover:bg-white hover:border-violet-200 hover:shadow-md group/card"
                        >
                          <Icon size={20} className={`${group.color} mb-3 transition-transform group-hover/card:scale-110`} />
                          <div className="text-sm font-bold text-gray-900 mb-1">{group.group}</div>
                          <div className="text-[11px] font-medium text-gray-500">{group.items.length} functions</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                /* Selected function */
                <div className="flex flex-col h-full">
                  
                  {/* Top area: Function info & Input */}
                  <div className="p-4 md:p-8 border-b border-gray-100">
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
                      {selectedFn.label}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mb-6">
                      {selectedFn.desc}
                    </p>

                    {selectedFn.hasInput && (
                      <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                          {selectedFn.inputLabel} <span className="text-gray-400 font-medium normal-case">(optional)</span>
                        </label>
                        <input
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          placeholder="Add more context for better results..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                        />
                      </div>
                    )}

                    <button 
                      onClick={handleRun} 
                      disabled={loading} 
                      className="px-6 py-3 rounded-xl border border-transparent bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold transition-all shadow-sm shadow-violet-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:scale-110 transition-transform" />}
                      {loading ? 'Processing...' : 'Run Generation'}
                    </button>
                  </div>

                  {/* Results area */}
                  <div className="p-4 md:p-8 flex-1 bg-gray-50 rounded-b-[24px]">
                    
                    {loading && (
                      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                          <Loader2 size={24} className="text-violet-600 animate-spin" />
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-1">Generating Response</div>
                        <div className="text-xs font-medium text-gray-500">{selectedFn.prompt}</div>
                      </div>
                    )}

                    {error && !loading && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-in fade-in slide-in-from-top-4">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div className="text-sm font-bold leading-relaxed">{error}</div>
                      </div>
                    )}

                    {result && !loading && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white border border-gray-200 rounded-[20px] p-4 md:p-6 shadow-sm relative group/result">
                          <div className="absolute top-4 right-4 opacity-0 group-hover/result:opacity-100 transition-opacity">
                            <CopyButton text={typeof result === 'string' ? result : JSON.stringify(result, null, 2)} />
                          </div>
                          
                          <div className="prose prose-sm prose-violet max-w-none text-gray-700 whitespace-normal markdown-body">
                            {typeof result === 'string' ? (
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {result}
                              </ReactMarkdown>
                            ) : (
                              <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={resultEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
