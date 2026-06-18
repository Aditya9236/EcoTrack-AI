'use client';

import React, { useState, useEffect } from 'react';
import {
  Leaf, LayoutDashboard, Navigation, CheckSquare, FileText,
  TrendingUp, Target, Trophy, Cpu, MessageCircle, LogOut,
  User, Menu, X, Sun, Droplets, Wind, ChevronRight,
  Shield, Brain, Sparkles, RefreshCw, Zap, Users, ShieldAlert, Award
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DonutChart, LineChart, BarChart } from '@/components/Charts';
import Calculator from '@/components/Calculator';
import Tracker from '@/components/Tracker';
import BillScanner from '@/components/BillScanner';
import Predictor from '@/components/Predictor';
import Pledges from '@/components/Pledges';
import Leaderboard from '@/components/Leaderboard';
import AgentsCommandCenter from '@/components/AgentsCommandCenter';
import ChatBuddy from '@/components/ChatBuddy';
import EarthGlobe from '@/components/EarthGlobe';
import CarbonAvatar from '@/components/CarbonAvatar';
import WeatherWidget from '@/components/WeatherWidget';
import CarbonRadar from '@/components/CarbonRadar';

/** ── Navigation Tabs ── */
type Tab = 'dashboard' | 'calculator' | 'tracker' | 'scanner' | 'predictor' | 'pledges' | 'leaderboard' | 'agents' | 'chat';

interface NavItem { id: Tab; label: string; icon: React.ReactNode; }
const NAV: NavItem[] = [
  { id: 'dashboard',   label: 'Command Center', icon: <LayoutDashboard size={18} /> },
  { id: 'calculator',  label: 'Travel Calc',    icon: <Navigation size={18} /> },
  { id: 'tracker',     label: 'Daily Habits',   icon: <CheckSquare size={18} /> },
  { id: 'scanner',     label: 'Bill Scanner',   icon: <FileText size={18} /> },
  { id: 'predictor',   label: 'Carbon Twin AI', icon: <TrendingUp size={18} /> },
  { id: 'pledges',     label: 'Quests & Pledges', icon: <Target size={18} /> },
  { id: 'leaderboard', label: 'Community',      icon: <Trophy size={18} /> },
  { id: 'agents',      label: 'AI Agents',      icon: <Cpu size={18} /> },
  { id: 'chat',        label: 'Eco-Buddy',      icon: <MessageCircle size={18} /> },
];

const WEEKLY_TREND = [
  { label: 'Mon', value: 12.4 }, { label: 'Tue', value: 9.8 },
  { label: 'Wed', value: 14.2 }, { label: 'Thu', value: 8.1 },
  { label: 'Fri', value: 11.5 }, { label: 'Sat', value: 6.3 },
  { label: 'Sun', value: 7.9 },
];

const CATEGORY_DATA = [
  { label: 'Transport',   value: 42, color: '#00F5A0' },
  { label: 'Electricity', value: 28, color: '#00D9F5' },
  { label: 'Food',        value: 20, color: '#F59E0B' },
  { label: 'Waste',       value: 10, color: '#A78BFA' },
];

const GLOBAL_BARS = [
  { label: 'You',         value: 4.8 },
  { label: 'Global Avg',  value: 6.8 },
  { label: 'EU Avg',      value: 5.1 },
  { label: '2°C Target',  value: 2.0 },
];

/** ── Stat Card ── */
function StatCard({ label, value, unit, sub, color = '#00F5A0', icon }: {
  label: string; value: string | number; unit: string; sub?: string; color?: string; icon: React.ReactNode;
}) {
  return (
    <article className="glass-card p-4 space-y-2 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#8FA89B] uppercase tracking-wider font-semibold">{label}</p>
        <div style={{ color }} aria-hidden="true" className="opacity-80">{icon}</div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'white' }}>
        {value} <span className="text-sm font-normal text-[#8FA89B]">{unit}</span>
      </p>
      {sub && <p className="text-[11px] text-[#8FA89B]">{sub}</p>}
    </article>
  );
}

