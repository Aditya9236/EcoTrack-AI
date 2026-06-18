'use client';

import React from 'react';
import { Leaf, Award, Shield, User } from 'lucide-react';

interface CarbonAvatarProps {
  level: number;
  xp: number;
}

export default function CarbonAvatar({ level, xp }: CarbonAvatarProps) {
  // Determine level info
  const getAvatarInfo = () => {
    if (level <= 2) {
      return {
        title: 'Eco Beginner',
        description: 'You are just beginning your green journey. Tend to your seedling!',
        color: '#34D399',
        badge: '🌱',
        svg: (
          <g className="animate-float">
            {/* Soil */}
            <path d="M20,80 Q50,75 80,80 Q70,90 50,90 Q30,90 20,80 Z" fill="#8B5A2B" />
            {/* Sprout Stem */}
            <path d="M50,75 Q48,60 52,45" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            {/* Little Leaf */}
            <path d="M52,45 C55,35 68,38 52,48 Z" fill="#34D399" />
            <path d="M48,55 C35,48 40,38 48,50 Z" fill="#10B981" />
          </g>
        )
      };
    } else if (level <= 4) {
      return {
        title: 'Green Explorer',
        description: 'Your efforts are bearing fruit! A healthy young plant is growing.',
        color: '#10B981',
        badge: '🌿',
        svg: (
          <g className="animate-float">
            {/* Ground */}
            <path d="M15,80 Q50,75 85,80 Q75,90 50,90 Q25,90 15,80 Z" fill="#6E4720" />
            {/* Stem */}
            <path d="M50,75 Q45,55 50,30" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
            {/* Branches and Leaves */}
            <path d="M50,30 C55,18 72,20 50,35 Z" fill="#34D399" />
            <path d="M47,48 C30,40 35,28 47,42 Z" fill="#059669" />
            <path d="M50,58 C65,52 68,40 52,54 Z" fill="#34D399" />
          </g>
        )
      };
    } else if (level <= 6) {
      return {
        title: 'Climate Hero',
        description: 'You are leading by example. Your bonsai tree is in bloom!',
        color: '#22D3EE',
        badge: '🏆',
        svg: (
          <g className="animate-float">
            {/* Pot/Ground */}
            <path d="M15,80 L85,80 L75,92 L25,92 Z" fill="#1E293B" stroke="#10B981" strokeWidth="1" />
            <path d="M18,80 Q50,78 82,80 Z" fill="#4B5563" />
            {/* Main Trunk */}
            <path d="M50,80 Q44,65 52,50 T48,25" fill="none" stroke="#A16207" strokeWidth="7" strokeLinecap="round" />
            {/* Foliage */}
            <circle cx="48" cy="22" r="16" fill="#047857" opacity="0.9" />
            <circle cx="36" cy="35" r="12" fill="#065F46" opacity="0.85" />
            <circle cx="62" cy="40" r="12" fill="#10B981" opacity="0.9" />
            {/* Tiny Flowers */}
            <circle cx="45" cy="20" r="2.5" fill="#F43F5E" />
            <circle cx="38" cy="32" r="2.5" fill="#F43F5E" />
            <circle cx="58" cy="38" r="2.5" fill="#F59E0B" />
          </g>
        )
      };
    } else {
      return {
        title: 'Planet Guardian',
        description: 'Ultimate sustainability achieved! Your tree cradles the global sphere.',
        color: '#A78BFA',
        badge: '🌌',
        svg: (
          <g className="animate-float">
            {/* Trunk */}
            <path d="M50,85 L50,45" fill="none" stroke="#78350F" strokeWidth="10" strokeLinecap="round" />
            <path d="M50,55 Q35,45 30,35" fill="none" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <path d="M50,50 Q65,42 70,32" fill="none" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            {/* Foliage Canopy */}
            <circle cx="50" cy="28" r="20" fill="#10B981" opacity="0.9" />
            <circle cx="30" cy="32" r="15" fill="#047857" opacity="0.85" />
            <circle cx="70" cy="30" r="15" fill="#065F46" opacity="0.85" />
            {/* Miniature Earth resting in canopy */}
            <circle cx="50" cy="24" r="9" fill="#1D4ED8" stroke="#38BDF8" strokeWidth="1.5" />
            <path d="M47,22 Q49,20 52,21 Q54,23 52,25 T47,26 Z" fill="#22C55E" />
          </g>
        )
      };
    }
  };

  const avatar = getAvatarInfo();

  return (
    <article className="glass-card p-5 space-y-4 flex flex-col items-center text-center relative overflow-hidden" aria-labelledby="avatar-title">
      <div className="absolute top-2 right-2 flex gap-1">
        <span className="badge badge-green text-[9px]">{avatar.badge} Rank</span>
      </div>
      
      {/* Dynamic Rendered SVG Avatar */}
      <div className="w-32 h-32 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex items-center justify-center relative shadow-inner">
        <svg viewBox="0 0 100 100" className="w-28 h-28">
          {avatar.svg}
        </svg>
        <div className="absolute bottom-2 bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
          <Award size={10} className="text-yellow-400" />
          Lv. {level}
        </div>
      </div>

      <div className="space-y-1">
        <h3 id="avatar-title" className="text-base font-bold text-white flex items-center justify-center gap-1.5" style={{ color: avatar.color }}>
          {avatar.title}
        </h3>
        <p className="text-xs text-[#6B8F7E] max-w-xs leading-normal">
          {avatar.description}
        </p>
      </div>

      {/* Experience Indicator */}
      <div className="w-full space-y-1 pt-1">
        <div className="flex justify-between text-[10px] text-[#6B8F7E]">
          <span>Rank Progress</span>
          <span>{xp % 200}/200 XP</span>
        </div>
        <div className="xp-bar h-1.5 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/10">
          <div 
            className="xp-bar-fill h-full rounded-full transition-all duration-500" 
            style={{ 
              width: `${((xp % 200) / 200) * 100}%`,
              background: `linear-gradient(90deg, ${avatar.color}, #10B981)`
            }} 
          />
        </div>
      </div>
    </article>
  );
}
