'use client';

import React, { useState } from 'react';
import { Award, Trophy, Flame, Users, Star, Medal, Crown, FileDown, Loader } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  badge: string;
  isCurrentUser?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  color: string;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Aisha K.',     xp: 8450, level: 12, streak: 28, badge: '🌍 Climate Guardian' },
  { rank: 2, name: 'Marco R.',     xp: 7200, level: 10, streak: 21, badge: '🌿 Forest Defender' },
  { rank: 3, name: 'Priya S.',     xp: 6850, level: 10, streak: 19, badge: '🌿 Forest Defender' },
  { rank: 4, name: 'You',          xp: 1800, level: 3,  streak: 5,  badge: '🌱 Eco Rookie', isCurrentUser: true },
  { rank: 5, name: 'Daniel W.',    xp: 1650, level: 3,  streak: 4,  badge: '🌱 Eco Rookie' },
  { rank: 6, name: 'Sofia M.',     xp: 1200, level: 2,  streak: 3,  badge: '🌱 Green Sprout' },
];

const BADGES: Badge[] = [
  { id: 'transit',    name: 'Green Commuter',    description: 'Log 3 public transit trips',     icon: '🚌', earned: true,  color: '#00F5A0' },
  { id: 'scanner',   name: 'Watt Saver',        description: 'Scan your first energy bill',    icon: '⚡', earned: true,  color: '#00D9F5' },
  { id: 'vegan',     name: 'Plant Power',        description: 'Choose plant-based 5 days',      icon: '🥗', earned: false, color: '#F59E0B' },
  { id: 'streak7',   name: '7-Day Streak',       description: 'Log in 7 consecutive days',      icon: '🔥', earned: false, color: '#FF4B4B' },
  { id: 'challenge', name: 'Challenge Champ',    description: 'Complete a weekly challenge',    icon: '🏆', earned: false, color: '#A78BFA' },
  { id: 'recycler',  name: 'Recycle Hero',       description: 'Recycle waste for 10 days',      icon: '♻️', earned: false, color: '#34D399' },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown size={18} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" aria-hidden="true" />;
  if (rank === 2) return <Medal size={18} className="text-slate-300 drop-shadow-[0_0_6px_rgba(203,213,225,0.5)]" aria-hidden="true" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600 drop-shadow-[0_0_6px_rgba(180,83,9,0.5)]" aria-hidden="true" />;
  return <span className="text-sm text-[#8FA89B] w-5 text-center font-bold">{rank}</span>;
};

export default function Leaderboard() {
  const [tab, setTab] = useState<'leaderboard' | 'badges'>('leaderboard');
  const [downloading, setDownloading] = useState(false);

  // Triggered on button click
  const triggerPDFDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print(); // Invokes the print manager utilizing the CSS @media print layout
    }, 1200);
  };

  return (
    <section aria-labelledby="leaderboard-heading" className="glass-card p-6 space-y-5">
      <header className="flex justify-between items-start">
        <div>
          <h2 id="leaderboard-heading" className="text-xl font-semibold text-[#00F5A0] flex items-center gap-2">
            <Trophy size={20} aria-hidden="true" /> Community & Achievements
          </h2>
          <p className="text-sm text-[#8FA89B] mt-1">See how you rank globally and view unlocked badges.</p>
        </div>
        
        <button
          onClick={triggerPDFDownload}
          disabled={downloading}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 border-[#00F5A0]/25 text-[#00F5A0] hover:bg-[#00F5A0]/10"
        >
          {downloading ? (
            <><Loader size={12} className="animate-spin" /> Compiling...</>
          ) : (
            <><FileDown size={12} /> Save Report PDF</>
          )}
        </button>
      </header>

      {/* Tab strip */}
      <div className="tab-strip" role="tablist" aria-label="Leaderboard sections">
        <button
          role="tab"
          aria-selected={tab === 'leaderboard'}
          className={`tab-item ${tab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setTab('leaderboard')}
        >
          <Users size={13} className="inline mr-1" aria-hidden="true" /> Leaderboard
        </button>
        <button
          role="tab"
          aria-selected={tab === 'badges'}
          className={`tab-item ${tab === 'badges' ? 'active' : ''}`}
          onClick={() => setTab('badges')}
        >
          <Award size={13} className="inline mr-1" aria-hidden="true" /> My Badges
        </button>
      </div>

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div role="tabpanel" aria-label="Global leaderboard" className="animate-fade-in-up">
          <ul className="space-y-2.5">
            {LEADERBOARD.map((entry) => (
              <li
                key={entry.rank}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  entry.isCurrentUser
                    ? 'bg-[#00F5A0]/10 border-[#00F5A0]/40 shadow-[0_0_15px_rgba(0,245,160,0.05)]'
                    : 'glass-card'
                }`}
              >
                <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(entry.rank)}</div>
                <div className="w-10 h-10 rounded-full bg-[#00F5A0]/10 border border-[#00F5A0]/25 flex items-center justify-center text-sm font-bold text-[#00F5A0] shrink-0">
                  {entry.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${entry.isCurrentUser ? 'text-[#00F5A0]' : 'text-white'}`}>
                    {entry.name} {entry.isCurrentUser && <span className="text-[11px] text-[#8FA89B] font-medium">(You)</span>}
                  </p>
                  <p className="text-[10px] text-[#8FA89B] font-semibold">{entry.badge}</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-sm font-bold text-[#00F5A0] flex items-center gap-1">
                    <Star size={11} aria-hidden="true" /> {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#8FA89B] flex items-center gap-1 justify-end font-semibold">
                    <Flame size={10} className="text-[#FF4B4B]" aria-hidden="true" /> {entry.streak}d streak
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Badges tab */}
      {tab === 'badges' && (
        <div role="tabpanel" aria-label="My earned badges" className="grid grid-cols-2 gap-3.5 animate-fade-in-up">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`glass-card p-4 text-center space-y-2 transition-all ${b.earned ? 'border-emerald-500/20' : 'opacity-35'}`}
              aria-label={`${b.name} badge — ${b.earned ? 'Earned' : 'Not yet earned'} — ${b.description}`}
            >
              <div className="text-3xl filter drop-shadow-md">{b.icon}</div>
              <p className="text-xs font-bold" style={{ color: b.earned ? b.color : '#8FA89B' }}>{b.name}</p>
              <p className="text-[10px] text-[#8FA89B] leading-normal">{b.description}</p>
              {b.earned && <span className="badge badge-green text-[9px] font-bold">Earned</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
