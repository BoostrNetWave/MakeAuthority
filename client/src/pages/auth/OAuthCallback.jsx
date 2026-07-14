import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

const ROLE_REDIRECTS = {
  super_admin:      '/dashboard/admin',
  founder:          '/dashboard/founder',
  investor:         '/dashboard/investor',
  incubator:        '/dashboard/incubator',
  service_provider: '/dashboard/service_provider',
  job_seeker:       '/dashboard/jobseeker',
}

export default function OAuthCallback() {
  const [searchParams]   = useSearchParams()
  const navigate          = useNavigate()
  const { setUser }       = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const exchange = async () => {
      const code     = searchParams.get('code')
      const provider = searchParams.get('provider')
      const oauthErr = searchParams.get('error')

      // Handle OAuth failure redirect
      if (oauthErr) {
        setError(`${provider || 'OAuth'} login failed. Please try again.`)
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (!code) {
        setError('No authorization code received.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      try {
        // Exchange one-time code for real JWT
        const { data } = await api.post('/auth/oauth/exchange', { code })

        if (data.success) {
          // Store token — same as regular login
          localStorage.setItem('accessToken', data.accessToken)

          // Update auth context
          setUser(data.user)

          // Redirect to correct dashboard by role
          const destination = ROLE_REDIRECTS[data.user.role] || '/dashboard/founder'

          // New OAuth user with default 'founder' role — show role selection?
          if (!data.user.googleId && !data.user.linkedinId) {
            navigate(destination)
          } else {
            navigate(destination)
          }
        } else {
          setError(data.message || 'Authentication failed.')
          setTimeout(() => navigate('/login'), 3000)
        }
      } catch (err) {
        console.error('OAuth exchange error:', err)
        setError('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    exchange()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#050508',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        {error ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>❌</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#F87171', marginBottom: 8 }}>
              {error}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Redirecting to login...
            </div>
          </>
        ) : (
          <>
            {/* Animated spinner */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '3px solid rgba(124,58,237,0.2)',
              borderTop: '3px solid #7C3AED',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
              Completing sign in...
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Setting up your account
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
