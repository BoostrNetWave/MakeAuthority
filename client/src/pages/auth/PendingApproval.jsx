import { useSearchParams, useNavigate } from 'react-router-dom'
import { Clock, Mail, CheckCircle, ArrowLeft } from 'lucide-react'

const ROLE_MESSAGES = {
  investor: {
    title:    'Investor Account Under Review',
    subtitle: 'Your investor profile is being verified by our team.',
    timeline: '24-48 hours',
    reason:   'We verify investor credentials to maintain the quality and safety of our ecosystem for all founders.',
    steps: [
      'Our admin team reviews your profile details',
      'Your investment credentials are verified',
      'You receive an email confirmation',
      'Full platform access is granted',
    ],
  },
  incubator: {
    title:    'Incubator Account Under Review',
    subtitle: 'Your incubator profile is being reviewed by our team.',
    timeline: '24-48 hours',
    reason:   'We verify incubator credentials to ensure founders connect with legitimate programs.',
    steps: [
      'Our admin team reviews your organization details',
      'Program credentials are verified',
      'You receive an email confirmation',
      'Full platform access is granted',
    ],
  },
  service_provider: {
    title:    'Service Provider Account Under Review',
    subtitle: 'Your service provider profile is being reviewed.',
    timeline: '12-24 hours',
    reason:   'We verify service providers to protect founders from fraudulent services.',
    steps: [
      'Our admin team reviews your service details',
      'Your credentials are verified',
      'You receive an email confirmation',
      'Your services go live on the marketplace',
    ],
  },
}

export default function PendingApproval() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const role       = params.get('role') || 'investor'
  const email      = params.get('email') || ''
  const content    = ROLE_MESSAGES[role] || ROLE_MESSAGES.investor

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px',
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 28px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
          border: '1px solid rgba(245,158,11,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Clock size={32} style={{ color: '#FBBF24' }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            {content.title}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
            {content.subtitle}
          </p>
        </div>

        {/* Email confirmation */}
        {email && (
          <div style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 24,
          }}>
            <Mail size={18} style={{ color: '#60A5FA', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                Confirmation will be sent to
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{email}</div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          background: '#110E1B',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            What happens next
          </div>

          {content.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < content.steps.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#A78BFA',
                }}>{i + 1}</div>
                {i < content.steps.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', marginTop: 4 }} />
                )}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: i < content.steps.length - 1 ? 16 : 0 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{step}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline estimate */}
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 12, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 24,
        }}>
          <CheckCircle size={16} style={{ color: '#34D399', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            Typical review time: <strong style={{ color: '#34D399' }}>{content.timeline}</strong>
          </span>
        </div>

        {/* Why we verify */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6, marginBottom: 28 }}>
          {content.reason}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <ArrowLeft size={14} /> Back to Home
          </button>
          <button onClick={() => navigate('/login')} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: 'none', background: '#7C3AED',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}
