import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Lock, Bell, CreditCard, Shield,
  Save, Eye, EyeOff, Check, AlertCircle,
  Camera, Trash2, LogOut, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'security',      label: 'Security',        icon: Lock },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'membership',    label: 'Membership',      icon: CreditCard },
  { id: 'danger',        label: 'Danger Zone',     icon: Shield },
]

function Toast({ message, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px', borderRadius: 12,
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: '#fff', fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.2s ease',
    }}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-main)', marginBottom: 6 }}>
        {label}
      </label>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, disabled }) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      style={{
        width: '100%', padding: '10px 14px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border-light)',
        borderRadius: 9, color: 'var(--text-main)',
        fontSize: 13, outline: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
    />
  )
}

function SectionCard({ title, desc, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      borderRadius: 16, padding: 28, marginBottom: 20,
    }}>
      {title && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px' }}>{title}</h3>
          {desc && <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>{desc}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

// ── TAB: PROFILE ──────────────────────────────────────────────────────────────
function ProfileTab({ user, fetchCurrentUser }) {
  const [name,    setName]    = useState(user?.name || '')
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.patch('/auth/me', { name })
      await fetchCurrentUser()
      showToast('Profile updated successfully')
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <SectionCard title="Personal Information" desc="Update your name and account details">
        <Field label="Full Name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
        </Field>
        <Field label="Email Address" hint="Email cannot be changed for security reasons">
          <Input value={user?.email || ''} disabled />
        </Field>
        <Field label="Account Role" hint="Your role determines what features you can access">
          <div style={{ padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: 9, fontSize: 13, color: 'var(--text-main)', textTransform: 'capitalize' }}>
            {user?.role?.replace('_', ' ') || 'Founder'}
          </div>
        </Field>
        <button onClick={handleSave} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 22px', borderRadius: 9, border: 'none',
          background: '#7C3AED', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
          opacity: saving ? 0.7 : 1,
        }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </SectionCard>

      <SectionCard title="Account Info" desc="Read-only account metadata">
        {[
          { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          { label: 'Last Login',   value: user?.lastLogin  ? new Date(user.lastLogin).toLocaleDateString('en-US',  { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
          { label: 'Account ID',   value: user?._id || '—' },
          { label: 'Email Verified', value: user?.isEmailVerified ? '✅ Verified' : '⚠️ Not verified' },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)', fontFamily: label === 'Account ID' ? 'monospace' : 'inherit', fontSize: label === 'Account ID' ? 11 : 13 }}>{value}</span>
          </div>
        ))}
      </SectionCard>
    </>
  )
}

// ── TAB: SECURITY ─────────────────────────────────────────────────────────────
function SecurityTab() {
  const [current,  setCurrent]  = useState('')
  const [newPass,  setNewPass]  = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = async () => {
    if (!current || !newPass || !confirm) {
      showToast('All fields are required', 'error'); return
    }
    if (newPass !== confirm) {
      showToast('New passwords do not match', 'error'); return
    }
    if (newPass.length < 8) {
      showToast('Password must be at least 8 characters', 'error'); return
    }
    setSaving(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: current, newPassword: newPass })
      showToast('Password changed successfully')
      setCurrent(''); setNewPass(''); setConfirm('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  const strength = !newPass ? 0 : newPass.length < 6 ? 1 : newPass.length < 10 ? 2 : /[A-Z]/.test(newPass) && /[0-9]/.test(newPass) ? 4 : 3
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#EF4444', '#F59E0B', '#10B981', '#059669']

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <SectionCard title="Change Password" desc="Use a strong password with letters, numbers and symbols">
        <Field label="Current Password">
          <div style={{ position: 'relative' }}>
            <Input type={showPass ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} placeholder="Enter current password" />
            <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="New Password">
          <Input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Enter new password" />
          {newPass && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= strength ? strengthColors[strength] : 'var(--border-light)', transition: 'background 0.2s' }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: strengthColors[strength], fontWeight: 600 }}>{strengthLabels[strength]}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password">
          <Input type={showPass ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" />
          {confirm && newPass !== confirm && (
            <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', gap: 4 }}>
              <AlertCircle size={11} /> Passwords do not match
            </div>
          )}
        </Field>

        <button onClick={handleChange} disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '10px 22px', borderRadius: 9, border: 'none',
          background: '#7C3AED', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
        }}>
          <Lock size={14} /> {saving ? 'Changing...' : 'Change Password'}
        </button>
      </SectionCard>

      <SectionCard title="Active Sessions" desc="Manage where you are logged in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)', marginBottom: 3 }}>Current Session</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>This device · Active now</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>Active</span>
        </div>
      </SectionCard>
    </>
  )
}