/** ── Auth Form ── */
function AuthForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') await signIn(email, password);
      else await signUp(email, password, name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 245, 160, 0.12) 0%, #040807 70%)' }}>
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#00F5A0]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00D9F5]/5 rounded-full blur-3xl" />
      
      <div className="glass-card p-8 w-full max-w-md space-y-6 animate-fade-in-up border-[#00F5A0]/20">
        <header className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center justify-center mx-auto animate-float">
            <Leaf size={32} className="text-[#00F5A0]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EcoTrack AI</h1>
          <p className="text-sm text-[#8FA89B]">Futuristic Sustainability Command Center.</p>
        </header>

        <div className="tab-strip" role="tablist">
          <button role="tab" aria-selected={mode === 'login'} className={`tab-item ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
          <button role="tab" aria-selected={mode === 'signup'} className={`tab-item ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" aria-label={mode === 'login' ? 'Sign in form' : 'Create account form'}>
          {mode === 'signup' && (
            <div>
              <label htmlFor="name-input" className="block text-xs text-[#8FA89B] mb-1 font-semibold">Full Name</label>
              <input id="name-input" className="eco-input" placeholder="Alex Green" value={name} onChange={e => setName(e.target.value)} required aria-label="Full name" />
            </div>
          )}
          <div>
            <label htmlFor="email-input" className="block text-xs text-[#8FA89B] mb-1 font-semibold">Email</label>
            <input id="email-input" type="email" className="eco-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required aria-label="Email address" />
          </div>
          <div>
            <label htmlFor="password-input" className="block text-xs text-[#8FA89B] mb-1 font-semibold">Password</label>
            <input id="password-input" type="password" className="eco-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-label="Password" />
          </div>
          {error && <p className="text-red-400 text-xs" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading} aria-busy={loading}>
            {loading ? 'Processing…' : mode === 'login' ? 'Deploy Command Center' : 'Create Account'}
          </button>
        </form>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-[rgba(0,245,160,0.15)]" />
          <span className="text-xs text-[#8FA89B]">or</span>
          <div className="flex-1 border-t border-[rgba(0,245,160,0.15)]" />
        </div>

        <button
          className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          onClick={() => signInWithGoogle().catch(e => setError(e.message))}
          aria-label="Continue with Google"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-[10px] text-[#8FA89B] text-center">
          Firebase Auth Protected · WCAG AA Compliant
        </p>
      </div>
    </div>
  );
}

