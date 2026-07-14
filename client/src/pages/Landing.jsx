import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, ArrowRight, Zap, Target, Users, Shield, ArrowUpRight, BarChart3, Rocket, MessageSquare, Briefcase, Bot } from 'lucide-react'

const NAV_LINKS = ['Directory', 'CRM', 'AI Assistant', 'How it Works', 'Pricing']

export default function Landing() {
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-violet-200">
      
      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-black text-xl">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Boostr
              </span>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((label) => (
                <a
                  key={label}
                  href="#!"
                  className="text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <Link to={`/dashboard/${user.role === 'super_admin' ? 'admin' : user.role}`} className="px-5 py-2.5 rounded-[10px] bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-[13px] font-bold text-gray-700 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-black text-white text-[13px] font-bold transition-all flex items-center gap-2">
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-gray-600 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 md:p-6 flex flex-col gap-4 shadow-xl">
            {NAV_LINKS.map((label) => (
              <a key={label} href="#!" className="text-base font-bold text-gray-600 hover:text-violet-600">
                {label}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            {user ? (
              <Link to={`/dashboard/${user.role === 'super_admin' ? 'admin' : user.role}`} className="text-center text-sm font-bold text-white bg-violet-600 px-5 py-3 rounded-xl mt-2">
                Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" className="text-center text-sm font-bold text-gray-600 bg-gray-50 py-3 rounded-xl border border-gray-200">Log in</Link>
                <Link to="/register" className="text-center text-sm font-bold text-white bg-gray-900 py-3 rounded-xl">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[10px] font-bold mb-8 uppercase tracking-widest">
            <Zap size={12} className="fill-violet-600" /> Introducing Boostr 2.0
          </div>
          <h1 className="text-5xl md:text-[80px] font-black text-gray-900 tracking-tighter mb-8 leading-[1.05]">
            The Ultimate OS for <br />
            <span className="text-violet-600">
              Indian Startups
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Everything you need to move from idea to IPO. Connect with investors, discover grants, hire elite talent, and manage your pipeline—all in one high-performance workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] bg-[#0F172A] hover:bg-black text-white font-bold text-[15px] transition-all flex items-center justify-center gap-2">
              Start Building <ArrowRight size={18} />
            </Link>
            <Link to="#features" className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-[15px] transition-all flex items-center justify-center gap-2">
              Explore Platform
            </Link>
          </div>

          {/* Hero Dashboard Preview (Abstracted) */}
          <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="w-full h-40 md:h-[320px] rounded-[24px] bg-white border border-gray-100 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.1)] p-4 md:p-6 md:p-4 md:p-8 flex flex-col relative overflow-hidden">
              {/* Window Controls */}
              <div className="flex gap-2 mb-8">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              
              {/* Mockup UI Content */}
              <div className="flex flex-col gap-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[100px]">
                  <div className="border border-gray-100 bg-white rounded-[20px]" />
                  <div className="border border-gray-100 bg-white rounded-[20px]" />
                  <div className="bg-[#F3E8FF] rounded-[20px]" />
                </div>
                <div className="border border-gray-100 bg-white rounded-[20px] flex-1" />
              </div>

              {/* Cover bottom rounded corner gracefully */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200">
          <div className="text-center px-4">
            <div className="text-4xl font-black text-gray-900 mb-1">5K+</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Startups</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-black text-violet-600 mb-1">1.2K</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Investors</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-black text-gray-900 mb-1">₹500Cr</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Funding Tracked</div>
          </div>
          <div className="text-center px-4">
            <div className="text-4xl font-black text-gray-900 mb-1">10K+</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jobs Posted</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
              Everything you need to scale
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              We've built a comprehensive ecosystem of tools that replace 10+ different SaaS subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-3xl p-5 md:p-10 border border-gray-100 hover:border-violet-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Target className="text-violet-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Investor Matchmaking</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Our AI analyzes your traction and pitch deck to instantly match you with investors who actively fund your sector and stage.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-3xl p-5 md:p-10 border border-gray-100 hover:border-violet-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Rocket className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Grants Database</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Access the largest database of non-dilutive government and private grants. Never miss a deadline with automated alerts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-3xl p-5 md:p-10 border border-gray-100 hover:border-violet-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Users className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Co-Founder Search</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Swipe through verified profiles of technical and business talent looking to build the next big thing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-3xl p-5 md:p-10 border border-gray-100 hover:border-violet-200 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                <Briefcase className="text-emerald-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Marketplace</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Hire vetted CAs, legal experts, UI/UX designers, and developers specifically experienced with fast-growing startups.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-3xl p-5 md:p-10 border border-gray-100 hover:border-violet-200 transition-colors group md:col-span-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest mb-6">
                    <Shield size={12} /> Enterprise Grade
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight">Built-in AI Assistant</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-6">
                    Have a question about compliance? Need to draft a pitch email? Our fine-tuned AI agent understands Indian startup law, fundraising norms, and ecosystem context.
                  </p>
                  <Link to="/register" className="inline-flex items-center gap-2 font-bold text-violet-600 hover:text-violet-700">
                    Try it now <ArrowUpRight size={18} />
                  </Link>
                </div>
                <div className="w-full md:w-64 h-48 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0"><Bot size={16} className="text-violet-600" /></div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 text-xs text-gray-600 font-medium">How much equity should I give my CTO?</div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center shrink-0"><span className="text-white text-xs font-bold">You</span></div>
                    <div className="bg-violet-600 rounded-2xl rounded-tr-none p-3 text-xs text-white font-medium">For an early-stage Indian startup, standard co-founder equity is...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-24 px-6 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-violet-600/30 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="mb-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 opacity-50"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-12">
            "Boostr completely changed how we approached our Seed round. Within 4 weeks, we were connected with 3 of our lead investors. It's the infrastructure Indian startups have been waiting for."
          </h2>
          
          <div className="flex items-center gap-4">
            <img src="https://i.pravatar.cc/150?img=32" alt="Arjun" className="w-16 h-16 rounded-full object-cover border-2 border-violet-500/30" />
            <div className="text-left">
              <div className="text-lg font-bold">Arjun Mehra</div>
              <div className="text-sm text-violet-300 font-medium">Founder & CEO, TechFlow India</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-32 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-8">
            Ready to accelerate <br/> your growth?
          </h2>
          <p className="text-xl text-gray-500 font-medium mb-12">
            Join thousands of founders who are building the future on Boostr.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg transition-all shadow-xl shadow-violet-200 flex items-center justify-center gap-2">
              Create Free Account <ArrowRight size={20} />
            </Link>
          </div>
          <p className="text-sm text-gray-400 font-medium mt-6">
            No credit card required. Setup takes 2 minutes.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 pt-20 pb-10 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-black text-xl">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Boostr
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mb-8">
              Empowering the next generation of Indian entrepreneurs with world-class capital, talent, and growth tools.
            </p>
            <div className="flex gap-4">
              <a href="#!" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-200 transition-all">in</a>
              <a href="#!" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-200 transition-all">𝕏</a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Directory', 'CRM Pipeline', 'AI Assistant', 'Pricing'].map((l) => (
                <li key={l}><a href="#!" className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Solutions</h4>
            <ul className="space-y-4">
              {['For Founders', 'For Investors', 'For Incubators', 'Enterprise'].map((l) => (
                <li key={l}><a href="#!" className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service'].map((l) => (
                <li key={l}><a href="#!" className="text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm font-bold text-gray-400">
            © 2026 Boostr Ecosystem. All rights reserved.
          </div>
          <div className="text-sm font-bold text-gray-400 mt-4 md:mt-0 flex gap-6">
            <a href="#!" className="hover:text-gray-900">Privacy</a>
            <a href="#!" className="hover:text-gray-900">Terms</a>
            <a href="#!" className="hover:text-gray-900">Security</a>
          </div>
        </div>
      </footer>
    </div>
  )
}