// ── TAB: NOTIFICATIONS ────────────────────────────────────────────────────────
function NotificationsTab({ user, fetchCurrentUser }) {
  const [prefs, setPrefs] = useState({
    emailGrantDeadlines:   user?.notificationPreferences?.emailGrantDeadlines ?? true,
    emailApplicationStatus: user?.notificationPreferences?.emailApplicationStatus ?? true,
    emailNewMatches:        user?.notificationPreferences?.emailNewMatches ?? false,
    emailWeeklyDigest:      user?.notificationPreferences?.emailWeeklyDigest ?? true,
    inAppAll:               user?.notificationPreferences?.inAppAll ?? true,
  })
  const [saving, setSaving]  = useState(false)
  const [toast,  setToast]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (key) => setPrefs(prev => ({ ...prev, [key]: !prev[key] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/auth/notification-preferences', prefs)
      await fetchCurrentUser()
      showToast('Notification preferences saved')
    } catch {
      showToast('Failed to save preferences', 'error')
    } finally {
      setSaving(false)
    }
  }

  const Toggle = ({ value, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, border: 'none',
      background: value ? '#7C3AED' : 'var(--border-strong)',
      position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )

  const notifItems = [
    { key: 'emailGrantDeadlines',    label: 'Grant Deadline Alerts',    desc: 'Email 7 days before a bookmarked grant closes', type: 'Email' },
    { key: 'emailApplicationStatus', label: 'Application Status Updates', desc: 'Email when your application status changes',     type: 'Email' },
    { key: 'emailNewMatches',        label: 'New Investor Matches',      desc: 'Weekly email of new investor matches',            type: 'Email' },
    { key: 'emailWeeklyDigest',      label: 'Weekly Digest',            desc: 'Summary of platform activity every Monday',       type: 'Email' },
    { key: 'inAppAll',               label: 'In-App Notifications',      desc: 'Show bell notifications inside the platform',     type: 'In-App' },
  ]

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} />}
      <SectionCard title="Notification Preferences" desc="Choose which alerts you want to receive">
        {notifItems.map(({ key, label, desc, type }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>{label}</span>
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: type === 'Email' ? 'rgba(59,130,246,0.12)' : 'rgba(124,58,237,0.12)', color: type === 'Email' ? '#60A5FA' : '#A78BFA', fontWeight: 600 }}>
                  {type}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{desc}</div>
            </div>
            <Toggle value={prefs[key]} onToggle={() => toggle(key)} />
          </div>
        ))}
        <div style={{ marginTop: 20 }}>
          <button onClick={handleSave} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 9, border: 'none',
            background: '#7C3AED', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </SectionCard>
    </>
  )
}

// ── TAB: MEMBERSHIP ───────────────────────────────────────────────────────────
function MembershipTab({ user, navigate }) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      color: '#6B7280',
      features: ['Startup Directory access', 'Basic grant search', '3 AI queries/day', 'Community access'],
      current: user?.membershipPlan === 'free' || !user?.membershipPlan,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      color: '#7C3AED',
      features: ['Everything in Free', 'Unlimited AI queries', 'Document Vault (10GB)', 'Priority matchmaking', 'Grant deadline alerts', 'Direct investor messaging'],
      current: user?.membershipPlan === 'pro',
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      color: '#059669',
      features: ['Everything in Pro', 'Team access (5 seats)', 'Custom integrations', 'Dedicated support', 'White-label options', 'API access'],
      current: user?.membershipPlan === 'enterprise',
    },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {plans.map(plan => (
          <div key={plan.name} style={{
            background: 'var(--bg-card)',
            border: `1px solid ${plan.current ? plan.color : 'var(--border-light)'}`,
            borderRadius: 16, padding: 22, position: 'relative',
            boxShadow: plan.current ? `0 0 0 1px ${plan.color}33` : 'none',
          }}>
            {plan.recommended && (
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#7C3AED', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
                RECOMMENDED
              </div>
            )}
            {plan.current && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: `${plan.color}18`, color: plan.color, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>
                CURRENT
              </div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{plan.name}</div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>{plan.price}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 4 }}>/{plan.period}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-dim)', alignItems: 'flex-start' }}>
                  <Check size={12} style={{ color: plan.color, flexShrink: 0, marginTop: 2 }} /> {f}
                </div>
              ))}
            </div>
            {!plan.current && (
              <button onClick={() => navigate('/pricing')} style={{
                width: '100%', padding: '9px', borderRadius: 9, border: 'none',
                background: plan.color, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Upgrade to {plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
      <SectionCard title="Billing Information" desc="Manage your subscription and payment methods">
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-dim)', fontSize: 13 }}>
          <CreditCard size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ marginBottom: 8 }}>Razorpay payment integration coming soon</div>
          <div style={{ fontSize: 12 }}>You will be able to upgrade your plan and manage billing here</div>
        </div>
      </SectionCard>
    </div>
  )
}

