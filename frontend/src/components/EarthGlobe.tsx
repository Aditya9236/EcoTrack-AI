'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Globe, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function EarthGlobe() {
  const [co2Counter, setCo2Counter] = useState(41352490124);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    warming: 1.18,
    iceMelting: 12.6,
    forestLoss: 25.8,
  });

  // User-triggered update for carbon stats and global counter
  const refreshStats = () => {
    setLoading(true);
    setTimeout(() => {
      // Increment counter slightly to simulate live tracking
      setCo2Counter(prev => prev + Math.floor(Math.random() * 85000 + 15000));
      setStats({
        warming: +(1.18 + Math.random() * 0.01).toFixed(3),
        iceMelting: +(12.6 + Math.random() * 0.2).toFixed(1),
        forestLoss: +(25.8 + Math.random() * 0.4).toFixed(1),
      });
      setLoading(false);
    }, 800);
  };

  return (
    <article className="glass-card p-6 space-y-6 relative overflow-hidden" aria-labelledby="globe-section-title">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Globe Sphere */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-pulse-glow pointer-events-none" />
          
          {/* Sphere Clip Container */}
          <div className="w-36 h-36 rounded-full overflow-hidden relative border border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.4),0_0_30px_rgba(16,185,129,0.2)] bg-slate-950">
            {/* Moving landmasses inside */}
            <svg 
              viewBox="0 0 200 100" 
              className="absolute h-full w-[200%] top-0 left-0 text-emerald-400/80 fill-current"
              style={{
                animation: 'spin-slow 16s linear infinite',
              }}
              aria-hidden="true"
            >
              {/* Landmass shapes (repeated horizontally for continuous scrolling) */}
              <path d="M10,20 Q20,10 35,25 T60,20 T80,45 T45,70 T15,50 Z M110,20 Q120,10 135,25 T160,20 T180,45 T145,70 T115,50 Z" />
              <path d="M65,40 Q75,30 85,50 T95,65 T75,80 T60,60 Z M165,40 Q175,30 185,50 T195,65 T175,80 T160,60 Z" />
              <path d="M5,75 Q15,70 25,80 T40,85 T20,95 Z M105,75 Q115,70 125,80 T140,85 T120,95 Z" />
            </svg>
            
            {/* Shading overlay overlaying the map to create 3D spherical look */}
            <div className="absolute inset-0 pointer-events-none rounded-full bg-radial-gradient" 
                 style={{
                   background: 'radial-gradient(circle at 35% 35%, transparent 35%, rgba(5,10,8,0.7) 70%, rgba(5,10,8,0.95) 100%)'
                 }}
            />
          </div>
          
          {/* Floating Eco satellite or tag */}
          <div className="absolute bottom-2 right-2 badge badge-green text-[9px] flex items-center gap-1 shadow-md">
            <Globe size={10} /> Live Earth
          </div>
        </div>

        {/* Global CO2 Ticker & Controls */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <header className="space-y-1">
            <h2 id="globe-section-title" className="text-xs font-semibold text-[#6B8F7E] uppercase tracking-widest">
              Global Environmental Clock
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {co2Counter.toLocaleString()}
              </span>
              <span className="text-xs text-[#6B8F7E] font-medium">tonnes CO₂</span>
            </div>
            <p className="text-xs text-[#6B8F7E]">
              Total global carbon dioxide emissions released into the atmosphere this year.
            </p>
          </header>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={refreshStats}
              disabled={loading}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg shadow-sm"
              aria-label="Refresh environmental parameters"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analyzing...' : 'Sync Global Stats'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Dynamic Environmental Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-[rgba(16,185,129,0.1)] pt-4 stagger">
        <div className="text-center p-2 glass-card rounded-lg border-emerald-500/10">
          <p className="text-[10px] text-[#6B8F7E] uppercase tracking-wider flex items-center justify-center gap-1">
            <ShieldAlert size={10} className="text-yellow-500" /> Warming
          </p>
          <p className="text-sm font-bold text-yellow-400 mt-1">+{stats.warming}°C</p>
          <p className="text-[9px] text-[#6B8F7E] mt-0.5">Above pre-industrial</p>
        </div>
        <div className="text-center p-2 glass-card rounded-lg border-emerald-500/10">
          <p className="text-[10px] text-[#6B8F7E] uppercase tracking-wider flex items-center justify-center gap-1">
            <AlertTriangle size={10} className="text-cyan-400" /> Arctic Ice
          </p>
          <p className="text-sm font-bold text-cyan-400 mt-1">-{stats.iceMelting}%</p>
          <p className="text-[9px] text-[#6B8F7E] mt-0.5">Decade decline rate</p>
        </div>
        <div className="text-center p-2 glass-card rounded-lg border-emerald-500/10">
          <p className="text-[10px] text-[#6B8F7E] uppercase tracking-wider flex items-center justify-center gap-1">
            <Globe size={10} className="text-emerald-400" /> Forest Loss
          </p>
          <p className="text-sm font-bold text-emerald-400 mt-1">-{stats.forestLoss}M</p>
          <p className="text-[9px] text-[#6B8F7E] mt-0.5">Hectares lost annually</p>
        </div>
      </div>
    </article>
  );
}