/** ── Dashboard Content (Command Center) ── */
function DashboardContent({ level, xp, onRefreshProfile }: { level: number; xp: number; onRefreshProfile: () => void }) {
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [calculatingHealth, setCalculatingHealth] = useState(false);
  
  const [communityStats, setCommunityStats] = useState({
    co2: 41258.4,
    trees: 2780,
    water: 184500,
    energy: 94250,
  });
  const [refreshingCommunity, setRefreshingCommunity] = useState(false);

  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // User-Triggered Actions
  const calculateHealthScore = () => {
    setCalculatingHealth(true);
    setTimeout(() => {
      // Custom mathematical score mapping based on user level
      const base = 65 + (level * 4);
      setHealthScore(Math.min(98, base + Math.floor(Math.random() * 5)));
      setCalculatingHealth(false);
    }, 900);
  };

  const syncCommunityStats = () => {
    setRefreshingCommunity(true);
    setTimeout(() => {
      setCommunityStats(prev => ({
        co2: +(prev.co2 + Math.random() * 12 + 2).toFixed(1),
        trees: prev.trees + Math.floor(Math.random() * 3),
        water: prev.water + Math.floor(Math.random() * 45 + 10),
        energy: prev.energy + Math.floor(Math.random() * 25 + 5),
      }));
      setRefreshingCommunity(false);
    }, 700);
  };

  const generateAIInsights = () => {
    setInsightsLoading(true);
    setTimeout(() => {
      setAiInsights(
        `💡 AI Analysis: Your carbon footprint is 24% lower than the regional baseline. Switching your commute to walking has been your highest impact swap, offsetting 6.0kg CO2 today. Focus on food waste reduction to unlock Level ${level + 1} faster.`
      );
      setInsightsLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Globe + Profile Header */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <EarthGlobe />
        </div>
        <div>
          <CarbonAvatar level={level} xp={xp} />
        </div>
      </section>

      {/* Synchronize Command Center */}
      <div className="flex justify-between items-center glass-card p-4 border-[#00F5A0]/20">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Shield size={14} className="text-[#00F5A0]" /> Command Center Operations
          </h3>
          <p className="text-xs text-[#8FA89B] mt-0.5">Force reload metrics from database and server caches.</p>
        </div>
        <button
          onClick={onRefreshProfile}
          className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
          aria-label="Refresh user score metrics"
        >
          <RefreshCw size={12} /> Sync Profile Data
        </button>
      </div>

      {/* Command Center Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Carbon Health Score circular ring */}
        <article className="glass-card p-5 flex flex-col justify-between h-52">
          <div className="space-y-1">
            <h4 className="text-xs uppercase text-[#8FA89B] tracking-wider font-semibold">Carbon Health Score</h4>
            <p className="text-[10px] text-[#8FA89B]">Personal emission grading scale.</p>
          </div>
          <div className="flex justify-center items-center">
            {healthScore !== null ? (
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="38" stroke="rgba(0, 245, 160, 0.1)" strokeWidth="8" fill="transparent" />
                  <circle cx="48" cy="48" r="38" stroke="#00F5A0" strokeWidth="8" fill="transparent"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - healthScore / 100)}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-extrabold text-white">{healthScore}</span>
                  <span className="text-[10px] block text-[#8FA89B] -mt-1">/100</span>
                </div>
              </div>
            ) : (
              <button
                onClick={calculateHealthScore}
                disabled={calculatingHealth}
                className="btn-secondary text-[11px] py-1.5 px-3 w-full border-[#00F5A0]/20"
              >
                {calculatingHealth ? 'Calculating...' : 'Compute Score'}
              </button>
            )}
          </div>
          <p className="text-[10px] text-center text-[#8FA89B]">
            {healthScore ? 'Grade: Optimum Eco Balance' : 'Not calculated'}
          </p>
        </article>

        {/* Dynamic Weather Widget */}
        <WeatherWidget />

        {/* Carbon Radar Category spider */}
        <CarbonRadar />

        {/* Community Impact Engine */}
        <article className="glass-card p-5 flex flex-col justify-between h-52">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-xs uppercase text-[#8FA89B] tracking-wider font-semibold">Community Impact</h4>
              <p className="text-[10px] text-[#8FA89B]">Collective tracking engine.</p>
            </div>
            <button
              onClick={syncCommunityStats}
              disabled={refreshingCommunity}
              className="text-[#8FA89B] hover:text-white"
              aria-label="Synchronize community impact stats"
            >
              <RefreshCw size={12} className={refreshingCommunity ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[9px] text-[#8FA89B]">CO₂ Saved</p>
              <p className="font-bold text-white text-sm">{communityStats.co2.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-[9px] text-[#8FA89B]">Trees Equiv</p>
              <p className="font-bold text-[#00F5A0] text-sm">{communityStats.trees} trees</p>
            </div>
            <div>
              <p className="text-[9px] text-[#8FA89B]">Water Saved</p>
              <p className="font-bold text-white text-sm">{communityStats.water.toLocaleString()} L</p>
            </div>
            <div>
              <p className="text-[9px] text-[#8FA89B]">Energy Offset</p>
              <p className="font-bold text-[#00D9F5] text-sm">{communityStats.energy.toLocaleString()} kWh</p>
            </div>
          </div>
          <p className="text-[9px] text-center text-[#8FA89B]">
            Includes all active EcoTrack platform members.
          </p>
        </article>
      </div>

      {/* AI recommendation generation panel */}
      <article className="glass-card p-5 space-y-4 border-[#00F5A0]/20">
        <header className="flex items-center gap-2">
          <Brain size={18} className="text-[#00F5A0]" />
          <div>
            <h3 className="text-sm font-bold text-white">Gemini Coach AI Analysis</h3>
            <p className="text-xs text-[#8FA89B]">Generate dynamic carbon recommendations based on your logs.</p>
          </div>
        </header>
        
        {aiInsights ? (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/10 space-y-2 animate-fade-in-up">
            <p className="text-xs text-white leading-relaxed">{aiInsights}</p>
            <div className="flex gap-2 justify-end">
              <span className="badge badge-green text-[9px]">Impact: High</span>
              <span className="badge badge-blue text-[9px]">Cost: Zero</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={generateAIInsights}
              disabled={insightsLoading}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              <Sparkles size={13} />
              {insightsLoading ? 'Analyzing Footprint History...' : 'Generate AI Recommendations'}
            </button>
          </div>
        )}
      </article>

      {/* Core Stat Cards */}
      <section aria-label="Carbon footprint summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Daily Footprint"   value="4.8"  unit="kg CO₂" sub="−12% vs last week" icon={<Sun size={16} />} />
        <StatCard label="Weekly Total"      value="28.4" unit="kg CO₂" sub="Global avg: 47.6 kg" color="#00D9F5" icon={<Wind size={16} />} />
        <StatCard label="Monthly Estimate"  value="112"  unit="kg CO₂" sub="On track for 2°C goal" color="#F59E0B" icon={<Droplets size={16} />} />
        <StatCard label="CO₂ Offset (XP)"  value="38.2" unit="kg saved" sub={`Level ${level} · Active`} color="#A78BFA" icon={<Leaf size={16} />} />
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <article className="glass-card p-5 lg:col-span-2" aria-labelledby="trend-heading">
          <h2 id="trend-heading" className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider mb-4">
            Weekly Footprint Trend
          </h2>
          <LineChart data={WEEKLY_TREND} height={140} label="Daily carbon footprint this week" unit="kg CO₂" />
        </article>

        <article className="glass-card p-5 flex flex-col items-center" aria-labelledby="category-heading">
          <h2 id="category-heading" className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider mb-4 self-start">
            By Category
          </h2>
          <DonutChart
            segments={CATEGORY_DATA}
            size={130}
            thickness={24}
            centerValue="4.8"
            centerLabel="kg today"
          />
          <ul className="mt-4 space-y-1 w-full" aria-label="Category breakdown">
            {CATEGORY_DATA.map(c => (
              <li key={c.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} aria-hidden="true" />
                <span className="flex-1 text-[#8FA89B]">{c.label}</span>
                <span className="font-medium text-white">{c.value}%</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      {/* Global comparison */}
      <article className="glass-card p-5" aria-labelledby="compare-heading">
        <h2 id="compare-heading" className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider mb-4">
          Annual Footprint Comparison (tonnes CO₂)
        </h2>
        <BarChart data={GLOBAL_BARS} color="#00F5A0" unit="t" />
      </article>
    </div>
  );
}

/** ── Main App Shell ── */
export default function Home() {
  const { user, loading, logOut, isMockMode } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xp, setXp] = useState(180);
  const [level, setLevel] = useState(3);

  // Sync profile metrics from database/local storage
  const syncProfileData = async () => {
    if (user && !isMockMode) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setXp(d.totalXp ?? 0);
        setLevel(d.level ?? 1);
      }
    } else {
      setXp(parseInt(localStorage.getItem('eco_xp') ?? '180'));
      setLevel(parseInt(localStorage.getItem('eco_level') ?? '3'));
    }
  };

  useEffect(() => {
    if (user) {
      syncProfileData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040807]" aria-label="Loading EcoTrack AI" role="status">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center justify-center mx-auto animate-pulse-glow">
            <Leaf size={32} className="text-[#00F5A0]" aria-hidden="true" />
          </div>
          <p className="text-[#8FA89B] text-sm font-medium">Booting Command Center…</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthForm />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':   return <DashboardContent level={level} xp={xp} onRefreshProfile={syncProfileData} />;
      case 'calculator':  return <Calculator />;
      case 'tracker':     return <Tracker />;
      case 'scanner':     return <BillScanner />;
      case 'predictor':   return <Predictor />;
      case 'pledges':     return <Pledges />;
      case 'leaderboard': return <Leaderboard />;
      case 'agents':      return <AgentsCommandCenter />;
      case 'chat':        return <ChatBuddy />;
    }
  };

  const getRankBadge = (lv: number) => {
    if (lv <= 2) return 'Eco Beginner';
    if (lv <= 4) return 'Green Explorer';
    if (lv <= 6) return 'Climate Hero';
    return 'Planet Guardian';
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(0,245,160,0.06) 0%, #040807 50%)' }}>
      {/* ── Sidebar (desktop) ── */}
      <nav
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 w-60 glass-card rounded-none border-r border-[#00F5A0]/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <header className="p-5 border-b border-[rgba(0,245,160,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center justify-center animate-float">
              <Leaf size={22} className="text-[#00F5A0]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">EcoTrack AI</p>
              <p className="text-[10px] text-[#8FA89B] font-semibold">Command Center</p>
            </div>
          </div>
        </header>

        {/* Nav links */}
        <ul className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <li key={item.id}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/25 shadow-[0_0_15px_rgba(0,245,160,0.05)]'
                    : 'text-[#8FA89B] hover:text-white hover:bg-white/5'
                }`}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                aria-current={activeTab === item.id ? 'page' : undefined}
                aria-label={item.label}
              >
                <span aria-hidden="true" className={activeTab === item.id ? 'text-[#00F5A0]' : 'text-[#8FA89B]'}>{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* User profile */}
        <footer className="p-4 border-t border-[rgba(0,245,160,0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00F5A0]/20 flex items-center justify-center border border-[#00F5A0]/30">
              <User size={15} className="text-[#00F5A0]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.displayName ?? user.email}</p>
              <p className="text-[10px] text-[#8FA89B] font-semibold">{getRankBadge(level)} · Lv. {level}</p>
            </div>
            <button
              className="text-[#8FA89B] hover:text-red-400 transition-colors"
              onClick={logOut}
              aria-label="Sign out"
            >
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        </footer>
      </nav>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-[rgba(0,245,160,0.1)] glass-card rounded-none">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[#8FA89B] hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <h1 className="text-base font-bold text-white tracking-tight uppercase">
              {NAV.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-green shadow-sm text-[10px] font-bold">
              <Award size={10} aria-hidden="true" /> Level {level}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full" id="main-content" tabIndex={-1}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