// ── TAB: DANGER ZONE ──────────────────────────────────────────────────────────
function DangerTab({ logout }) {
  const [confirmed, setConfirmed] = useState('')
  const [deleting,  setDeleting]  = useState(false)

  const handleDelete = async () => {
    if (confirmed !== 'DELETE') return
    setDeleting(true)
    try {
      await api.delete('/auth/me')
      logout()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div>
      <SectionCard title="Export My Data" desc="Download all your data before leaving">
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.6 }}>
          Download a complete export of your startup profile, applications, documents, and activity history.
        </p>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 9, border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--text-main)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Export My Data
        </button>
      </SectionCard>

      <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: 28 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F87171', margin: '0 0 6px' }}>Delete Account</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
          Your startup profile, documents, applications, and all data will be permanently removed.
        </p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#F87171', marginBottom: 6 }}>
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            value={confirmed}
            onChange={e => setConfirmed(e.target.value)}
            placeholder="Type DELETE to confirm"
            style={{ width: '100%', maxWidth: 300, padding: '9px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#F87171', fontSize: 13, outline: 'none' }}
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={confirmed !== 'DELETE' || deleting}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 22px', borderRadius: 9, border: 'none',
            background: confirmed === 'DELETE' ? '#EF4444' : 'rgba(239,68,68,0.2)',
            color: confirmed === 'DELETE' ? '#fff' : 'rgba(239,68,68,0.5)',
            fontSize: 13, fontWeight: 600,
            cursor: confirmed === 'DELETE' ? 'pointer' : 'not-allowed',
          }}
        >
          <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </div>
  )
}

// ── MAIN SETTINGS PAGE ────────────────────────────────────────────────────────
export default function Settings() {
  const navigate        = useNavigate()
  const { user, logout, fetchCurrentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const ActiveTab = {
    profile:       <ProfileTab user={user} fetchCurrentUser={fetchCurrentUser} />,
    security:      <SecurityTab />,
    notifications: <NotificationsTab user={user} fetchCurrentUser={fetchCurrentUser} />,
    membership:    <MembershipTab user={user} navigate={navigate} />,
    danger:        <DangerTab logout={logout} />,
  }[activeTab]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 32px', position: 'sticky', top: 0, background: 'var(--bg-main)', backdropFilter: 'blur(20px)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 2px', letterSpacing: '-0.3px' }}>Settings</h1>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>Manage your account, security, and preferences</p>
          </div>
          <button onClick={() => navigate(-1)} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer' }}>
            ← Back
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', maxWidth: 1000, margin: '0 auto', padding: '32px 24px', gap: 28 }}>

        {/* Sidebar tabs */}
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, overflow: 'hidden' }}>
            {TABS.map(tab => {
              const Icon   = tab.icon
              const active = activeTab === tab.id
              const isDanger = tab.id === 'danger'
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', border: 'none', textAlign: 'left',
                  background: active ? (isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(124,58,237,0.1)') : 'transparent',
                  borderLeft: active ? `3px solid ${isDanger ? '#EF4444' : '#7C3AED'}` : '3px solid transparent',
                  color: active ? (isDanger ? '#F87171' : '#A78BFA') : isDanger ? 'rgba(239,68,68,0.6)' : 'var(--text-dim)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  borderBottom: tab.id !== 'danger' ? '1px solid var(--border-light)' : 'none',
                }}>
                  <Icon size={15} /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: 16, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, overflow: 'hidden' }}>
            <button onClick={() => navigate('/dashboard/' + (user?.role === 'super_admin' ? 'admin' : user?.role))} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
              <ChevronRight size={14} /> Go to Dashboard
            </button>
            <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: 'none', background: 'transparent', color: 'rgba(239,68,68,0.7)', fontSize: 13, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div>{ActiveTab}</div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        input::placeholder { color: var(--text-muted) !important; }
        input:focus { border-color: rgba(124,58,237,0.4) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
      `}</style>
    </div>
  )
}
