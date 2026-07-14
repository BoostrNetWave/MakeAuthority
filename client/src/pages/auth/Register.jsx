import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Rocket, Mail, Lock, User as UserIcon, ArrowRight, 
  AlertCircle, Briefcase, TrendingUp, Building2, 
  ShieldCheck, CheckCircle2, Users, Sparkles
} from 'lucide-react';
import OAuthButtons from '../../components/auth/OAuthButtons';

const ROLE_OPTIONS = [
  {
    value: 'founder',
    label: 'Startup Founder',
    desc: 'Register startup, apply for grants, pitch to investors.',
    icon: Rocket,
    accent: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    activeBg: 'bg-violet-600 border-violet-600',
  },
  {
    value: 'investor',
    label: 'Investor',
    desc: 'Browse verified startups, manage dealflow.',
    icon: TrendingUp,
    accent: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    activeBg: 'bg-blue-600 border-blue-600',
  },
  {
    value: 'incubator',
    label: 'Incubator',
    desc: 'Publish accelerator programs, recruit cohorts.',
    icon: Building2,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    activeBg: 'bg-emerald-600 border-emerald-600',
  },
  {
    value: 'service_provider',
    label: 'Service Provider',
    desc: 'Offer CA, legal, or consulting services.',
    icon: ShieldCheck,
    accent: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    activeBg: 'bg-orange-600 border-orange-600',
  },
  {
    value: 'job_seeker',
    label: 'Job Seeker',
    desc: 'Discover jobs at premium Indian startups.',
    icon: Briefcase,
    accent: 'text-pink-600',
    bg: 'bg-pink-50 border-pink-200',
    activeBg: 'bg-pink-600 border-pink-600',
  }
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('founder');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !role) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    const result = await register(name, email, password, role);
    setLoading(false);
    if (result.success) {
      if (result.awaitingApproval) {
        navigate(`/pending-approval?role=${role}&email=${encodeURIComponent(email)}`);
      } else {
        const dest = {
          founder: '/dashboard/founder',
          investor: '/dashboard/investor',
          incubator: '/dashboard/incubator',
          service_provider: '/dashboard/service_provider',
          job_seeker: '/dashboard/jobseeker',
        }[result.role] || '/';
        navigate(dest, { replace: true });
      }
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
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-28 relative bg-white lg:bg-transparent shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 rounded-l-[3rem] lg:-ml-8 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="lg:hidden mt-8 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-neutral-950 tracking-tighter">Boostr.</span>
        </div>

        <div className="w-full max-w-[28rem] mx-auto lg:mx-0 py-12 lg:py-16">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-neutral-950 tracking-tight mb-3">Create account.</h2>
            <p className="text-neutral-500 text-base">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 font-bold hover:text-violet-800 transition-colors underline underline-offset-4 decoration-2 decoration-violet-200 hover:decoration-violet-600">
                Sign in
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

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-neutral-700">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-3">
                {ROLE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer ${
                        selected
                          ? 'border-violet-500 bg-violet-50/50 shadow-sm ring-4 ring-violet-500/10'
                          : 'border-neutral-200 bg-neutral-50/50 hover:border-violet-300 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${selected ? 'bg-violet-600' : 'bg-white border border-neutral-200 group-hover:border-violet-200'}`}>
                        <Icon size={18} className={selected ? 'text-white' : 'text-neutral-500 group-hover:text-violet-500'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-base font-bold transition-colors ${selected ? 'text-violet-900' : 'text-neutral-900'}`}>{opt.label}</div>
                        <div className={`text-sm mt-0.5 truncate transition-colors ${selected ? 'text-violet-600/80' : 'text-neutral-500'}`}>{opt.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected ? 'border-violet-500 bg-violet-500' : 'border-neutral-300 group-hover:border-violet-300'}`}>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-px bg-neutral-100 my-6" />

            {/* Name Input Group */}
            <div className="space-y-2 group">
              <label className="block text-sm font-semibold text-neutral-700 transition-colors group-focus-within:text-violet-600">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-4 w-5 h-5 text-neutral-400 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                <input
                  type="text" required
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Steve Jobs"
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-2xl py-4 pr-4 pl-12 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Input Group */}
            <div className="space-y-2 group">
              <label className="block text-sm font-semibold text-neutral-700 transition-colors group-focus-within:text-violet-600">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-neutral-400 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="founder@startup.com"
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-2xl py-4 pr-4 pl-12 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2 group">
              <label className="block text-sm font-semibold text-neutral-700 transition-colors group-focus-within:text-violet-600">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-neutral-400 transition-colors group-focus-within:text-violet-600 pointer-events-none" />
                <input
                  type="password" required minLength={6}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-50/50 border border-neutral-200 rounded-2xl py-4 pr-12 pl-12 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300 font-medium tracking-wide"
                />
              </div>
            </div>

            {/* Premium Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 bg-neutral-950 text-white font-semibold text-base py-4 rounded-2xl overflow-hidden transition-transform duration-300 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] mt-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account 
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
