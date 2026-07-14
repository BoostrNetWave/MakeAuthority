import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Rocket, AlertCircle, Eye, EyeOff, Sparkles, TrendingUp, Users } from 'lucide-react';
import OAuthButtons from '../../components/auth/OAuthButtons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const ROLE_DASHBOARD = {
    super_admin:      '/dashboard/admin',
    founder:          '/dashboard/founder',
    investor:         '/dashboard/investor',
    incubator:        '/dashboard/incubator',
    service_provider: '/dashboard/service_provider',
    job_seeker:       '/dashboard/jobseeker',
  };

  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(from || ROLE_DASHBOARD[result.role] || '/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAFAFA] font-sans selection:bg-violet-500 selection:text-white">
      
      {/* Left Panel — Immersive Aurora Environment */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-neutral-950 flex-col justify-between p-16">
        {/* Organic Mesh Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-violet-600/30 mix-blend-screen blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-indigo-500/20 mix-blend-screen blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[20%] w-[25rem] h-[25rem] rounded-full bg-fuchsia-600/20 mix-blend-screen blur-[90px] animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }} />

        {/* Branding */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 no-underline group w-fit">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-2xl">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-white tracking-tighter">Boostr<span className="text-violet-500">.</span></span>
          </Link>
        </div>

        {/* Floating Glassmorphic Content */}
        <div className="relative z-10 w-full max-w-2xl mt-12">
          <h1 className="text-[3.5rem] leading-[1.1] font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500 tracking-tight mb-6">
            Architecting the future<br />of India's startups.
          </h1>
          <p className="text-lg text-neutral-400 font-medium max-w-lg mb-16 leading-relaxed">
            Join a curated ecosystem of visionaries. Access premium capital, elite talent, and ₹450Cr in zero-equity grants.
          </p>

          {/* Staggered Floating Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl pb-12">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-violet-500/20 rounded-lg"><Users className="w-5 h-5 text-violet-300" /></div>
                <span className="text-neutral-400 text-sm font-medium">Network</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">25.2k+</div>
              <div className="text-sm text-neutral-500 mt-1">Founders & Investors</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 sm:translate-y-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-300" /></div>
                <span className="text-neutral-400 text-sm font-medium">Capital</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">₹450Cr</div>
              <div className="text-sm text-neutral-500 mt-1">Grants Facilitated</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-lg"><Sparkles className="w-5 h-5 text-amber-300" /></div>
                <span className="text-neutral-400 text-sm font-medium">Opportunities</span>
              </div>
              <div className="text-3xl font-bold text-white tracking-tight">150+</div>
              <div className="text-sm text-neutral-500 mt-1">Active Grant Programs</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-neutral-500 text-sm font-medium">
          <span>© 2026 Boostr Inc.</span>
          <a href="#!" className="hover:text-white transition-colors">Privacy</a>
          <a href="#!" className="hover:text-white transition-colors">Terms</a>
        </div>
      </div>

      {/* Right Panel — The Minimalist Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative bg-white lg:bg-transparent shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 rounded-l-[3rem] lg:-ml-8">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-neutral-950 tracking-tighter">Boostr.</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0 mt-16 lg:mt-0">
          <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-neutral-950 tracking-tight mb-3">Welcome back.</h2>
            <p className="text-neutral-500 text-base">
              New to the ecosystem?{' '}
              <Link to="/register" className="text-violet-600 font-bold hover:text-violet-800 transition-colors underline underline-offset-4 decoration-2 decoration-violet-200 hover:decoration-violet-600">
                Create an account
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-8 flex items-start gap-3 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl p-4 text-sm text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Group */}
            <div className="space-y-2 group">
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 transition-colors group-focus-within:text-violet-600">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-neutral-400 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="founder@startup.com"
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-2xl py-4 pr-4 pl-12 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-neutral-700 transition-colors group-focus-within:text-violet-600">
                  Password
                </label>
                <a href="#!" className="text-sm text-neutral-500 font-medium hover:text-neutral-900 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-neutral-400 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-2xl py-4 pr-12 pl-12 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300 font-medium tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Premium Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 bg-neutral-950 text-white font-semibold text-base py-4 rounded-2xl overflow-hidden transition-transform duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mt-8"
            >
              {/* Button Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard 
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
            
            <OAuthButtons />
          </form>
          
        </div>
      </div>
    </div>
  );
}